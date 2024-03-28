import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import esriRequest from "@arcgis/core/request";

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
 * @displayName Get Diagram Map Info
 * @description Returns a diagram map service resource's service info.
 * @category Utility Network
 * @description This activity retrieves a set of diagrams that cover a given extent, verify a particular WHERE clause, or contain specific utility network features or diagram features.
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class GetDiagramMapInfo implements IActivityHandler {
    async execute(
        inputs: GetDiagramMapInfoInputs
    ): Promise<GetDiagramMapInfoOutputs> {
        const { serviceUrl, diagramName, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!diagramName) {
            throw new Error("diagramName is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}\\diagrams\\${diagramName}\\map`;

        const query = {
            f: "json",
            ...other,
        };
        const options: __esri.RequestOptions = {
            method: "post",
            query: query,
            responseType: "json",
        };
        const response = await esriRequest(url, options);
        const responseData = response.data;
        const result = responseData || [];

        return {
            result,
        };
    }
}
