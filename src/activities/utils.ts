/* eslint-disable prettier/prettier */
import Geometry from "@arcgis/core/geometry/Geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import WebMap from "@arcgis/core/WebMap";
import Graphic from "@arcgis/core/Graphic";
import CodedValueDomain from "@arcgis/core/layers/support/CodedValueDomain";
import {
    geodesicBuffer,
    intersect,
    rotate,
    cut,
    planarLength,
    nearestCoordinate,
} from "@arcgis/core/geometry/geometryEngineAsync";
import * as Projection from "@arcgis/core/geometry/projection";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import Polygon from "@arcgis/core/geometry/Polygon";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Query from "@arcgis/core/tasks/support/Query";


export interface NetworkGraphic {
    graphic: Graphic;
    originGeometry: Geometry;
    globalId: string;
    layer: FeatureLayer;
    layerId: number;
    traceLocations: TraceLocation[];
    utilityNetwork: UtilityNetwork;
    assetTypeCode: number;
    assetGroupCode: number;
    domainId: number;
    sourceCode: number;
    selectedTraceLocation: TraceLocation | undefined;
    label?: string;
}

export function createNetworkGraphic(
    point: Point,
    originGeometry: Geometry,
    attributes: Record<string, any>,
    layer: FeatureLayer,
    percentAlong: number,
    type: "starting-point" | "barrier",
    utilityNetwork: UtilityNetwork,
    isFilterBarrier?: boolean,
    terminalIds?: number[] | undefined,

): NetworkGraphic | undefined {
    //Esri geodatabase fields have inconsistant case.  Find the name of the global id field regardless of case.
    const globalIdKey = getKey(attributes, "globalid");

    //We should never get here but just in case.
    if (!globalIdKey) {
        throw Error("No Global Id field found in feature attributes.");
    }
    const globalId = getValue(attributes, globalIdKey);
    const assetTypeField = getUtilityNetworkAttributeFieldByType("esriUNAUTAssetType", layer.layerId, utilityNetwork)
    const objectIdField = layer.objectIdField;
    const assetGroupField = getUtilityNetworkAttributeFieldByType("esriUNAUTAssetGroup", layer.layerId, utilityNetwork)

    if (assetGroupField != undefined && assetTypeField != undefined) {


        const flagPoint = point.clone();

        const graphic = new Graphic({
            geometry: flagPoint,
            attributes: attributes,
            layer: layer,
        });
        let label;

        const labelDetailField: string = getKey(attributes, "assetid");
        let labelDetail: string = attributes[labelDetailField];
        if (labelDetail == undefined || labelDetail == null) {
            labelDetail = attributes[objectIdField].toString();
        }
        //Get the coded domain value for the label.
        const assetTypeDomain = getCodedDomain(graphic, assetTypeField, layer);
        if (assetTypeDomain != undefined && assetTypeDomain != null) {
            const assetTypeCode = graphic.attributes[assetTypeField];
            if (assetTypeCode != undefined && assetTypeCode != null) {
                const codedVal = assetTypeDomain.getName(graphic.attributes[assetTypeField]);
                if (codedVal != undefined) {
                    label = `${layer.title} (${codedVal}) : ${labelDetail}`;
                }
            }
        } else {
            label = `${layer.title} : ${labelDetail}`;
        }

        const domainNetwork = getAssetDomain(graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], utilityNetwork);
        if (domainNetwork != undefined) {
            const assetSource = getAssetSource(graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], domainNetwork);
            if (assetSource != undefined) {
                const networkGraphic = {
                    graphic: graphic,
                    originGeometry: originGeometry,
                    globalId: globalId,
                    layer: layer,
                    layerId: layer.layerId,
                    utilityNetwork: utilityNetwork,
                    domainId: domainNetwork.domainNetworkId,
                    sourceCode: assetSource.sourceId,
                    assetTypeCode: graphic.attributes[assetTypeField] as number,
                    assetGroupCode: graphic.attributes[assetGroupField] as number,
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
                        })
                    ]

                }
                return networkGraphic;
            }
        }
    }
    return undefined;
}

export function getTerminalIds(graphic: Graphic, utilityNetwork: UtilityNetwork): number[] {

    const terminalIds: number[] = [];
    const assetTypeField = getUtilityNetworkAttributeFieldByType("esriUNAUTAssetType", (graphic.layer as FeatureLayer).layerId, utilityNetwork)
    const assetGroupField = getUtilityNetworkAttributeFieldByType("esriUNAUTAssetGroup", (graphic.layer as FeatureLayer).layerId, utilityNetwork)
    let assetType;
    if (assetTypeField != undefined && assetGroupField != undefined) {
        const domainNetwork = getAssetDomain(graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], utilityNetwork);
        if (domainNetwork != undefined) {
            const assetSource = getAssetSource(graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], domainNetwork);
            if (assetSource != undefined) {
                const assetGroup = getAssetGroup(graphic.attributes[assetGroupField], assetSource);
                if (assetGroup != undefined) {
                    assetType = getAssetType(graphic.attributes[assetTypeField], assetGroup);
                }

            }
        }

        if (assetType) {
            const terminalConfigurations = getTerminalConfiguration(assetType.terminalConfigurationId, utilityNetwork);
            for (const terminal of terminalConfigurations.terminals) {
                terminalIds.push(terminal.terminalId);
            };
        }
    }
    return terminalIds;
}

export function getValue(obj: Record<string, number>, prop: string): any {
    prop = prop.toString().toLowerCase();
    for (const p in obj) {
        if (
            Object.prototype.hasOwnProperty.call(obj, p) &&
            prop == p.toString().toLowerCase()
        ) {
            return obj[p];
        }
    }
    return undefined;
}
export async function splitPolyline(sourceLine: Polyline, flagGeom: Point): Promise<Polyline[]> {

    let splitLines: Polyline[] = [];
    const line = sourceLine.clone();
    const projectedLine = Projection.project(
        line,
        flagGeom.spatialReference
    ) as Polyline;
    const snappedPoint = await getPolylineIntersection(projectedLine, flagGeom);
    const buffer = (await geodesicBuffer(snappedPoint, 20, "feet")) as Polygon;
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

export async function getPolylineIntersection(sourceLine: Polyline, flagGeom: Point): Promise<Point> {
    let intersectionPoint;
    const nearestCoord = await nearestCoordinate(sourceLine, flagGeom);
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

    if (!(sourceGeom.type == "polyline")) {
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
            splitGeom[0].paths[0][0][0] == sourceLine.paths[0][0][0] &&
            splitGeom[0].paths[0][0][1] == sourceLine.paths[0][0][1]
        ) {
            pieceLength = await planarLength(splitGeom[0], "feet");
        } else {
            pieceLength = await planarLength(splitGeom[1], "feet");
        }
        percentage = pieceLength / sourceLength;
    }

    return percentage;
}

export function getAssetUtilityNetwork(assetGroupCode: number, assetTypeCode: number, utilityNetworks: UtilityNetwork[]): UtilityNetwork | undefined {
    for (const utilityNetwork of utilityNetworks) {
        const domainNetwork = getAssetDomain(assetGroupCode, assetTypeCode, utilityNetwork);
        if (domainNetwork != undefined) {
            const assetSource = getAssetSource(assetGroupCode, assetTypeCode, domainNetwork);
            if (assetSource != undefined) {
                const assetGroup = getAssetGroup(assetGroupCode, assetSource);
                if (assetGroup != undefined) {
                    const assetType = getAssetType(assetTypeCode, assetGroup);
                    if (assetType != undefined) {
                        return utilityNetwork;
                    }
                }
            }
        }
    }
    return undefined;
}


export function getAssetDomain(assetGroupCode: number, assetTypeCode: number, utilityNetwork: UtilityNetwork): any | undefined {
    for (const domainNetwork of (utilityNetwork as any).dataElement.domainNetworks) {
        if (domainNetwork != undefined) {
            const assetSource = getAssetSource(assetGroupCode, assetTypeCode, domainNetwork);
            if (assetSource != undefined) {
                const assetGroup = getAssetGroup(assetGroupCode, assetSource);
                if (assetGroup != undefined) {
                    const assetType = getAssetType(assetTypeCode, assetGroup);
                    if (assetType != undefined) {
                        return domainNetwork;
                    }
                }
            }
        }
    }
    return undefined;
}

export function getAssetSource(assetGroupCode: number, assetTypeCode: number, domainNetwork: Record<string, any>): any | undefined {
    for (const assetSource of domainNetwork.edgeSources) {
        if (assetSource != undefined) {
            const assetGroup = getAssetGroup(assetGroupCode, assetSource);
            if (assetGroup != undefined) {
                const assetType = getAssetType(assetTypeCode, assetGroup);
                if (assetType != undefined) {
                    return assetSource;
                }
            }
        }
    }
    for (const assetSource of domainNetwork.junctionSources) {
        if (assetSource != undefined) {
            const assetGroup = getAssetGroup(assetGroupCode, assetSource);
            if (assetGroup != undefined) {
                const assetType = getAssetType(assetTypeCode, assetGroup);
                if (assetType != undefined) {
                    return assetSource;
                }
            }
        }
    }
    return undefined;
}

export function getAssetGroup(assetGroupCode: number, assetSource: Record<string, any>): any | undefined {

    for (const assetGroup of assetSource.assetGroups) {
        if (assetGroup != undefined && assetGroup.assetGroupCode == assetGroupCode) {
            return assetGroup;
        }
    }
    return undefined;
}

export function getAssetType(assetTypeCode: number, assetGroup: Record<string, any>): any | undefined {
    for (const assetType of assetGroup.assetTypes) {
        if (assetType != undefined && assetType.assetTypeCode == assetTypeCode) {
            return assetType;
        }
    }
    return undefined;
}

export function getLayerIdBySourceId(assetSourceId: number, utilityNetwork: UtilityNetwork): number | undefined {
    for (const domainNetwork of (utilityNetwork as any).dataElement.domainNetworks) {
        const edgeSources = domainNetwork.edgeSources.find(x => x.sourceId === assetSourceId);
        if (edgeSources != undefined && edgeSources != null) {
            return edgeSources.layerId;
        }
        const junctionSources = domainNetwork.junctionSources.find(x => x.sourceId === assetSourceId);
        if (junctionSources != undefined && junctionSources != null) {
            return junctionSources.layerId;
        }
    }
    return undefined;
}


export function getCodedDomain(
    graphic: Graphic,
    field: string,
    layer: FeatureLayer
): CodedValueDomain | undefined {

    let domain;

    const subtypeField = layer.sourceJSON.subtypeField;
    if (subtypeField != undefined && subtypeField != null) {
        const subTypeValue = graphic.attributes[subtypeField];
        if (subTypeValue != undefined && subTypeValue != null) {
            const subType = layer.sourceJSON.subtypes.find(sub => sub.code == subTypeValue);
            if (subType != undefined && subType != null) {
                domain = subType.domains[field];
            }
        }
    }
    if (!domain) {
        domain = domainOf(layer, field);
    }
    /* Subtypes are not instantiated CodedValueDomain objects - just JSON so 
     * we need to check to ensure we return an instaiated class when it is defined
    */
    if (domain != undefined && !(domain instanceof CodedValueDomain)) {
        return CodedValueDomain.fromJSON(domain);
    }
    return domain;
}

function domainOf(layer: FeatureLayer, field: string): CodedValueDomain | undefined {
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

export function getKey(object: Record<string, unknown>, key: string): any {
    return Object.keys(object).find(
        (k) => k.toLowerCase() === key.toLowerCase()
    );
}


export function getTerminalConfiguration(terminalConfigurationId: number, utilityNetwork: UtilityNetwork): any {
    const dataElement = (utilityNetwork as any).dataElement;
    return dataElement.terminalConfigurations.find(tc => tc.terminalConfigurationId === terminalConfigurationId);
}

export async function getWebMapLayersByAssets(assets: any[], map: WebMap, utilityNetwork: UtilityNetwork): Promise<any> {
    const layerSet = {};
    const domainNetworkSet = {};

    for (const asset of assets) {
        const layerId = getLayerIdBySourceId(asset.networkSourceId, utilityNetwork);
        if (layerId != undefined) {
            const domainNetwork = getAssetDomain(asset.assetGroupCode, asset.assetTypeCode, utilityNetwork);
            if (domainNetwork != undefined) {


                let domainSet = domainNetworkSet[domainNetwork.domainNetworkId];
                if (domainSet == undefined) {
                    domainSet = {};
                    domainNetworkSet[domainNetwork.domainNetworkId] = domainSet;
                }
                let assetSet = domainSet[asset.networkSourceId];
                if (assetSet == undefined) {
                    assetSet = {};
                    domainSet[asset.networkSourceId] = assetSet;
                }
                let groupSet = assetSet[asset.assetGroupCode];
                if (groupSet == undefined) {
                    groupSet = {};
                    assetSet[asset.assetGroupCode] = groupSet;
                }
                let typeSet = groupSet[asset.assetTypeCode];
                if (typeSet == undefined) {
                    const layer = await getWebMapLayerByAsset(asset, layerId, map, utilityNetwork);
                    if (layer != undefined) {
                        const layerRef = layerSet[layer.id];
                        if (layerRef == undefined) {
                            layerSet[layer.id] = { id: layer.id, objectIds: [], layer: layer };
                        }
                        typeSet = layerSet[layer.id];
                        groupSet[asset.assetTypeCode] = typeSet;
                    }
                }
                layerSet[typeSet.id].objectIds.push(asset.objectId);
            }
        }
    }


    return layerSet;
}

export async function getWebMapLayerByAsset(asset: Record<string, any>, layerId: number, map: WebMap, utilityNetwork: UtilityNetwork): Promise<FeatureLayer | undefined> {
    const domainNetwork = getAssetDomain(asset.assetGroupCode, asset.assetTypeCode, utilityNetwork);

    if (domainNetwork != undefined) {

        const assetSource = getAssetSource(asset.assetGroupCode, asset.assetTypeCode, domainNetwork);
        if (assetSource != undefined) {
            const layers = map.layers
            for (const layer of layers) {
                let featureLayers: FeatureLayer[] = [];
                if (layer.type === "feature") {
                    featureLayers.push(layer as FeatureLayer);
                } else if (layer.type === "group") {
                    const subFeatureLayers = (layer as GroupLayer).layers.filter(x => x.type == "feature" && (x as FeatureLayer).layerId == layerId).toArray() as FeatureLayer[];
                    featureLayers = subFeatureLayers;
                }

                for (const featureLayer of featureLayers) {
                    const globalIdField = featureLayer.fields.find(x => x.name.toUpperCase() === "GLOBALID");
                    if (globalIdField != undefined && globalIdField != null) {
                        const fieldName: string = globalIdField.name;
                        const assetGlobalId: string = asset.globalId;
                        const query = new Query();
                        query.where = `${fieldName}='${assetGlobalId}'`;
                        query.returnGeometry = false;
                        const features = await featureLayer.queryFeatures(query);
                        if (features.features.length > 0) {
                            return featureLayer;
                        }
                    }
                }
            }
        }
        return undefined;
    }
}

export async function getUtilityNetworkFromGraphic(utilityNetworks: UtilityNetwork[], graphic: Graphic): Promise<UtilityNetwork | undefined> {
    let assetType;
    const layer = (graphic.layer as FeatureLayer);
    const globalIdField: string = getKey(graphic.attributes, "globalId");
    if (!globalIdField) {
        throw Error("No global id field found in feature attributes.");
    }
    for (const utilityNetwork of utilityNetworks) {
        const assetTypeField = getUtilityNetworkAttributeFieldByType("esriUNAUTAssetType", (graphic.layer as FeatureLayer).layerId, utilityNetwork)
        const assetGroupField = getUtilityNetworkAttributeFieldByType("esriUNAUTAssetGroup", (graphic.layer as FeatureLayer).layerId, utilityNetwork)
        if (assetTypeField != undefined && assetGroupField != undefined) {
            const domainNetwork = getAssetDomain(graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], utilityNetwork);
            if (domainNetwork != undefined) {
                const assetSource = getAssetSource(graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], domainNetwork);
                if (assetSource != undefined) {
                    const assetGroup = getAssetGroup(graphic.attributes[assetGroupField], assetSource);
                    if (assetGroup != undefined) {
                        assetType = getAssetType(graphic.attributes[assetTypeField], assetGroup);
                        if (assetType != undefined) {
                            const fsUrl: string = (utilityNetwork as any).featureServiceUrl;
                            const tempLayer = new FeatureLayer({
                                url: `${fsUrl}/${layer.layerId}`,
                            });
                            const globalId: string = graphic.attributes[globalIdField];
                            const query = {
                                where: `${globalIdField}='${globalId}'`,
                            };
                            const count = await tempLayer.queryFeatureCount(query);
                            if (count > 0) {
                                return utilityNetwork;
                            }

                        }
                    }

                }

            }
        }
    }

    return undefined;
}

export function isInTier(assetGroupCode: number, assetTypeCode: number, tier: Record<string, any>): boolean {
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

export function getUtilityNetworkAttributeFieldByType(type: string, layerId: number, utilityNetwork: UtilityNetwork): string | undefined {
    let result;
    const networkAttributes = (utilityNetwork as any).dataElement.networkAttributes;
    const networkAttribute = networkAttributes.find(att => att.usageType  == type);
    if (networkAttribute != undefined) {
        const assignment = networkAttribute.assignments.find(x => x.layerId == layerId);
        if (assignment != undefined) {
            result = assignment.evaluator.fieldName;
        }
    }
    return result;
}