import type {
    IActivityContext,
    IActivityHandler,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import { trace } from "../request";

/** An interface that defines the inputs of the activity. */
export interface RunUtilityNetworkTraceInputs {
    /**
     * @displayName Service URL
     * @description The URL to the Utility Network Service.
     * @required
     */
    serviceUrl: string;
    traceType: "connected" | "subnetwork" | "subnetworkController" | "upstream" | "downstream" | "loops" | "shortestPath" | "isolation" | string;
    traceLocations: {
        globalId: string;
        isFilterBarrier?: boolean; // Introduced at 10.8.1
        percentAlong?: number; // required for edge features
        terminalId?: number; // required for junction features
        traceLocationType: "startingPoint" | "barrier" | string;
    }[];
    traceConfiguration?: {
        includeContainers?: boolean;
        includeContent?: boolean;
        includeStructures?: boolean;
        includeBarriers?: boolean;
        validateConsistency?: boolean;
        includeIsolated?: boolean;
        ignoreBarriersAtStartingPoints?: boolean;
        includeUpToFirstSpatialContainer?: boolean;
        domainNetworkName: string;
        tierName: string;
        targetTierName?: string;
        subnetworkName?: string;
        diagramTemplateName: string;
        shortestPathNetworkAttributeName?: string; // Required for a shortest path trace
        filterBitsetNetworkAttributeName?: string;
        traversabilityScope?: string;
        conditionBarriers?: {
            name: string;
            type: string;
            operator: string;
            value: number;
            combineUsingOr: boolean;
            isSpecificValue: boolean;
        }[]
        functionBarriers?: [];
        arcadeExpressionBarrier: string;
        filterBarriers?: [];
        filterFunctionBarriers?: [];
        filterScope?: "junctions" | "edges" | "junctionsAndEdges" | string;
        functions?: [];
        nearestNeighbor?: {
            count: number;
            costNetworkAttributeName: string;
            nearestCategories: [];
            nearestAssets: []
        },
        outputFilterCategories?: [];
        outputFilters?: [];
        outputConditions?: [];
        propagators?: [];
    }
    gdbVersion?: string; // The default is DEFAULT
    sessionID?: string;
    moment?: Date;
}

/** An interface that defines the outputs of the activity. */
export interface RunUtilityNetworkTraceOutputs {
    /**
     * @description The trace results.
     */
    traceResults: {
        elements: [
            {
                networkSourceId: number;
                globalId: string;
                objectId: number;
                terminalId?: number;
                networkAttributes?: [];
                assetGroup?: number;
                assetType?: number;
                positionFrom?: number;
                positionTo?: number;
            }
        ],
        aggregatedGeometry: {
            point: any;
            line: any
            polygon: any;
        },
        globalFunctionResults: [
            {
                functionType: string;
                Name: string;
                result: number;
            }
        ],
        isConsistent: boolean;
        kFeaturesForKNNFound: boolean;
        startingPointsIgnored: boolean;
        warnings: string[];
    };
}

/**
 * @category Utility Network
 * @description Perform a Utility Network trace operation.
 * @helpUrl https://developers.arcgis.com/rest/services-reference/trace-utility-network-server-.htm
 * @clientOnly
 * @unsupportedApps GMV
 */
@activate(ChannelProvider)
export class RunUtilityNetworkTrace implements IActivityHandler {
    async execute(inputs: RunUtilityNetworkTraceInputs,
        context: IActivityContext,
        type: typeof ChannelProvider): Promise<RunUtilityNetworkTraceOutputs> {
        const { serviceUrl, traceType, ...other } = inputs;
        if (!serviceUrl) {
            throw new Error("serviceUrl is required");
        }
        if (!traceType) {
            throw new Error("traceType is required");
        }

        // Remove trailing slashes
        const normalizedUrl = serviceUrl.replace(/\/*$/, "");

        const channel = type.create(undefined, "arcgis");

        const response = await trace(channel, normalizedUrl, {
            traceType,
            ...other,
        }, context.cancellationToken);

        if (response.error) {
            console.log("Trace operation failed", response.error);
            throw new Error("Trace operation failed");
        }

        return {
            traceResults: response.traceResults,
        }
    }
}
