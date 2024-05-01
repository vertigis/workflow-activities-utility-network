import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import esriRequest from "@arcgis/core/request";

/** An interface that defines the inputs of the activity. */
interface UpdateDiagramInputs {
    /**
     * @displayName Service URL
     * @description The URL to the ArcGIS REST service. For example, http://server/arcgis/rest/services/<serviceName>/NetworkDiagramServer.
     * @required
     */
    serviceUrl: string;

    /**
     * @displayName Diagram ID
     * @description The ID of the diagram.
     * @required
     */
    diagramId: string;

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
interface UpdateDiagramOutputs {
    /**
     * @description The result of the activity.
     */
    diagramInfo: {
        tag: string;
        isStored: boolean;
        canStore: boolean;
        canExtend: boolean;
        isSystem: boolean;
        creator: string;
        creationDate: number;
        lastUpdateBy: string;
        lastUpdateDate: number;
        containerMargin: number;
        junctionCount: number;
        edgeCount: number;
        containerCount: number;
        aggregationCount: number;
        isHistorical: boolean;
        access: string;
        diagramExtent: __esri.Extent;
        networkExtent: __esri.Extent;
        name: string;
        id: string;
        template: string;
    };
    moment: number;
}

/**
 * @displayName Update Diagram
 * @description The Update Diagram operation is performed on a Diagram resource.It is used to synchronize its content from
 * the network features used to initially generate it, and so reflect any changes that may have impacted those network features into the diagram.
 * @category Utility Network
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class UpdateDiagram implements IActivityHandler {
    async execute(inputs: UpdateDiagramInputs): Promise<UpdateDiagramOutputs> {
        const { serviceUrl, diagramId, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!diagramId) {
            throw new Error("diagramId is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}/diagrams/${diagramId}/update`;

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
        const diagramInfo = responseData.diagramInfo;
        const moment = responseData.moment;

        return {
            diagramInfo,
            moment,
        };
    }
}
