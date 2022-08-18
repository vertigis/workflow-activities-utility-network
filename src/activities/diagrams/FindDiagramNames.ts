import Extent from "@arcgis/core/geometry/Extent";
import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import esriRequest from "@arcgis/core/request";

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
     * @description   A set of utility network feature Global IDs, or network diagram feature Global IDs represented in a given diagram.
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
export default class FindDiagramNamesActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: FindDiagramNamesInputs
    ): Promise<FindDiagramNamesOutputs> {
        const { serviceUrl, ...other } = inputs;

        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}//findDiagramNames`;

        const query = {
            f: "json",
            ...other,
        };
        const options: any = {
            method: "post",
            query: query,
            responseType: "json",
        };
        const response = await esriRequest(url, options);
        const responseData = response.data;
        const diagramNames = responseData?.diagramNames || [];

        return {
            diagramNames,
        };
    }
}
