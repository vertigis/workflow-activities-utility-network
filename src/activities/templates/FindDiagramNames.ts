import Extent from "@arcgis/core/geometry/Extent";
import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";

/** An interface that defines the inputs of the activity. */
interface FindDiagramNamesInputs {
    /**
     * @displayName Service URL
     * @description The URL to the ArcGIS REST service. For example, http://server/arcgis/rest/services/<serviceName>/NetworkDiagramServer.
     * @required
     */
    serviceUrl: string;
    /**
     * @displayName Extent
     * @description  An envelope object representing the extent that you want the network extent of the resulting diagrams to intersect.
     */
    extent?: Extent;

    /**
     * @displayName Geodatabase Version
     * @description The geodatabase version on which the operation will be performed.
     */
    where?: string;

    /**
     * @displayName Features
     * @description   A set of utility network feature Global IDs, or network diagram feature Global IDs represented in a given diagram that are included in the resulting queried diagrams.
     */
    features?: any;

    /**
     * @displayName Exclude System Diagrams
     * @description  Whether to returns all diagrams except for subnetwork system diagrams.
     */
    excludeSystemDiagrams?: boolean;

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
interface FindDiagramNamesOutputs {
    /**
     * @description An array of strings, each one corresponding to a diagram name.
     */
    diagramNames: { diagramNames: string[] };
}

/**
 * @displayName FindDiagramNames
 * @category Utility Network
 * @description This activity retrieves a set of diagrams that cover a given extent, verify a particular WHERE clause, or contain specific utility network features or diagram features.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(ChannelProvider)
export default class FindDiagramNamesActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: FindDiagramNamesInputs,
        context: IActivityContext,
        type: typeof ChannelProvider
    ): Promise<FindDiagramNamesOutputs> {
        const { serviceUrl, ...other } = inputs;

        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");

        const channel = type.create(undefined, "arcgis");
        channel.request.url = `${normalizedUrl}\\findDiagramNames`;
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
        const diagramNames =
            responseData?.diagramNames ||
            responseData?.data?.diagramNames ||
            [];

        return {
            diagramNames,
        };
    }
}
