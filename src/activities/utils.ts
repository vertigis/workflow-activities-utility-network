import Geometry from "@arcgis/core/geometry/Geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import WebMap from "@arcgis/core/WebMap";
import Graphic from "@arcgis/core/Graphic";
import CodedValueDomain from "@arcgis/core/layers/support/CodedValueDomain";
import { project } from "./projection";
import {
    cut,
    buffer as esriBuffer,
    geodesicBuffer,
    intersect,
    rotate,
    planarLength,
    nearestCoordinate,
} from "./geometryEngineAsync";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import Polygon from "@arcgis/core/geometry/Polygon";
import Query from "@arcgis/core/rest/support/Query";
import NetworkElement from "@arcgis/core/rest/networks/support/NetworkElement";
import SubtypeSublayer from "esri/layers/support/SubtypeSublayer";
import SubtypeGroupLayer from "esri/layers/SubtypeGroupLayer";

export type LayerSet = {
    layer: FeatureLayer | SubtypeGroupLayer;
    subtypeLayer?: SubtypeSublayer;
    objectIds: number[];
    type: "feature" | "subtype-sublayer" | "string";
};

export type DomainNetworkCollection = {
    [key: string]: DomainCollection;
};
export type DomainCollection = {
    [key: string]: AssetCollection;
};
export type AssetCollection = {
    [key: string]: TypeCollection;
};
export type TypeCollection = {
    [key: string]: TypeSet;
};
export type TypeSet = {
    layerId: number;
    assets: Record<string, any>[];
};
export interface NetworkGraphic {
    graphic: Graphic;
    originGeometry: Geometry;
    globalId: string;
    layer: FeatureLayer | SubtypeGroupLayer;
    layerId: number;
    traceLocations: TraceLocation[];
    utilityNetwork: UtilityNetwork;
    assetTypeCode: number;
    assetGroupCode: number;
    domainId: number;
    sourceCode: number;
    label?: string;
}

export function createNetworkGraphic(
    point: Point,
    originGeometry: Geometry,
    attributes: Record<string, any>,
    layer: FeatureLayer | SubtypeGroupLayer,
    percentAlong: number,
    type: "starting-point" | "barrier",
    utilityNetwork: UtilityNetwork,
    isFilterBarrier?: boolean,
    terminalIds?: number[] | undefined
): NetworkGraphic | undefined {
    const globalIdKey = layer.fields.find((x) => x.type === "global-id");

    //We should never get here but just in case.
    if (!globalIdKey) {
        throw Error("No Global Id field found in feature attributes.");
    }
    const objectIdField = layer.fields.find((x) => x.type === "oid");
    if (!objectIdField) {
        throw Error("No Object Id field found in feature attributes.");
    }

    const globalId = attributes[globalIdKey.name];

    const assetTypeField = getUtilityNetworkAttributeFieldByType(
        "esriUNAUTAssetType",
        layer.layerId,
        utilityNetwork
    );

    const assetGroupField = getUtilityNetworkAttributeFieldByType(
        "esriUNAUTAssetGroup",
        layer.layerId,
        utilityNetwork
    );

    if (assetGroupField && assetTypeField) {
        const layerAssetGroupField = getKey(attributes, assetGroupField);
        const layerAssetTypeField = getKey(attributes, assetTypeField);
        if (layerAssetGroupField && layerAssetTypeField) {
            const flagPoint = point.clone();

            const graphic = new Graphic({
                geometry: flagPoint,
                attributes: attributes,
                layer: layer,
            });
            let label;
            let labelDetail = "";
            const labelDetailField = getKey(attributes, "assetid");
            if (labelDetailField) {
                labelDetail = attributes[labelDetailField];
                if (!labelDetail) {
                    labelDetail = attributes[objectIdField.name].toString();
                }
            }
            const assetTypeDomain = getCodedDomain(
                graphic,
                assetTypeField,
                layer
            );
            if (assetTypeDomain) {
                const assetTypeCode = graphic.attributes[assetTypeField];
                if (assetTypeCode) {
                    const codedVal = assetTypeDomain.getName(
                        graphic.attributes[assetTypeField] as string | number
                    );
                    if (codedVal) {
                        label = `${layer.title} (${codedVal}) : ${labelDetail}`;
                    }
                }
            } else {
                label = `${layer.title} : ${labelDetail}`;
            }
            const assetSource = getAssetSourceByLayerId(
                layer.layerId,
                utilityNetwork
            );
            if (assetSource) {
                const domainNetwork = getAssetDomain(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    assetSource.sourceId,
                    utilityNetwork
                );
                if (
                    domainNetwork &&
                    assetSource &&
                    layerAssetGroupField &&
                    layerAssetTypeField
                ) {
                    const networkGraphic = {
                        graphic: graphic,
                        originGeometry: originGeometry,
                        globalId: globalId,
                        layer: layer,
                        layerId: layer.layerId,
                        utilityNetwork: utilityNetwork,
                        domainId: domainNetwork.domainNetworkId,
                        sourceCode: assetSource.sourceId,
                        assetTypeCode: graphic.attributes[
                            layerAssetTypeField
                        ] as number,
                        assetGroupCode: graphic.attributes[
                            layerAssetGroupField
                        ] as number,
                        label: label,
                    } as NetworkGraphic;

                    if (terminalIds) {
                        const traceLocations: TraceLocation[] = [];
                        for (let i = 0; i < terminalIds.length; i++) {
                            const terminalId: number = terminalIds[i];
                            const traceLocation = new TraceLocation({
                                globalId,
                                isFilterBarrier,
                                percentAlong,
                                terminalId,
                                type,
                            });
                            traceLocations.push(traceLocation);
                        }
                        networkGraphic.traceLocations = traceLocations;
                    } else {
                        networkGraphic.traceLocations = [
                            new TraceLocation({
                                globalId,
                                isFilterBarrier,
                                percentAlong,
                                type,
                            }),
                        ];
                    }
                    return networkGraphic;
                }
            }
        }
    }
    return undefined;
}

export function getTerminalIds(
    graphic: Graphic,
    utilityNetwork: UtilityNetwork
): number[] {
    const terminalIds: number[] = [];
    const layerId = (graphic.layer as FeatureLayer | SubtypeGroupLayer).layerId;
    const assetTypeField = getUtilityNetworkAttributeFieldByType(
        "esriUNAUTAssetType",
        layerId,
        utilityNetwork
    );
    const assetGroupField = getUtilityNetworkAttributeFieldByType(
        "esriUNAUTAssetGroup",
        layerId,
        utilityNetwork
    );
    let assetType;

    if (assetTypeField && assetGroupField) {
        const layerAssetGroupField = getKey(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            graphic.attributes,
            assetGroupField
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const layerAssetTypeField = getKey(graphic.attributes, assetTypeField);
        const assetSource = getAssetSourceByLayerId(layerId, utilityNetwork);
        if (assetSource && layerAssetGroupField && layerAssetTypeField) {
            const assetGroup = getAssetGroup(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                graphic.attributes[layerAssetGroupField],
                assetSource
            );
            if (assetGroup) {
                assetType = getAssetType(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    graphic.attributes[layerAssetTypeField],
                    assetGroup
                );
            }

            if (assetType) {
                const terminalConfiguration = getTerminalConfiguration(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    assetType.terminalConfigurationId,
                    utilityNetwork
                );
                if (terminalConfiguration) {
                    for (const terminal of terminalConfiguration.terminals) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        terminalIds.push(terminal.terminalId);
                    }
                }
            }
        }
    }
    return terminalIds;
}

export async function splitPolyline(
    sourceLine: Polyline,
    flagGeom: Point
): Promise<Polyline[]> {
    let splitLines: Polyline[] = [];
    const line = sourceLine.clone();
    const projectedLine = project(line, flagGeom.spatialReference) as Polyline;
    const snappedPoint = await getPolylineIntersection(projectedLine, flagGeom);
    let buffer: Polygon;
    if (
        snappedPoint.spatialReference.isWebMercator ||
        snappedPoint.spatialReference.isWGS84
    ) {
        buffer = (await geodesicBuffer(
            snappedPoint,
            20,
            "feet" as __esri.LinearUnits
        )) as Polygon;
    } else {
        buffer = (await esriBuffer(
            snappedPoint,
            20,
            "feet" as __esri.LinearUnits
        )) as Polygon;
    }

    const polyIntersection = await intersect(projectedLine, buffer);
    if (polyIntersection) {
        const rotated = await rotate(polyIntersection, 90);
        const newGeom = await cut(projectedLine, rotated as Polyline);
        if (newGeom.length > 0) {
            splitLines = newGeom as Polyline[];
        }
    }
    return splitLines;
}

export async function getPolylineIntersection(
    sourceLine: Polyline,
    flagGeom: Point
): Promise<Point> {
    let intersectionPoint;
    const nearestCoord: __esri.NearestPointResult = await nearestCoordinate(
        sourceLine,
        flagGeom
    );
    if (nearestCoord.coordinate) {
        intersectionPoint = nearestCoord.coordinate;
    }

    return intersectionPoint;
}

export async function getPercentageAlong(
    sourceGeom: Geometry,
    flagGeom: Point
): Promise<number> {
    let percentage = 0.0;

    if (!(sourceGeom.type === "polyline")) {
        return percentage;
    } else {
        percentage = 0.5;
    }
    const sourceLine = sourceGeom as Polyline;
    const splitGeom = await splitPolyline(sourceLine, flagGeom);

    if (splitGeom.length > 0) {
        const sourceLength = await planarLength(sourceLine, "feet");

        let pieceLength;
        if (
            splitGeom[0].paths[0][0][0] === sourceLine.paths[0][0][0] &&
            splitGeom[0].paths[0][0][1] === sourceLine.paths[0][0][1]
        ) {
            pieceLength = await planarLength(splitGeom[0], "feet");
        } else {
            pieceLength = await planarLength(splitGeom[1], "feet");
        }
        percentage = pieceLength / sourceLength;
    }

    return percentage;
}

export function getAssetSourceByLayerId(
    layerId: number,
    utilityNetwork: UtilityNetwork
): Record<string, any> | undefined {
    for (const domainNetwork of utilityNetwork.dataElement.domainNetworks) {
        if (domainNetwork) {
            for (const assetSource of domainNetwork.edgeSources) {
                if (assetSource) {
                    if (assetSource.layerId === layerId) {
                        return assetSource;
                    }
                }
            }
            for (const assetSource of domainNetwork.junctionSources) {
                if (assetSource) {
                    if (assetSource) {
                        if (assetSource.layerId === layerId) {
                            return assetSource;
                        }
                    }
                }
            }
        }
    }
    return undefined;
}

export function getAssetDomain(
    assetSourceCode: number,
    utilityNetwork: UtilityNetwork
): Record<string, any> | undefined {
    for (const domainNetwork of (utilityNetwork as any).dataElement
        .domainNetworks) {
        if (domainNetwork) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const assetSource = getAssetSource(assetSourceCode, domainNetwork);
            if (assetSource) {
                return domainNetwork;
            }
        }
    }
    return undefined;
}

export function getAssetSource(
    assetSourceCode: number,
    domainNetwork: Record<string, any>
): Record<string, any> | undefined {
    for (const assetSource of domainNetwork.edgeSources) {
        if (assetSource && assetSource.sourceId === assetSourceCode) {
            return assetSource;
        }
    }
    for (const assetSource of domainNetwork.junctionSources) {
        if (assetSource && assetSource.sourceId === assetSourceCode) {
            return assetSource;
        }
    }
    return undefined;
}

export function getAssetGroup(
    assetGroupCode: number,
    assetSource: Record<string, any>
): Record<string, any> | undefined {
    for (const assetGroup of assetSource.assetGroups) {
        if (assetGroup && assetGroup.assetGroupCode === assetGroupCode) {
            return assetGroup;
        }
    }
    return undefined;
}

export function getAssetType(
    assetTypeCode: number,
    assetGroup: Record<string, any>
): Record<string, any> | undefined {
    for (const assetType of assetGroup.assetTypes) {
        if (assetType && assetType.assetTypeCode === assetTypeCode) {
            return assetType;
        }
    }
    return undefined;
}

export function getLayerIdByDomainAndSourceId(
    domainNetworkId: number,
    assetSourceId: number,
    utilityNetwork: UtilityNetwork
): number | undefined {
    const domainNetwork = (
        utilityNetwork as any
    ).dataElement.domainNetworks.find(
        (x) => x.domainNetworkId === domainNetworkId
    );
    const edgeSources = domainNetwork.edgeSources.find(
        (x) => x.sourceId === assetSourceId
    );
    if (edgeSources) {
        return edgeSources.layerId;
    }
    const junctionSources = domainNetwork.junctionSources.find(
        (x) => x.sourceId === assetSourceId
    );
    if (junctionSources) {
        return junctionSources.layerId;
    }

    return undefined;
}

export function getCodedDomain(
    graphic: Graphic,
    field: string,
    layer: FeatureLayer | SubtypeGroupLayer
): CodedValueDomain | undefined {
    let domain;

    const subtypeField = layer.sourceJSON.subtypeField;
    if (subtypeField) {
        const subTypeValue = graphic.attributes[subtypeField];
        if (subTypeValue) {
            const subType = layer.sourceJSON.subtypes.find(
                (sub) => sub.code === subTypeValue
            );
            if (subType) {
                domain = subType.domains[field];
            }
        }
    }
    if (!domain) {
        domain = domainOf(layer, field);
    }
    /* Subtypes are not instantiated CodedValueDomain objects - just JSON so
     * we need to check to ensure we return an instantiated class when it is defined
     */
    if (domain && !(domain instanceof CodedValueDomain)) {
        return CodedValueDomain.fromJSON(domain);
    }
    return domain;
}

function domainOf(
    layer: FeatureLayer | SubtypeGroupLayer,
    field: string
): CodedValueDomain | undefined {
    let domain;
    const fields = layer.fields;
    if (fields instanceof Array) {
        for (const f of fields) {
            if (f.name === field) {
                domain = f.domain as CodedValueDomain;
                if (domain !== undefined && domain !== null) {
                    const codedValues = domain.codedValues;
                    if (codedValues instanceof Array) {
                        break;
                    }
                }
            }
        }
    }
    return domain;
}

export function getKey(
    object: Record<string, unknown>,
    key: string
): string | undefined {
    return Object.keys(object).find(
        (k) => k.toLowerCase() === key.toLowerCase()
    );
}

export function getTerminalConfiguration(
    terminalConfigurationId: number,
    utilityNetwork: UtilityNetwork
): Record<string, any> | undefined {
    const dataElement = (utilityNetwork as any).dataElement;
    return dataElement.terminalConfigurations.find(
        (tc) => tc.terminalConfigurationId === terminalConfigurationId
    );
}

export async function getWebMapLayersByAssets(
    assets: NetworkElement[],
    map: WebMap,
    utilityNetwork: UtilityNetwork
): Promise<LayerSet[]> {
    const layerSets = [];
    const assetLayerMap = getAssetLayers(assets, utilityNetwork);

    for (const [layerId, assetGroups] of assetLayerMap) {
        await groupAssetTypesByWebMapLayer(
            //Object Ids can be duplicated in UN results which can bloat the request.
            [...new Set(assetGroups.map((x) => x.objectId))],
            layerId,
            map,
            layerSets
        );
    }

    return layerSets;
}

export function getAssetLayers(
    assets: NetworkElement[],
    utilityNetwork: UtilityNetwork
): Map<number, NetworkElement[]> {
    const assetLayerMap = new Map<number, NetworkElement[]>();

    for (const asset of assets) {
        const domainNetwork = getAssetDomain(
            asset.networkSourceId,
            utilityNetwork
        );
        if (domainNetwork) {
            const layerId = getLayerIdByDomainAndSourceId(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                parseInt(domainNetwork.domainNetworkId),
                asset.networkSourceId,
                utilityNetwork
            );
            if (typeof layerId === "number") {
                if (assetLayerMap.get(layerId)) {
                    assetLayerMap.get(layerId)?.push(asset);
                } else {
                    assetLayerMap.set(layerId, [asset]);
                }
            }
        }
    }

    return assetLayerMap;
}

export function groupAssets(
    assets: NetworkElement[],
    utilityNetwork: UtilityNetwork
): DomainNetworkCollection {
    const domainNetworkSet: DomainNetworkCollection = {};

    for (const asset of assets) {
        const domainNetwork = getAssetDomain(
            asset.networkSourceId,
            utilityNetwork
        );
        if (domainNetwork) {
            let domainSet: DomainCollection =
                domainNetworkSet[domainNetwork.domainNetworkId];
            if (domainSet == undefined) {
                domainSet = {};
                domainNetworkSet[domainNetwork.domainNetworkId] = domainSet;
            }
            let assetSet: AssetCollection = domainSet[asset.networkSourceId];
            if (assetSet == undefined) {
                assetSet = {};
                domainSet[asset.networkSourceId] = assetSet;
            }
            let groupSet: TypeCollection = assetSet[asset.assetGroupCode];
            if (groupSet == undefined) {
                groupSet = {};
                assetSet[asset.assetGroupCode] = groupSet;
            }
            const typeSet: TypeSet = groupSet[asset.assetTypeCode];

            if (typeSet) {
                typeSet.assets.push(asset);
            } else {
                const layerId = getLayerIdByDomainAndSourceId(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    parseInt(domainNetwork.domainNetworkId),
                    asset.networkSourceId,
                    utilityNetwork
                );
                if (typeof layerId === "number") {
                    groupSet[asset.assetTypeCode] = {
                        assets: [asset],
                        layerId,
                    };
                }
            }
        }
    }

    return domainNetworkSet;
}

async function groupAssetTypesByWebMapLayer(
    objectIds: number[],
    layerId: number,
    map: WebMap,
    layerSets: LayerSet[]
): Promise<LayerSet[]> {
    const layers = map.allLayers.filter(
        (x) =>
            x.type === "feature" &&
            (x as __esri.FeatureLayer).layerId === layerId
    ) as __esri.Collection<FeatureLayer>;

    const subTypeLayers = map.allLayers.filter(
        (x) =>
            x.type === "subtype-group" &&
            (x as __esri.SubtypeGroupLayer).layerId === layerId
    ) as __esri.Collection<SubtypeGroupLayer>;
    const tables = map.allTables.filter(
        (x) =>
            x.type === "feature" &&
            (x as __esri.FeatureLayer).layerId === layerId
    ) as __esri.Collection<FeatureLayer>;

    for (const layer of [...layers, ...subTypeLayers, ...tables]) {
        const objectIdField = layer.fields.find((x) => x.type === "oid");

        if (objectIdField) {
            if (layer.type === "subtype-group") {
                for (const sub of layer.sublayers) {
                    const subWhere = `${layer.subtypeField} = ${sub.subtypeCode}`;
                    const subFeatures = await getObjecIds(
                        layer,
                        subWhere,
                        objectIds,
                        [objectIdField.name]
                    );
                    if (subFeatures.length > 0) {
                        const subObjectIds = subFeatures.map(
                            (x) => x.attributes[objectIdField.name]
                        );
                        layerSets.push({
                            objectIds: subObjectIds,
                            layer: layer,
                            subtypeLayer: sub,
                            type: sub.type,
                        });
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        updateObjectIdArray(objectIds, subObjectIds);
                        if (objectIds.length === 0) {
                            break;
                        }
                    }
                }
            } else {
                let where = "1=1";
                if (layer.definitionExpression) {
                    where = layer.definitionExpression;
                }
                const features = await getObjecIds(layer, where, objectIds, [
                    objectIdField.name,
                ]);

                if (features.length > 0) {
                    const featObjectIds = features.map(
                        (x) => x.attributes[objectIdField.name]
                    );
                    layerSets.push({
                        objectIds: featObjectIds,
                        layer: layer,
                        type: layer.type,
                    });

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    updateObjectIdArray(objectIds, featObjectIds);
                    if (objectIds.length === 0) {
                        break;
                    }
                }
            }
        }
    }
    return layerSets;
}

function updateObjectIdArray(
    objectIds: number[],
    subSetIds: number[]
): number[] {
    for (const id of subSetIds) {
        const index = objectIds.indexOf(id, 0);
        if (index > -1) {
            objectIds.splice(index, 1);
        }
    }
    return objectIds;
}

async function getObjecIds(
    layer: FeatureLayer | SubtypeGroupLayer,
    whereClause: string,
    objectIds: number[],
    outFields: string[]
): Promise<Graphic[]> {
    const query = new Query();
    query.outFields = outFields;
    query.where = whereClause;
    query.objectIds = objectIds;
    query.returnGeometry = false;
    const featureSet = await layer.queryFeatures(query);
    return featureSet.features;
}

export async function getUtilityNetworkFromGraphic(
    utilityNetworks: UtilityNetwork[],
    graphic: Graphic
): Promise<UtilityNetwork | undefined> {
    let assetType;
    const layer = graphic.layer as FeatureLayer | SubtypeGroupLayer;
    const globalIdField = layer.fields.find((x) => x.type === "global-id");
    if (!globalIdField) {
        throw Error("No global id field found in feature attributes.");
    }
    for (const utilityNetwork of utilityNetworks) {
        const assetTypeField = getUtilityNetworkAttributeFieldByType(
            "esriUNAUTAssetType",
            layer.layerId,
            utilityNetwork
        );
        const assetGroupField = getUtilityNetworkAttributeFieldByType(
            "esriUNAUTAssetGroup",
            layer.layerId,
            utilityNetwork
        );

        if (assetGroupField && assetTypeField) {
            const layerAssetTypeField = getKey(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                graphic.attributes,
                assetTypeField
            );
            const layerAssetGroupField = getKey(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                graphic.attributes,
                assetGroupField
            );
            if (layerAssetGroupField && layerAssetTypeField) {
                for (const domainNetwork of (utilityNetwork as any).dataElement
                    .domainNetworks) {
                    if (domainNetwork) {
                        const assetSource = getAssetSource(
                            layer.layerId,
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            domainNetwork
                        );
                        if (assetSource) {
                            const assetGroup = getAssetGroup(
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                graphic.attributes[layerAssetGroupField],
                                assetSource
                            );
                            if (assetGroup) {
                                assetType = getAssetType(
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                    graphic.attributes[layerAssetTypeField],
                                    assetGroup
                                );
                                if (assetType) {
                                    const fsUrl: string = (
                                        utilityNetwork as any
                                    ).featureServiceUrl;
                                    const tempLayer = new FeatureLayer({
                                        url: `${fsUrl}/${layer.layerId}`,
                                    });
                                    const globalId: string =
                                        graphic.attributes[globalIdField.name];
                                    const query = {
                                        where: `${globalIdField.name}='${globalId}'`,
                                    };
                                    const count =
                                        await tempLayer.queryFeatureCount(
                                            query
                                        );
                                    if (count > 0) {
                                        return utilityNetwork;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return undefined;
}

export function isInTier(
    assetGroupCode: number,
    assetTypeCode: number,
    tier: Record<string, any>
): boolean {
    for (const source of tier.validDevices) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }

    for (const source of tier.validEdgeObjects) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }

    for (const source of tier.validJunctionObjectSubnetworkControllers) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }
    for (const source of tier.validJunctionObjects) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }
    for (const source of tier.validJunctions) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }
    for (const source of tier.validLines) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }
    for (const source of tier.validSubnetworkControllers) {
        if (source.assetGroupCode === assetGroupCode) {
            for (const type of source.assetTypes) {
                if (type.assetTypeCode === assetTypeCode) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getUtilityNetworkAttributeFieldByType(
    type: string,
    layerId: number,
    utilityNetwork: UtilityNetwork
): string | undefined {
    let result;
    const networkAttributes = (utilityNetwork as any).dataElement
        .networkAttributes;
    const networkAttribute = networkAttributes.find(
        (att) => att.usageType === type
    );
    if (networkAttribute) {
        const assignment = networkAttribute.assignments.find(
            (x) => x.layerId === layerId
        );
        if (assignment) {
            result = assignment.evaluator.fieldName;
        }
    }
    return result;
}
