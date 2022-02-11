/* eslint-disable prettier/prettier */
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Geometry from "@arcgis/core/geometry/Geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import CodedValueDomain from "@arcgis/core/layers/support/CodedValueDomain";
import { geodesicBuffer, intersect, rotate, cut, planarLength } from "esri/geometry/geometryEngineAsync";
import * as Projection from "@arcgis/core/geometry/projection";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import Polygon from "@arcgis/core/geometry/Polygon";

export interface NetworkGraphic {
    graphic: Graphic;
    layerId: number;
    traceLocation: TraceLocation;
    label?: string;
}

export function createNetworkGraphic(
    point: Point,
    attributes: Record<string, number>,
    layer: FeatureLayer,
    percentAlong: number,
    type: "starting-point" | "barrier",
    isFilterBarrier?: boolean,
    terminalId?: number | undefined,
): NetworkGraphic {

    //Esri geodatabase fields have inconsistant case.  Find the name of the global id field regardless of case.
    const globalIdKey = getKey(attributes, "globalid");

    //We should never get here but just in case.
    if (!globalIdKey) {
        throw Error("No Global Id field found in feature attributes.");
    }
    const globalId = getValue(attributes, globalIdKey);

    //Esri geodatabase fields have inconsistant case.  Find the name of the global id field regardless of case.
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

    const domain = getCodedDomain(layer, assetTypeField);
    let assetCodedDomainValue = "N/A";
    if (domain) {
        const value = getCodedDomainValue(domain, attributes[assetTypeField]);
        if (value) {
            assetCodedDomainValue = value;
        }
    }

    const label = `${layer.title} - ${assetCodedDomainValue} : ${objectId}`;

    const traceLocation = new TraceLocation({
        globalId,
        isFilterBarrier,
        percentAlong,
        type,
        terminalId,
    });

    return {
        graphic: graphic,
        layerId: layer.layerId,
        traceLocation: traceLocation,
        label
    } as NetworkGraphic;
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
        SpatialReference.fromJSON({
            wkid: flagGeom.spatialReference.wkid,
        })
    ) as Polyline;
    const buffer = await geodesicBuffer(flagGeom, 10, "feet") as Polygon;
    const intersection = await intersect(projectedLine, buffer);
    if (intersection) {
        const rotated = await rotate(intersection, 90);
        const newGeom = await cut(projectedLine, rotated as Polyline);
        if (newGeom.length > 0) {
            const sourceLength = await planarLength(sourceLine, "feet");
            const lineGeom = newGeom as Polyline[];
            let pieceLength;
            if (lineGeom[0].paths[0][0][0] == sourceLine.paths[0][0][0] && lineGeom[0].paths[0][0][1] == sourceLine.paths[0][0][1]) {
                pieceLength = await planarLength(newGeom[0], "feet");
            } else {
                pieceLength            }
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
        spatialReference: SpatialReference.fromJSON({
            wkid: inSR.wkid,
        }),
    });
    return newLine;
}

export function getNetworkLayerIds(utilityNetwork: UtilityNetwork): any[] {

    const edgeIds = (utilityNetwork as any).dataElement.domainNetworks.map((dn) => {
        return dn.edgeSources.map(js => js.layerId);
    });
    const junctionIds = (utilityNetwork as any).dataElement.domainNetworks.map((dn) => {
        return dn.junctionSources.map(js => js.layerId);
    });
    const flatEdgeIds = flattenArrays(edgeIds);
    const flatJunctionIds = flattenArrays(junctionIds);
    return flatJunctionIds.concat(flatEdgeIds);
}

export function flattenArrays(arr: any[]): any[] {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flattenArrays(toFlatten) : toFlatten);
    }, []);
}


export function getCodedDomainValue(domains: CodedValueDomain[], code: string | number): any {
    const codedValueDomain = domains.find((domain) => {
        return domain.codedValues.find((cv) => {
            return cv.code == code;
        });
    });

    const codedValue = codedValueDomain?.codedValues.find((c) => {
        return c.code == code;
    });
    return codedValue?.name;
}

export function getCodedDomain(layer: FeatureLayer, field: string): CodedValueDomain[] {
    const domains = (layer.types).map((type) => {
        return type.domains[field];
    });
    return domains as CodedValueDomain[];
}

export function getKey(object: Record<string, unknown>, key: string): any {
    return Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase());
}
