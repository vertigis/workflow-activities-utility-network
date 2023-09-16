import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import esriRequest from "@arcgis/core/request";

/** An interface that defines the inputs of the activity. */
interface CreateDiagramFromFeaturesInputs {
    /**
     * @displayName Service URL
     * @description The URL to the ArcGIS REST service. For example, http://server/arcgis/rest/services/<serviceName>/NetworkDiagramServer.
     * @required
     */
    serviceUrl: string;

    /**
     * @displayName Global Ids
     * @description  An array of utility network features Global IDs.
     * @required
     */
    initialFeatures: string[];

    /**
     * @displayName Template
     * @description The template to apply to the diagram: Basic, ExpandContainers or CollapseContainers
     * @required
     * */
    template: "Basic" | "ExpandContainers" | "CollapseContainers" | string;

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
interface CreateDiagramFromFeaturesOutputs {
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
}

/**
 * @displayName Create Diagram From Features
 * @description Used to create a new temporary network diagram.
 * @category Utility Network
 * @clientOnly
 */
export default class CreateDiagramFromFeatures implements IActivityHandler {
    async execute(
        inputs: CreateDiagramFromFeaturesInputs
    ): Promise<CreateDiagramFromFeaturesOutputs> {
        const { serviceUrl, initialFeatures, template, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!initialFeatures) {
            throw new Error("global Ids are required");
        }
        if (!template) {
            throw new Error("template is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}/createDiagramFromFeatures`;
        const query = {
            f: "json",
            template,
            initialFeatures,
            ...other,
        };
        const body: FormData = new FormData();
        for (const key in query) {
            let val = query[key];
            if (typeof val === "object") {
                val = JSON.stringify(val);
            }
            body.append(key, val);
        }
        const options: __esri.RequestOptions = {
            body: body,
            responseType: "json",
            method: "post",
        };
        const response = await esriRequest(url, options);

        const responseData = response.data;
        const diagramInfo = responseData?.diagramInfo;

        return {
            diagramInfo,
        };
    }
}
