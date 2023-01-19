import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import esriRequest from "@arcgis/core/request";

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
export default class FindDiagramInfosActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: FindDiagramInfosInputs
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
        const url = `${normalizedUrl}\\findDiagramInfos`;

        const query = {
            f: "json",
            diagramNames: names,
            ...other,
        };
        const options: __esri.RequestOptions = {
            method: "post",
            query: query,
            responseType: "json",
        };
        const response = await esriRequest(url, options);
        const responseData = response.data;
        const diagramInfos = responseData?.diagramInfos || [];

        return {
            diagramInfos,
        };
    }
}
