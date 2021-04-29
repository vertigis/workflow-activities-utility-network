import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { InitializeUtilityNetworkOutputs } from ".";
import type {
    RunUtilityNetworkTraceInputs,
    RunUtilityNetworkTraceOutputs,
} from "./activities/RunUtilityNetworkTrace";

function getResponse<T>(channelProvider: ChannelProvider): T | undefined {
    // Get the content of the response
    // This includes a ".data" workaround for 4.x JSAPI responses
    const responseData =
        channelProvider.response.payload &&
        (channelProvider.getResponseData(
            channelProvider.response.payload
        ) as any);
    return (responseData as T) || (responseData?.data as T);
}

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
        throw new Error(`Unable to fetch service info`);
    }

    return response;
}

interface FeatureLayerResponse {
    systemLayers: InitializeUtilityNetworkOutputs["result"]["systemLayers"];
}

export async function getLayerInfo(
    channelProvider: ChannelProvider,
    url: string,
    utilityNetworkLayerId: number,
    cancellationToken: Promise<void>
): Promise<FeatureLayerResponse> {
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
        throw new Error(`Unable to fetch layer info`);
    }

    return response;
}

type DataElement = InitializeUtilityNetworkOutputs["result"]["dataElement"];

interface QueryDataElementsResponse {
    layerDataElements: {
        dataElement: DataElement;
    }[];
}

export async function getDataElement(
    channelProvider: ChannelProvider,
    url: string,
    utilityNetworkLayerId: number,
    cancellationToken: Promise<void>
): Promise<DataElement> {
    const channel = channelProvider.new();
    channel.request.url = `${url}/queryDataElements`;
    channel.request.method = "GET";
    channel.request.json = {
        f: "json",
        layers: `[${utilityNetworkLayerId}]`,
    };
    await channel.send();
    cancellationToken.finally(function () {
        channel.cancel();
    });

    const response = getResponse<QueryDataElementsResponse>(channel);
    if (!response) {
        throw new Error(`Unable to fetch queryDataElements`);
    }

    const dataElement = response.layerDataElements?.[0]?.dataElement;

    return dataElement;
}

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
        traceType: options.traceType,
    };
    await channel.send();
    cancellationToken.finally(function () {
        channel.cancel();
    });
    const results =
        channel.response.payload &&
        (channel.getResponseData(channel.response.payload) as any);

    return results;
}
