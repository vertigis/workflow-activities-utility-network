import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import esriRequest from "@arcgis/core/request";

/** An interface that defines the inputs of the activity. */
interface ApplyLayoutInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

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
     * @displayName Layout Name
     * @description The name of the algorithm layout to apply.
     * @required
     */
    layoutName:
        | "AngleDirectedDiagramLayout"
        | "CompressionDiagramLayout"
        | "ForceDirectedDiagramLayout"
        | "GeoPositionsDiagramLayout"
        | "GridDiagramLayout"
        | "LinearDispatchDiagramLayout"
        | "MainLineTreeDiagramLayout"
        | "MainRingDiagramLayout"
        | "PartialOverlappingEdgesDiagramLayout"
        | "RadialTreeDiagramLayout"
        | "RelativeMainlineDiagramLayout"
        | "ReshapeEdgesDiagramLayout"
        | "RotateTreeDiagramLayout"
        | "SeparateOverlappingEdgesDiagramLayout"
        | "SmartTreeDiagramLayout"
        | "SpatialDispatchDiagramLayout"
        | string;

    /**
     * @displayName Layout Params
     * @description The algorithm layout parameters property set.
     * @helpUrl https://developers.arcgis.com/rest/services-reference/enterprise/appendix-diagram-layout-property-set-objects.htm
     */
    layoutParams?: {
        type: "PropertySet";
        propertySetItems: Record<string, unknown>[];
    };

    /**
     * @displayName Junction Object IDs
     * @description A list of Junction ObjectIDs to apply the layout algorithm.
     * @helpUrl https://developers.arcgis.com/rest/services-reference/enterprise/appendix-diagram-layout-property-set-objects.htm
     */
    junctionObjectIDs?: number[];

    /**
     * @displayName Container Object IDs
     * @description A list of Container ObjectIDs to apply the layout algorithm.
     * @helpUrl https://developers.arcgis.com/rest/services-reference/enterprise/appendix-diagram-layout-property-set-objects.htm
     */
    containerObjectIDs?: number[];

    /**
     * @displayName Edge Object IDs
     * @description A list of Edge ObjectIDs to apply the layout algorithm.
     * @helpUrl https://developers.arcgis.com/rest/services-reference/enterprise/appendix-diagram-layout-property-set-objects.htm
     */
    edgeObjectIDs?: number[];

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

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

/** An interface that defines the outputs of the activity. */
interface ApplyLayoutOutputs {
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
 * @displayName Apply Layout
 * @description The applyLayout operation is performed on a Diagram resource. The result of this operation is a Diagram JSON Information object,
 *              and the moment (date) the applyLayout operation happens for a stored diagram. It is used to apply a specific diagram algorithm
 *              on all or parts of the resource diagram content.
 * @category Utility Network
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class ApplyLayout implements IActivityHandler {
    async execute(inputs: ApplyLayoutInputs): Promise<ApplyLayoutOutputs> {
        const { serviceUrl, diagramName, layoutName, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!diagramName) {
            throw new Error("diagramName is required");
        }
        if (!layoutName) {
            throw new Error("diagramName is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");
        const url = `${normalizedUrl}/diagrams/${diagramName}/applyLayout`;

        const query = {
            f: "json",
            layoutName,
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

        return {
            diagramInfo,
        };
    }
}
