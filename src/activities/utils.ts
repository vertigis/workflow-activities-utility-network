/* eslint-disable prettier/prettier */
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Geometry from "@arcgis/core/geometry/Geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import CodedValueDomain from "@arcgis/core/layers/support/CodedValueDomain";
import {
    geodesicBuffer,
    intersect,
    rotate,
    cut,
    planarLength,
} from "esri/geometry/geometryEngineAsync";
import * as Projection from "@arcgis/core/geometry/projection";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import Polygon from "@arcgis/core/geometry/Polygon";

export interface NetworkGraphic {
    graphic: Graphic;
    layerId: number;
    traceLocations: TraceLocation[];
    label?: string;
}

export function createNetworkGraphic(
    point: Point,
    attributes: Record<string, number>,
    layer: FeatureLayer,
    percentAlong: number,
    type: "starting-point" | "barrier",
    isFilterBarrier?: boolean,
    terminalIds?: number[] | undefined,

): NetworkGraphic {
    //Esri geodatabase fields have inconsistant case.  Find the name of the global id field regardless of case.
    const globalIdKey = getKey(attributes, "globalid");

    //We should never get here but just in case.
    if (!globalIdKey) {
        throw Error("No Global Id field found in feature attributes.");
    }
    const globalId = getValue(attributes, globalIdKey);

    //Esri geodatabase fields have inconsistant case.  Find the name of the asset type field regardless of case.
    const assetTypeField = getKey(attributes, "assettype");
    //We should never get here but just in case.
    if (!assetTypeField) {
        throw Error("No Asset Type field found in feature attributes.");
    }

    //Esri geodatabase fields have inconsistant case.  Find the name of the global id field regardless of case.
    const objectIdField = getKey(attributes, "objectId");
    //We should never get here but just in case.
    if (!objectIdField) {
        throw Error("No Object Id field found in feature attributes.");
    }
    const objectId: number = attributes[objectIdField];

    const flagPoint = Point.fromJSON(point.toJSON());

    const graphic = new Graphic({
        geometry: flagPoint,
        attributes: attributes,
        layer: layer,
    });

    let label;

    const value = getCodedDomain(layer, assetTypeField, attributes[assetTypeField]);
    if (value) {
        const labelVal:string = value.toString();
        label = `${layer.title} (${labelVal}) : ${objectId}`;
    } else {
        label = `${layer.title} : ${objectId}`;
    }

    const networkGraphic = {
        graphic: graphic,
        layerId: layer.layerId,
        label,
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

export function getTerminalIds(graphic: Graphic, utilityNetwork: UtilityNetwork): number[] {

    const terminalIds: number[] = [];
    //Esri geodatabase fields have inconsistant case.  Find the name of the asset type field regardless of case.
    const assetTypeField = getKey(graphic.attributes, "assettype");
    //We should never get here but just in case.
    if (!assetTypeField) {
        throw Error("No Asset Type field found in feature attributes.");
    }
    //Esri geodatabase fields have inconsistant case.  Find the name of the asset type field regardless of case.
    const assetGroupField = getKey(graphic.attributes, "assetgroup");
    if (!assetGroupField) {
        throw Error("No Asset Group field found in feature attributes.");
    }
    const junctionIds = (utilityNetwork as any).dataElement.domainNetworks.map(
        (dn) => {
            return dn.junctionSources.map((js) => js.layerId);
        }
    );
    const flattenedJunctionIds = flattenArrays(junctionIds);

    if (flattenedJunctionIds.find(id => id === (graphic.layer as FeatureLayer).layerId)) {
        const assetType = getAssetType((graphic.layer as FeatureLayer).layerId, graphic.attributes[assetGroupField], graphic.attributes[assetTypeField], utilityNetwork);
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
    const sourceLine = Polyline.fromJSON(sourceGeom.toJSON());

    const projectedLine = Projection.project(
        sourceLine,
        flagGeom.spatialReference
    ) as Polyline;
    const buffer = (await geodesicBuffer(flagGeom, 10, "feet")) as Polygon;
    const intersection = await intersect(projectedLine, buffer);
    if (intersection) {
        const rotated = await rotate(intersection, 90);
        const newGeom = await cut(projectedLine, rotated as Polyline);
        if (newGeom.length > 0) {
            const sourceLength = await planarLength(sourceLine, "feet");
            const lineGeom = newGeom as Polyline[];
            let pieceLength;
            if (
                lineGeom[0].paths[0][0][0] == sourceLine.paths[0][0][0] &&
                lineGeom[0].paths[0][0][1] == sourceLine.paths[0][0][1]
            ) {
                pieceLength = await planarLength(newGeom[0], "feet");
            } else {
                pieceLength = await planarLength(newGeom[1], "feet");
            }
            percentage = pieceLength / sourceLength;
        }
    }
    return percentage;
}

//create a polyline to use tor percentage along calculation
export function createPolyline(
    paths: number[][][],
    inSR: SpatialReference
): Polyline {
    const newLine = new Polyline({
        hasZ: false,
        hasM: false,
        paths: paths,
        spatialReference: inSR.clone(),
    });
    return newLine;
}

export function getNetworkLayerIds(utilityNetwork: UtilityNetwork): any[] {
    const edgeIds = (utilityNetwork as any).dataElement.domainNetworks.map(
        (dn) => {
            return dn.edgeSources.map((js) => js.layerId);
        }
    );
    const junctionIds = (utilityNetwork as any).dataElement.domainNetworks.map(
        (dn) => {
            return dn.junctionSources.map((js) => js.layerId);
        }
    );
    const flatEdgeIds = flattenArrays(edgeIds);
    const flatJunctionIds = flattenArrays(junctionIds);
    return flatJunctionIds.concat(flatEdgeIds);
}

export function flattenArrays(arr: any[]): any[] {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(
            Array.isArray(toFlatten) ? flattenArrays(toFlatten) : toFlatten
        );
    }, []);
}

export function getCodedDomainValue(
    domain: CodedValueDomain,
    code: string | number
): any {

    const codedValue = domain?.codedValues?.find((c) => {
        return c.code == code;
    });
    return codedValue?.name;
}

export function getCodedDomain(
    layer: FeatureLayer,
    field: string,
    code: string | number
): any {
    let domain = domainOf(layer, field);
    let value;
    if (!domain) {
        if (layer.types instanceof Array) {
            for (const t of layer.types) {
                const domains = t.domains;
                if (domains !== undefined && domains != null) {
                    domain = domains[field];
                    if (domain != undefined && domain != null) {
                        const codedValues = domain.codedValues;
                        if (codedValues instanceof Array) {
                            value  = getCodedDomainValue(domain, code);

                            if(value) {
                                break;
                            }
                        }
                       
                    }

                }
            }
        }
    } else {
        value  = getCodedDomainValue(domain, code);
    }
    return value;
}


export function domainOf(layer: FeatureLayer, field: string): any {
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


export function getAssetType(layerId: number, assetGroupCode: number, assetTypeCode: number, utilityNetwork: UtilityNetwork): any {

    const domainNetworks = (utilityNetwork as any).dataElement.domainNetworks;

    for (let i = 0; i < domainNetworks.length; i++) {
        const domainNetwork = domainNetworks[i];
        for (let j = 0; j < domainNetwork.junctionSources.length; j++)
            if (domainNetwork.junctionSources[j].layerId == layerId) {
                const assetGroup = domainNetwork.junctionSources[j].assetGroups.find(ag => ag.assetGroupCode === assetGroupCode);
                if (assetGroup instanceof Object) {
                    const assetType = assetGroup.assetTypes.find(at => at.assetTypeCode === assetTypeCode);
                    assetType.assetGroupName = assetGroup.assetGroupName;
                    assetType.utilityNetworkFeatureClassUsageType = domainNetwork.junctionSources[j].utilityNetworkFeatureClassUsageType;
                    if (assetType instanceof Object) return assetType;
                }
            }

        for (let j = 0; j < domainNetwork.edgeSources.length; j++)
            if (domainNetwork.edgeSources[j].layerId == layerId) {
                const assetGroup = domainNetwork.edgeSources[j].assetGroups.find(ag => ag.assetGroupCode === assetGroupCode);
                if (assetGroup instanceof Object) {
                    const assetType = assetGroup.assetTypes.find(at => at.assetTypeCode === assetTypeCode);
                    assetType.assetGroupName = assetGroup.assetGroupName;
                    assetType.utilityNetworkFeatureClassUsageType = domainNetwork.edgeSources[j].utilityNetworkFeatureClassUsageType;
                    if (assetType instanceof Object) return assetType;
                }
            }
    }

    return undefined;
}

export function getTerminalConfiguration(terminalConfigurationId: number, utilityNetwork: UtilityNetwork): any {
    const dataElement = (utilityNetwork as any).dataElement;
    return dataElement.terminalConfigurations.find(tc => tc.terminalConfigurationId === terminalConfigurationId);
}
