/**
 * We need to handle the discrepancy between Experience Builder and VertiGIS Studio Web module exports.
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
    if (projection.project) {
        return projection.project(
            geometry,
            outSpatialReference,
            geographicTransformation
        );
    } else {
        return (projection as any).default.project(
            geometry,
            outSpatialReference,
            geographicTransformation
        );
    }
}
