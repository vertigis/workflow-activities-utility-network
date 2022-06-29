import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";

/** An interface that defines the inputs of the activity. */
interface FindDiagramInfosInputs {
    /**
     * @displayName Service URL
     * @description The URL to the ArcGIS REST service. For example, http://server/arcgis/rest/services/<serviceName>/NetworkDiagramServer.
     * @required
     */
    serviceUrl: string;

    /**
     * @displayName Diagram Names
     * @description An array of strings, each one corresponding to a diagram name, for which you want to get diagram information.
     * @required
     */
    names: string[];
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
interface FindDiagramInfosOutputs {
    /**
     * @description The diagram information.
     */
    diagramInfos: any;
}

/**
 * @displayName FindDiagramInfos
 * @category Utility Network
 * @description Returns the diagram info object for each of the diagram names specified.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(ChannelProvider)
export default class FindDiagramInfosActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: FindDiagramInfosInputs,
        context: IActivityContext,
        type: typeof ChannelProvider
    ): Promise<FindDiagramInfosOutputs> {
        const { serviceUrl, names, ...other } = inputs;

        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!names) {
            throw new Error("names is required");
        }
        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");

        const channel = type.create(undefined, "arcgis");
        channel.request.url = `${normalizedUrl}\\findDiagramInfos`;
        channel.request.method = "POST";
        channel.request.json = {
            f: "json",
            diagramNames: names,
            ...other,
        };

        await channel.send();

        context.cancellationToken.finally(function () {
            channel.cancel();
        });

        const responseData =
            channel.response.payload &&
            (channel.getResponseData(channel.response.payload) as any);
        const diagramInfos =
            responseData?.diagramInfos ||
            responseData?.data?.diagramInfos ||
            [];

        return {
            diagramInfos,
        };
    }
}
