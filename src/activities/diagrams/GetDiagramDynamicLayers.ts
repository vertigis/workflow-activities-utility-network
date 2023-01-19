import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import esriRequest from "@arcgis/core/request";

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
export default class GetDiagramDynamicLayerActivity
    implements IActivityHandler
{
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: GetDiagramDynamicLayerInputs
    ): Promise<GetDiagramDynamicLayerOutputs> {
        const { serviceUrl, name, ...other } = inputs;

        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!name) {
            throw new Error("name is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}//diagrams/${name}/dynamicLayers`;

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
        const dynamicLayers = responseData?.dynamicLayers || [];

        return {
            dynamicLayers,
        };
    }
}
