/**
 * We need to handle the descrepancy between Experience Builder and VertiGIS Studio Web module exports.
 **/

import Geometry from "@arcgis/core/geometry/Geometry";
import * as projection from "@arcgis/core/geometry/projection";
import { SpatialReference } from "@arcgis/core/geometry";
import GeographicTransformation from "@arcgis/core/geometry/support/GeographicTransformation";

export function project(
    geometry: Geometry,
    outSpatialReference: SpatialReference,
    geographicTransformation?: GeographicTransformation
): Geometry | Geometry[] {
    const project =
        (projection as any).default != undefined
            ? (projection as any).default.project
            : (projection as any).project;
    return project(geometry, outSpatialReference, geographicTransformation);
}
