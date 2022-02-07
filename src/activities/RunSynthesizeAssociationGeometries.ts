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
     * @displayName Return Attachment Associations
     * @description Indicates whether to synthesize and return structural attachment associations.
     * @required
     */
    returnAttachmentAssociations: boolean;
    /**
     * @displayName Return Connectivity Associations
     * @description Indicates whether to synthesize and return connectivity associations.
     * @required
     */
    returnConnectivityAssociations: boolean;
    /**
     * @displayName Return Container Associations
     * @description Indicates whether to synthesize and return c containment associations.
     * @required
     */
    returnContainerAssociations: boolean;

    /**
     * @displayName Spatial Reference
     * @description The spatial reference that should be used to project the synthesized geometries.
     * @required
     */
    outSR: SpatialReference;
    /**
     * @displayName Max Geometry Count
     * @description A number that indicates the maximum associations that should be synthesized after which the operation should immediately return.
     * @required
     */
    maxGeometryCount: number;
}

/** An interface that defines the outputs of the activity. */
export interface RunSynthesizeAssociationGeometriesOutputs {
    /**
     * @description The association geometries result.
     */
    associations: AssociationGeometriesResult;
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
            utilityNetwork,
            extent,
            returnAttachmentAssociations,
            returnConnectivityAssociations,
            returnContainerAssociations,
            outSR,
            maxGeometryCount,
        } = inputs;
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        if (!extent) {
            throw new Error("extent is required");
        }
        if (!returnAttachmentAssociations) {
            throw new Error("returnAttachmentAssociations is required");
        }
        if (!returnConnectivityAssociations) {
            throw new Error("returnConnectivityAssociations is required");
        }
        if (!returnContainerAssociations) {
            throw new Error("returnContainerAssociations is required");
        }
        if (!maxGeometryCount) {
            throw new Error("maxGeometryCount is required");
        }
        if (!outSR) {
            throw new Error("outSR is required");
        }

        const params = new SynthesizeAssociationGeometriesParameters({
            extent,
            returnAttachmentAssociations,
            returnConnectivityAssociations,
            returnContainerAssociations,
            outSpatialReference: outSR,
            maxGeometryCount,
        });

        const associations = await synthesizeAssociationGeometries(
            utilityNetwork.networkServiceUrl,
            params
        );

        return {
            associations,
        };
    }
}
