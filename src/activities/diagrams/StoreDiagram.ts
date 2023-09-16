import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import esriRequest from "@arcgis/core/request";

/** An interface that defines the inputs of the activity. */
interface StoreDiagramInputs {
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
     * @displayName Name
     * @description The name of the diagram to be stored.
     * @required
     */
    name: string;

    /**
     * @displayName Access
     * @description The access right level you want to set for the stored diagram.
     * @required
     */
    access:
        | "esriDiagramPublicAccess"
        | "esriDiagramProtectedAccess"
        | "esriDiagramPrivateAccess"
        | string;

    /**
     * @displayName Tag
     * @description  One or several tags that could help querying the stored diagram in an easier way afterwards.
     */
    tag?: string;

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
interface StoreDiagramOutputs {
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
 * @displayName Store Diagram
 * @description The Store Diagram operation is performed on a Diagram resource. The result of this operation is a Diagram JSON Information object,
 * and the moment the store operation happens. It is used to store the temporary network diagram resource in the database.
 * @category Utility Network
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class StoreDiagram implements IActivityHandler {
    async execute(inputs: StoreDiagramInputs): Promise<StoreDiagramOutputs> {
        const { serviceUrl, diagramId, name, access, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!diagramId) {
            throw new Error("diagramId is required");
        }
        if (!name) {
            throw new Error("name is required");
        }
        if (!access) {
            throw new Error("access is required");
        }
        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}/diagrams/${diagramId}/store`;

        const query = {
            f: "json",
            name,
            access,
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
