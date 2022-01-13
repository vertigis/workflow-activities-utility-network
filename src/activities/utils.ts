/* eslint-disable prettier/prettier */
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Geometry from "@arcgis/core/geometry/Geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import {
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    Symbol as esriSymbol,
} from "@arcgis/core/symbols";
import * as GeometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as Projection from "@arcgis/core/geometry/projection";

export interface TraceGraphic extends Graphic {
    layerId: string;
    layerTitle: string;
    startingLocationType: string;
    percentAlong: number;
}
type AttributesType = any;

export function getTraceGraphic(
    geometry: Geometry,
    symbol: __esri.Symbol,
    attributes: AttributesType,
    layerId: string,
    startingLocationType: string,
    percentAlong: number
): TraceGraphic {

    return {
        geometry: geometry,
        symbol: symbol,
        attributes: attributes,
        layerId: layerId,
        startingLocationType: startingLocationType,
        percentAlong: percentAlong,
    } as TraceGraphic;
}

export function createSymbol(type: string, color: number[], size: number):  esriSymbol
{
    let symbol: esriSymbol;


    switch (type) {
        case "multipoint":
            symbol = new SimpleMarkerSymbol({
                color: color,
                size: size,
                outline: {
                    color: color,
                    width: 0,
                },
            });

            break;

        case "point":
            symbol = new SimpleMarkerSymbol({
                color: color,
                size: size,
                outline: {
                    color: color,
                    width: 0,
                },
            });

            break;
        case "line":
            symbol = new SimpleLineSymbol({
                color: color,
                width: size,
            });

            break;
        case "polygon":
            symbol = new SimpleFillSymbol({
                color: color,
                outline: {
                    color: color,
                    width: size,
                },
            });
            break;
        default:
            symbol = new SimpleMarkerSymbol({
                color: color,
                size: size,
                outline: {
                    color: color,
                    width: 0,
                },
            });
    }
    
    return symbol;
}

export function getValue(obj: AttributesType, prop: string): any {
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

export function getPercentageAlong(
    sourceGeom: Geometry,
    flagGeom: Point
): number {
    if (!(sourceGeom.type == "polyline")) {
        return 0.0;
    }

    const sourceLine = Polyline.fromJSON(sourceGeom.toJSON());

    const projectedLine = Projection.project(
        sourceLine,
        SpatialReference.fromJSON({
            wkid: flagGeom.spatialReference.wkid,
        })
    ) as Polyline;

    const nearestCoord = GeometryEngine.nearestCoordinate(
        projectedLine,
        flagGeom
    );
    const padFlagXMin = nearestCoord.coordinate.x - 50;
    const padFlagXMax = nearestCoord.coordinate.x + 50;
    const padFlagYMin = nearestCoord.coordinate.y - 50;
    const padFlagYMax = nearestCoord.coordinate.y + 50;

    const newCoordsForLine = [
        [
            [padFlagXMin, padFlagYMin],
            [padFlagXMax, padFlagYMax],
        ],
    ];
    const flagLine = createPolyline(
        newCoordsForLine,
        flagGeom.spatialReference
    );
    const newGeom = GeometryEngine.cut(projectedLine, flagLine);
    if (newGeom.length > 0) {
        const sourceLength = GeometryEngine.planarLength(sourceLine, "feet");
        const piece1Length = GeometryEngine.planarLength(newGeom[0], "feet");
        const percentage = piece1Length / sourceLength;
        return percentage;
    } else {
        return 0.5;
    }
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
