import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import { queryDataElements, getLayerInfo, getServiceInfo } from "../request";

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
    result: {
        dataElement: {
            domainNetworks: {
                edgeSources: {
                    assetGroups: {
                        assetGroupCode: any;
                        assetGroupName: string;
                        assetTypes: {
                            assetTypeCode: any;
                            assetTypeName: string;
                            isTerminalConfigurationSupported?: boolean;
                            terminalConfigurationId?: number;
                        }[];
                    }[];
                    layerId: number;
                    shapeType: any;
                    sourceId: number;
                    utilityNetworkFeatureClassUsageType: string;
                }[];
                junctionSources: {
                    assetGroups: {
                        assetGroupCode: any;
                        assetGroupName: string;
                        assetTypes: {
                            assetTypeCode: any;
                            assetTypeName: string;
                            isTerminalConfigurationSupported?: boolean;
                            terminalConfigurationId?: number;
                        }[];
                    }[];
                    layerId: number;
                    shapeType: any;
                    sourceId: number;
                    utilityNetworkFeatureClassUsageType: string;
                }[];
                tiers: [];
            }[];
            terminalConfigurations: [];
        };
        featureServiceUrl: string;
        systemLayers: {
            dirtyAreasLayerId: number;
            lineErrorsLayerId: number;
            pointErrorsLayerId: number;
            polygonErrorsLayerId: number;
            associationsTableId: number;
            subnetworksTableId: number;
            rulesTableId: number;
            diagramEdgeLayerId: number;
            diagramJunctionLayerId: number;
            diagramContainerLayerId: number;
            temporaryDiagramEdgeLayerId: number;
            temporaryDiagramJunctionLayerId: number;
            temporaryDiagramContainerLayerId: number;
        };
        utilityNetworkLayerId: number;
        utilityNetworkUrl: string;
    };
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
        const dataElement = queryResponse.layerDataElements?.[0]?.dataElement;
        if (!dataElement) {
            throw new Error(
                `Utility Network dataElement not found in feature service ${featureServiceUrl}`
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

        return {
            result: {
                dataElement,
                featureServiceUrl,
                systemLayers,
                utilityNetworkLayerId,
                utilityNetworkUrl,
            },
        };
    }
}
