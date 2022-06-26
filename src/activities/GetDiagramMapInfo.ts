import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";

/** An interface that defines the inputs of the activity. */
interface GetDiagramMapInfoInputs {
    /**
     * @displayName Service URL
     * @description The URL to the ArcGIS REST service. For example, http://server/arcgis/rest/services/<serviceName>/NetworkDiagramServer.
     * @required
     */
    serviceUrl: string;

    /**
     * @displayName Diagram Name
     * @description The name of the diagram.
     * @required
     */
    diagramName: string;

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
}

/** An interface that defines the outputs of the activity. */
interface GetDiagramMapInfoOutputs {
    /**
     * @description The result of the activity.
     */
    result: any;
}

/**
 * @displayName GetDiagramMapInfo
 * @description Returns a diagram map service resource's service info.
 * @category Utility Network
 * @description This activity retrieves a set of diagrams that cover a given extent, verify a particular WHERE clause, or contain specific utility network features or diagram features.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(ChannelProvider)
export default class GetDiagramMapInfoActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: GetDiagramMapInfoInputs,
        context: IActivityContext,
        type: typeof ChannelProvider
    ): Promise<GetDiagramMapInfoOutputs> {
        const { serviceUrl, diagramName, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");

        const channel = type.create(undefined, "arcgis");
        channel.request.url = `${normalizedUrl}\\diagrams\\${diagramName}\\map`;
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
        const result = responseData || responseData?.data || [];

        return {
            result,
        };
    }
}
