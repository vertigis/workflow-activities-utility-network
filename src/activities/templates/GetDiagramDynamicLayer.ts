import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";

/** An interface that defines the inputs of the activity. */
interface GetDiagramDynamicLayerInputs {
    /**
     * @displayName Service URL
     * @description The URL to the ArcGIS REST service. For example, http://server/arcgis/rest/services/<serviceName>/NetworkDiagramServer.
     * @required
     */
    serviceUrl: string;
    /**
     * @displayName Diagram Name
     * @description The name of the diagram to query
     * @required
     * */
    name: string;

    /**
     * @displayName Return All Layers
     * @description  The mode to use to cache the dynamic layers for the diagram. When allLayers=true, all layers are cached whether they contain diagram features or not. When allLayers=false, only the layers that contain diagram features are cached.
     */
    allLayers?: boolean;

    /**
     * @displayName Session Id
     * @description The token (guid) used to lock the version.
     */
    sessionId?: string;
    /**
     * @displayName Geodatabase Version
     * @description The geodatabase version on which the operation will be performed.
     */
    gdbVersion?: string;

    /**
     * @displayName Moment
     * @description The date/timestamp (in UTC) to execute the trace at a given time.
     */
    moment?: number;
}

/** An interface that defines the outputs of the activity. */
interface GetDiagramDynamicLayerOutputs {
    /**
     * @description The result of the activity.
     */
    dynamicLayers: any;
}

/**
 * @displayName GetDiagramDynamicLayer
 * @category Utility Network
 * @description Returns an array of JSON object layers that describes the sublayers under the provided  diagram layer.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(ChannelProvider)
export default class GetDiagramDynamicLayerActivity
    implements IActivityHandler
{
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: GetDiagramDynamicLayerInputs,
        context: IActivityContext,
        type: typeof ChannelProvider
    ): Promise<GetDiagramDynamicLayerOutputs> {
        const { serviceUrl, name, ...other } = inputs;

        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");

        const channel = type.create(undefined, "arcgis");
        channel.request.url = `${normalizedUrl}//diagrams/${name}/dynamicLayers`;
        channel.request.method = "POST";
        channel.request.json = {
            f: "json",
            ...other,
        };

        await channel.send();

        context.cancellationToken.finally(function () {
            channel.cancel();
        });

        const responseData =
            channel.response.payload &&
            (channel.getResponseData(channel.response.payload) as any);
        const dynamicLayers =
            responseData?.dynamicLayers ||
            responseData?.data?.dynamicLayers ||
            [];

        return {
            dynamicLayers,
        };
    }
}
