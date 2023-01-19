import Extent from "@arcgis/core/geometry/Extent";
import Network from "@arcgis/core/networks/Network";
import type { IActivityHandler } from "@geocortex/workflow/runtime";
import esriRequest from "@arcgis/core/request";
import Graphic from "@arcgis/core/Graphic";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";

/** An interface that defines the inputs of the activity. */
interface ValidateNetworkTopologyInputs {
    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
    utilityNetwork: Network & UtilityNetwork;

    /**
     * @description The envelope of the area to validate.
     * @required
     */
    validateArea: Extent;

    /**
     * @description Optional parameter that specifies the type of validation to perform.
     *              The default is normal. With the repair validationType, the specified portions of the network
     *              index are reconstructed from scratch.
     */
    validationType?: "normal" | "rebuild" | "forceRebuild";

    /**
     * @description Optional parameter that specifies the set of features and objects to validate.
     */
    validationSet?: any[];

    /**
     * @description Optional Boolean parameter that returns edited features. Returned results are organized in a layer-by-layer fashion.
     *              If returnEdits is set to true, each layer may have edited features returned in an editedFeatures object.
     */
    returnEdits?: boolean;

    /**
     * @displayName Geodatabase Version
     * @description The geodatabase version on which the operation will be performed.
     */
    gdbVersion?: string;

    /**
     * @description Optional parameter specifying the token (GUID) used to lock the version.
     */
    sessionID?: string;
}

/** An interface that defines the outputs of the activity. */
interface ValidateNetworkTopologyOutputs {
    /**
     * @description The result of the activity.
     */
    result: {
        moment: number;
        fullUpdate: boolean;
        validateErrorsCreated: boolean;
        dirtyAreaCount: number;
        exceededTransferLimit: boolean; // only if returnEdits is true
        serviceEdits: [
            // only if returnEdits is true
            {
                id: number;
                editedFeatures: {
                    adds: Graphic[];
                    updates: Graphic[];
                    deletes: Graphic[];
                };
            }
        ];
        success: boolean;
    };
}

/**
 * @category Utility Network
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 * @description Validating the network topology for a utility network maintains consistency between feature editing space and network topology space. Validating a network topology may include all or a subset of the dirty areas present in the network.
 */
export default class ValidateNetworkTopology implements IActivityHandler {
    async execute(
        inputs: ValidateNetworkTopologyInputs
    ): Promise<ValidateNetworkTopologyOutputs> {
        const {
            utilityNetwork,
            validationType = "normal",
            validateArea,
            returnEdits = false,
            ...other
        } = inputs;

        if (!validateArea) {
            throw new Error("validateArea is required");
        }
        // Remove trailing slashes
        const normalizedUrl = utilityNetwork.networkServiceUrl.replace(
            /\/*$/,
            ""
        );
        const url = `${normalizedUrl}/validateNetworkTopology`;

        const query = {
            f: "json",
            validationType,
            validateArea,
            returnEdits,
            ...other,
        };
        const options: __esri.RequestOptions = {
            method: "post",
            query: query,
            responseType: "json",
        };
        const response: __esri.RequestResponse = await esriRequest(
            url,
            options
        );
        const responseData = response.data;
        return {
            result: responseData,
        };
    }
}
