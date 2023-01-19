/**
 * We need to handle the descrepancy between Experience Builder and VertiGIS Studio Web module exports.
 **/
import Geometry from "@arcgis/core/geometry/Geometry";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngineAsync";
import { Polygon } from "@arcgis/core/geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";

export async function intersect(
    geometry1: Geometry,
    geometry2: Geometry
): Promise<Geometry> {
    if (geometryEngine.intersect) {
        return geometryEngine.intersect(geometry1, geometry2);
    } else {
        return (geometryEngine as any).default.intersect(geometry1, geometry2);
    }
}

export async function geodesicBuffer(
    geometry: Geometry,
    distance: number,
    unit?: __esri.LinearUnits,
    unionResults?: boolean
): Promise<Polygon | Polygon[]> {
    if (geometryEngine.geodesicBuffer) {
        return geometryEngine.geodesicBuffer(
            geometry,
            distance,
            unit,
            unionResults
        );
    } else {
        return (geometryEngine as any).default.geodesicBuffer(
            geometry,
            distance,
            unit,
            unionResults
        );
    }
}

export async function rotate(
    geometry: Geometry,
    angle: number,
    rotationOrigin?: Point
): Promise<Geometry> {
    if (geometryEngine.rotate) {
        return geometryEngine.rotate(geometry, angle, rotationOrigin);
    } else {
        return (geometryEngine as any).default.rotate(
            geometry,
            angle,
            rotationOrigin
        );
    }
}

export async function cut(
    geometry: Geometry,
    cutter: Polyline
): Promise<Geometry[]> {
    if (geometryEngine.cut) {
        return geometryEngine.cut(geometry, cutter);
    } else {
        return (geometryEngine as any).default.cut(geometry, cutter);
    }
}

export async function nearestCoordinate(
    geometry: Geometry,
    inputPoint: Point
): Promise<__esri.NearestPointResult> {
    if (geometryEngine.nearestCoordinate) {
        return geometryEngine.nearestCoordinate(geometry, inputPoint);
    } else {
        return (geometryEngine as any).default.nearestCoordinate(
            geometry,
            inputPoint
        );
    }
}

export async function planarLength(
    geometry: Geometry,
    unit: __esri.LinearUnits
): Promise<number> {
    if (geometryEngine.planarLength) {
        return geometryEngine.planarLength(geometry, unit);
    } else {
        return (geometryEngine as any).default.nearesplanarLengthtCoordinate(
            geometry,
            unit
        );
    }
}
