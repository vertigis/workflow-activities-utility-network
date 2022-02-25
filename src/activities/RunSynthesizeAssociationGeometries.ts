import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import Network from "@arcgis/core/networks/Network";
import SynthesizeAssociationGeometriesParameters from "@arcgis/core/rest/networks/support/SynthesizeAssociationGeometriesParameters";
import Extent from "@arcgis/core/geometry/Extent";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import AssociationGeometriesResult from "@arcgis/core/rest/networks/support/AssociationGeometriesResult";
import { synthesizeAssociationGeometries } from "@arcgis/core/rest/networks/synthesizeAssociationGeometries";

/** An interface that defines the inputs of the activity. */
export interface RunSynthesizeAssociationGeometriesInputs {
    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
    utilityNetwork: Network;
    /**
     * @displayName Extent
     * @description The extent used to execute a spatial query to retrieve the associations.
     * @required
     */
    extent: Extent;
    /**
     * @displayName Max Geometry Count
     * @description A number that indicates the maximum associations that should be synthesized after which the operation should immediately return.
     * @required
     */
    maxGeometryCount: number;
    /**
     * @displayName Output Spatial Reference
     * @description The spatial reference that should be used to project the synthesized geometries.
     */
    outSR?: SpatialReference;
    /**
     * @displayName Return Attachment Associations
     * @description Indicates whether to synthesize and return structural attachment associations.
     */
    returnAttachmentAssociations?: boolean;
    /**
     * @displayName Return Connectivity Associations
     * @description Indicates whether to synthesize and return connectivity associations.
     */
    returnConnectivityAssociations?: boolean;
    /**
     * @displayName Return Container Associations
     * @description Indicates whether to synthesize and return c containment associations.
     */
    returnContainerAssociations?: boolean;
    /**
     * @displayName Geodatabase Version
     * @description The geodatabase version on which the operation will be performed.
     */
    gdbVersion?: string;
}

/** An interface that defines the outputs of the activity. */
export interface RunSynthesizeAssociationGeometriesOutputs {
    /**
     * @description The association geometries result.
     */
    result: AssociationGeometriesResult;
}

/**
 * @category Utility Network
 * @description The utility network associations model connectivity, containment, and structure relations between assets. Associations do not have a spatial presence, so this function synthesizes the assocaitions by providing an extent, and returning all associations within the extent.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-networks-synthesizeAssociationGeometries.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export class RunSynthesizeAssociationGeometries implements IActivityHandler {
    async execute(
        inputs: RunSynthesizeAssociationGeometriesInputs
    ): Promise<RunSynthesizeAssociationGeometriesOutputs> {
        const {
            extent,
            gdbVersion,
            maxGeometryCount,
            outSR,
            returnAttachmentAssociations,
            returnConnectivityAssociations,
            returnContainerAssociations,
            utilityNetwork,
        } = inputs;
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        if (!extent) {
            throw new Error("extent is required");
        }
        if (!maxGeometryCount) {
            throw new Error("maxGeometryCount is required");
        }
        if (!outSR) {
            throw new Error("outSR is required");
        }

        const params = new SynthesizeAssociationGeometriesParameters({
            extent,
            gdbVersion,
            maxGeometryCount,
            outSpatialReference: outSR,
            returnAttachmentAssociations,
            returnConnectivityAssociations,
            returnContainerAssociations,
        });

        const result = await synthesizeAssociationGeometries(
            utilityNetwork.networkServiceUrl,
            params
        );

        return {
            result,
        };
    }
}
