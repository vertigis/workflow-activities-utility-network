import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { InitializeUtilityNetworkOutputs } from ".";
import type {
    RunUtilityNetworkTraceInputs,
    RunUtilityNetworkTraceOutputs,
} from "./activities/RunUtilityNetworkTrace";

function getResponse<T>(channelProvider: ChannelProvider): T | undefined {
    // Get the content of the response
    // This includes a ".data" workaround for 4.x ArcGIS JavaScript API responses
    const responseData =
        channelProvider.response.payload &&
        (channelProvider.getResponseData(
            channelProvider.response.payload
        ) as any);
    return (responseData as T) || (responseData?.data as T);
}

/**
 * Minimal interface for the JSON response from a /FeatureServer endpoint.
 */
interface FeatureServiceResponse {
    controllerDatasetLayers?: {
        utilityNetworkLayerId: number;
    };
}

export async function getServiceInfo(
    channelProvider: ChannelProvider,
    url: string,
    cancellationToken: Promise<void>
): Promise<FeatureServiceResponse> {
    if (!url) {
        throw new Error("url is required");
    }

    const channel = channelProvider.new();
    channel.request.url = `${url}`;
    channel.request.method = "GET";
    channel.request.json = {
        f: "json",
    };

    await channel.send();

    cancellationToken.finally(function () {
        channel.cancel();
    });

    const response = getResponse<FeatureServiceResponse>(channel);
    if (!response) {
        throw new Error("Unable to perform service info request");
    }

    return response;
}

/**
 * Minimal interface for the JSON response from a /FeatureServer/<layerId> endpoint.
 */
interface FeatureLayerResponse {
    systemLayers?: InitializeUtilityNetworkOutputs["result"]["systemLayers"];
}

export async function getLayerInfo(
    channelProvider: ChannelProvider,
    url: string,
    utilityNetworkLayerId: number,
    cancellationToken: Promise<void>
): Promise<FeatureLayerResponse> {
    if (!url) {
        throw new Error("url is required");
    }

    const channel = channelProvider.new();
    channel.request.url = `${url}/${utilityNetworkLayerId}`;
    channel.request.method = "GET";
    channel.request.json = {
        f: "json",
    };
    await channel.send();
    cancellationToken.finally(function () {
        channel.cancel();
    });

    const response = getResponse<FeatureLayerResponse>(channel);
    if (!response) {
        throw new Error("Unable to perform layer info request");
    }

    return response;
}

type DataElement = InitializeUtilityNetworkOutputs["result"]["definition"];

/**
 * Minimal interface for the JSON response from a /FeatureServer/queryDataElements endpoint
 */
interface QueryDataElementsResponse {
    layerDataElements?: {
        dataElement?: DataElement;
    }[];
}

export async function queryDataElements(
    channelProvider: ChannelProvider,
    url: string,
    layerId: number,
    cancellationToken: Promise<void>
): Promise<QueryDataElementsResponse> {
    if (!url) {
        throw new Error("url is required");
    }

    const channel = channelProvider.new();
    channel.request.url = `${url}/queryDataElements`;
    channel.request.method = "GET";
    channel.request.json = {
        f: "json",
        layers: `[${layerId}]`,
    };
    await channel.send();
    cancellationToken.finally(function () {
        channel.cancel();
    });

    const response = getResponse<QueryDataElementsResponse>(channel);
    if (!response) {
        throw new Error("Unable to perform queryDataElements request");
    }

    return response;
}

/**
 * Interface for the JSON response from a /UtilityNetworkServer/trace endpoint.
 */
interface TraceResponse extends RunUtilityNetworkTraceOutputs {
    success: boolean;
    error?: {
        extendedCode: any;
        message: string;
        details: string[];
    };
}

export async function trace(
    channelProvider: ChannelProvider,
    url: string,
    options: Omit<RunUtilityNetworkTraceInputs, "test" | "serviceUrl">,
    cancellationToken: Promise<void>
): Promise<TraceResponse> {
    const channel = channelProvider.new();
    channel.request.url = `${url}/trace`;
    channel.request.method = "POST";
    channel.request.json = {
        f: "json",
        ...options,
    };
    await channel.send();
    cancellationToken.finally(function () {
        channel.cancel();
    });

    const response = getResponse<TraceResponse>(channel);
    if (!response) {
        throw new Error("Unable to perform trace request");
    }

    return response;
}
