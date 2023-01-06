/**
 * We need to handle the descrepancy between Experience Builder and VertiGIS Studio Web module exports.
 **/
import Geometry from "@arcgis/core/geometry/Geometry";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngineAsync";
import { Polygon } from "@arcgis/core/geometry";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";

export type LinearUnits =
    | "meters"
    | "feet"
    | "kilometers"
    | "miles"
    | "nautical-miles"
    | "yards"
    | number;

export interface NearestPointResult {
    /** The point geometry of the coordinate. Includes x, y, and spatialReference properties. */
    coordinate: any;

    /** The distance from the coordinate to the input point */
    distance: number;

    /** When true, the coordinate is to the right of the geometry. */
    isRightSide: boolean;

    /** The index of the coordinate. */
    vertexIndex: number;

    /** When true, the result is empty. */
    isEmpty: boolean;
}

export async function intersect(
    geometry1: Geometry,
    geometry2: Geometry
): Promise<Geometry> {
    const intersect =
        (geometryEngine as any).default != undefined
            ? (geometryEngine as any).default.intersect
            : (geometryEngine as any).intersect;
    return Promise.resolve(intersect(geometry1, geometry2));
}

export async function geodesicBuffer(
    geometry: Geometry,
    distance: number,
    unit?: LinearUnits,
    unionResults?: boolean
): Promise<Polygon | Polygon[]> {
    const geodesicBuffer =
        (geometryEngine as any).default != undefined
            ? (geometryEngine as any).default.geodesicBuffer
            : (geometryEngine as any).geodesicBuffer;
    return Promise.resolve(
        geodesicBuffer(geometry, distance, unit, unionResults)
    );
}

export async function rotate(
    geometry: Geometry,
    angle: number,
    rotationOrigin?: Point
): Promise<Geometry> {
    const rotate =
        (geometryEngine as any).default != undefined
            ? (geometryEngine as any).default.rotate
            : (geometryEngine as any).rotate;
    return Promise.resolve(rotate(geometry, angle, rotationOrigin));
}

export async function cut(
    geometry: Geometry,
    cutter: Polyline
): Promise<Geometry[]> {
    const cut =
        (geometryEngine as any).default != undefined
            ? (geometryEngine as any).default.cut
            : (geometryEngine as any).cut;
    return Promise.resolve(cut(geometry, cutter));
}

export async function nearestCoordinate(
    geometry: Geometry,
    inputPoint: Point
): Promise<NearestPointResult> {
    const nearestCoordinate =
        (geometryEngine as any).default != undefined
            ? (geometryEngine as any).default.nearestCoordinate
            : (geometryEngine as any).nearestCoordinate;
    return Promise.resolve(nearestCoordinate(geometry, inputPoint));
}

export async function planarLength(
    geometry: Geometry,
    unit: LinearUnits
): Promise<number> {
    const planarLength =
        (geometryEngine as any).default != undefined
            ? (geometryEngine as any).default.planarLength
            : (geometryEngine as any).planarLength;
    return Promise.resolve(planarLength(geometry, unit));
}
