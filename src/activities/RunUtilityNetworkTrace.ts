import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import { MapInfo } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import Network from "@arcgis/core/networks/Network";
import UNTraceConfiguration from "@arcgis/core/networks/support/UNTraceConfiguration";
import * as trace from "@arcgis/core/rest/networks/trace";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import TraceResult from "@arcgis/core/rest/networks/support/TraceResult";

/** An interface that defines the inputs of the activity. */
export interface RunUtilityNetworkTraceInputs {
    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
    utilityNetwork: Network;
    /**
     * @displayName Trace Type
     * @description The trace type defined in this trace configuration.
     * @required
     */
    traceType:
        | "connected"
        | "subnetwork"
        | "upstream"
        | "downstream"
        | "loops"
        | "isolation"
        | "shortest-path"
        | "subnetwork-controllers";
    /**
     * @displayName Trace Locations
     * @description The list of starting points and barriers that will define where the trace starts and stops.
     * @required
     */
    traceLocations: TraceLocation[];
    /**
     * @displayName Trace Configuration
     * @description Defines the properties of a trace.
     * @required
     */
    traceConfiguration: UNTraceConfiguration;
    /**
     * @displayName Result Types
     * @description The list of types that will be returned by the trace.
     */
    resultTypes?: ResultType[];
    /**
     * @displayName Map
     * @description The Web Map containing the Utility Network.
     * @required
     */
    map: MapInfo;
}

export type ResultType = any;
/** An interface that defines the outputs of the activity. */
export interface RunUtilityNetworkTraceOutputs {
    /**
     * @description The trace results.
     */
    traceResult: TraceResult | undefined;
    error: any | undefined;
}

/**
 * @category Utility Network
 * @description Perform a Utility Network trace operation.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-networks-trace.html
 * @clientOnly
 * @unsupportedApps GMV
 */
export class RunUtilityNetworkTrace implements IActivityHandler {
    async execute(
        inputs: RunUtilityNetworkTraceInputs
    ): Promise<RunUtilityNetworkTraceOutputs> {
        const {
            utilityNetwork,
            traceType,
            traceLocations,
            traceConfiguration,
            resultTypes,
            map,
        } = inputs;
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        if (!traceType) {
            throw new Error("traceType is required");
        }
        if (!traceLocations) {
            throw new Error("traceLocations is required");
        }
        if (!traceConfiguration) {
            throw new Error("traceConfiguration is required");
        }
        if (!map) {
            throw new Error("map is required");
        }
        let resultTypesInternal: any[] = [];
        if (resultTypes) {
            resultTypesInternal = resultTypes;
        }
        if (!resultTypesInternal.find((r) => r.type === "aggregatedGeometry")) {
            resultTypesInternal.push({
                type: "aggregatedGeometry",
                includeGeometry: true,
                includePropagatedValues: true,
                networkAttributeNames: [],
                diagramTemplateName: "",
                resultTypeFields: [],
            });
        }

        const traceParams = new TraceParameters();
        traceParams.traceLocations = traceLocations;
        traceParams.traceConfiguration = traceConfiguration;
        traceParams.traceType = traceType;
        traceParams.resultTypes = resultTypesInternal;
        let traceResult;
        try {
            traceResult = await trace.trace(
                utilityNetwork.networkServiceUrl,
                traceParams,
                {
                    authMode: "no-prompt",
                    query: {
                        token: (inputs.map as any).map.portalItem.portal
                            .credential.token,
                    },
                }
            );
            return {
                traceResult: traceResult,
                error: undefined,
            };
        } catch (e) {
            return {
                traceResult: undefined,
                error: e,
            };
        }
    }
}
