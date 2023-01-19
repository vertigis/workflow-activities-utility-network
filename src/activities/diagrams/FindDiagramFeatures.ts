import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import esriRequest from "@arcgis/core/request";

/** An interface that defines the inputs of the activity. */
interface FindDiagramFeaturesInputs {
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
     * @displayName fromFeatures
     * @description  Aan array of utility network feature Global IDs.
     * @required
     */
    fromFeatures: string[];

    /**
     * @displayName fromDiagram
     * @description
     */
    fromDiagram?: string;

    /**
     * @displayName includeAggregations
     * @description   Case#1—When the fromFeatures reference utility network feature Global IDs
     * True—The operation returns the diagram features that strictly represent those utility network features in the diagram resource, and the diagram features that are associated with those utility network features but not represented in the diagram resource where they are reduced or collapsed.
     * False—The operation only returns the diagram features associated with those utility network features that are not reduced nor collapsed in the diagram resource; that is, it only returns the diagram features associated with those utility network features that are visibly represented in the diagram resource.
     * Case#2—When the fromFeatures reference diagram feature Global IDs represented in another diagram
     * True—The operation returns the diagram features associated with the same utility network features those diagram features are, whether those features are reduced or collapsed in this other diagram and/or in the resource diagram.
     * False—The operation only returns the diagram features associated with the same utility network features that are visibly represented in this other diagram and in the resource diagram.
     * @required
     */
    includeAggregations: boolean;

    /**
     * @displayName addConnectivityAssociations
     * @description  When the fromFeatures reference utility network feature Global IDs
     * True—The operation also adds any connectivity association diagram edges for which it has just retrieved both the "from" and "to" diagram junctions.
     * False—The operation doesn't add any connectivity association diagram edges represented in the diagram resource.
     * @required
     */
    addConnectivityAssociations: boolean;

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
interface FindDiagramFeaturesOutputs {
    /**
     * @description The result of the activity.
     */
    features: string;
}

/**
 * @displayName FindDiagramFeatures
 * @description use to search for the utility network features associated with a set of diagram features that are referenced in the diagram resource.
 * @category Utility Network
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export default class FindDiagramFeaturesActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(
        inputs: FindDiagramFeaturesInputs
    ): Promise<FindDiagramFeaturesOutputs> {
        const {
            serviceUrl,
            name,
            fromFeatures,
            includeAggregations,
            addConnectivityAssociations,
            ...other
        } = inputs;

        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!name) {
            throw new Error("diagramName is required");
        }
        if (!fromFeatures) {
            throw new Error("fromFeatures is required");
        }
        if (!includeAggregations) {
            throw new Error("includeAggregations is required");
        }
        if (!addConnectivityAssociations) {
            throw new Error("addConnectivityAssociations is required");
        }
        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}//diagrams/${name}/findDiagramFeatures`;

        const query = {
            f: "json",
            fromFeatures,
            includeAggregations,
            addConnectivityAssociations,
            ...other,
        };
        const options: __esri.RequestOptions = {
            method: "post",
            query: query,
            responseType: "json",
        };
        const response = await esriRequest(url, options);

        const responseData = response.data;
        const features = responseData?.features;

        return {
            features,
        };
    }
}
