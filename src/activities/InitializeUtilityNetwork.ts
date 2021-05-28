import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import { queryDataElements, getLayerInfo, getServiceInfo } from "../request";
import { UtilityNetwork } from "../model/UtilityNetwork";

/** An interface that defines the inputs of the activity. */
export interface InitializeUtilityNetworkInputs {
    /**
     * @displayName Service URL
     * @description The URL to the Feature Service that provides the Utility Network.
     * @required
     */
    serviceUrl: string;
}

/** An interface that defines the outputs of the activity. */
export interface InitializeUtilityNetworkOutputs {
    /**
     * @description The initialized Utility Network.
     */
    result: UtilityNetwork;
}

/**
 * @category Utility Network
 * @description Initializes the Utility Network from the given feature service.
 * @helpUrl https://developers.arcgis.com/rest/services-reference/appendix-working-with-the-feature-server-utility-network-server-.htm
 * @clientOnly
 * @unsupportedApps GMV
 */
@activate(ChannelProvider)
export class InitializeUtilityNetwork implements IActivityHandler {
    async execute(
        inputs: InitializeUtilityNetworkInputs,
        context: IActivityContext,
        type: typeof ChannelProvider
    ): Promise<InitializeUtilityNetworkOutputs> {
        const { serviceUrl } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }

        // Remove trailing slashes
        const featureServiceUrl = serviceUrl.replace(/\/*$/, "");

        const channel = type.create(undefined, "arcgis");

        // Get the service metadata
        const serviceInfo = await getServiceInfo(
            channel.new(),
            featureServiceUrl,
            context.cancellationToken
        );

        // Get the utilityNetworkLayerId from the response
        const utilityNetworkLayerId =
            serviceInfo?.controllerDatasetLayers?.utilityNetworkLayerId;
        if (typeof utilityNetworkLayerId !== "number") {
            throw new Error(
                `Utility Network not found in feature service ${featureServiceUrl}`
            );
        }

        // Get the data element that describes the utility network
        const queryResponse = await queryDataElements(
            channel.new(),
            featureServiceUrl,
            utilityNetworkLayerId,
            context.cancellationToken
        );
        const definition = queryResponse.layerDataElements?.[0]?.dataElement;
        if (!definition) {
            throw new Error(
                `Utility Network definition dataElement not found in feature service ${featureServiceUrl}`
            );
        }

        // Get the layer metadata of the utility network layer
        const layerInfo = await getLayerInfo(
            channel.new(),
            featureServiceUrl,
            utilityNetworkLayerId,
            context.cancellationToken
        );

        if (!layerInfo.systemLayers) {
            throw new Error(
                `Utility Network systemLayers not found in feature service ${featureServiceUrl}`
            );
        }

        // Get the systemLayers from the response
        const systemLayers = layerInfo.systemLayers;

        const utilityNetworkUrl = featureServiceUrl.replace(
            /\/FeatureServer$/,
            "/UtilityNetworkServer"
        );

        const utilityNetwork = new UtilityNetwork(
            definition,
            featureServiceUrl,
            systemLayers,
            utilityNetworkLayerId,
            utilityNetworkUrl
        );

        return {
            result: utilityNetwork,
        };
    }
}
