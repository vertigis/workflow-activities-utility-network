import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import Network from "@arcgis/core/networks/Network";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import { trace } from "@arcgis/core/rest/networks/trace";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import TraceResult from "@arcgis/core/rest/networks/support/TraceResult";

type TraceConfiguration = TraceParameters["traceConfiguration"];

/** An interface that defines the inputs of the activity. */
export interface RunUtilityNetworkTraceInputs {
    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
    utilityNetwork: Network & UtilityNetwork;
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
     * @description The global ID or title of a named trace configuration, or an object that defines the properties of a trace configuration.
     * @required
     */
    traceConfiguration: string | TraceConfiguration;
    /**
     * @displayName Result Types
     * @description The list of types that will be returned by the trace.
     */
    resultTypes?: {
        type: string;
        includeGeometry: boolean;
        includePropagatedValues: boolean;
        networkAttributeNames: string[];
        diagramTemplateName: string;
        resultTypeFields: any[];
    }[];
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
export interface RunUtilityNetworkTraceOutputs {
    /**
     * @description The trace results.
     */
    traceResult?: TraceResult;
}

/**
 * @category Utility Network
 * @description Perform a Utility Network trace operation.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-networks-trace.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export class RunUtilityNetworkTrace implements IActivityHandler {
    async execute(
        inputs: RunUtilityNetworkTraceInputs
    ): Promise<RunUtilityNetworkTraceOutputs> {
        const {
            gdbVersion,
            moment,
            utilityNetwork,
            traceType,
            traceLocations,
            traceConfiguration,
            resultTypes = [],
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

        // Find named trace config
        let namedTraceConfigurationGlobalId: string | undefined;
        if (typeof traceConfiguration === "string") {
            namedTraceConfigurationGlobalId =
                utilityNetwork.sharedNamedTraceConfigurations.find(
                    (x) =>
                        x.title === traceConfiguration ||
                        x.globalId === traceConfiguration
                )?.globalId || namedTraceConfigurationGlobalId;
        }

        let unTraceConfiguration;

        if (traceConfiguration && typeof traceConfiguration !== "string") {
            unTraceConfiguration = {
                // A Utlity Network Trace requires a UNTraceConfiguration (if it is defined),
                // however, the arcgis/core package doesn't expose this module. We use
                // TraceConfiguration instead but TraceConfiguration.toJSON discards
                // UNTraceConfiguration properties so we need to create a shallow clone and override it.
                toJSON: () => {
                    return { ...traceConfiguration };
                },
            };
        }
        const traceParams = new TraceParameters({
            gdbVersion,
            moment,
            namedTraceConfigurationGlobalId,
            resultTypes: resultTypes,
            traceConfiguration: unTraceConfiguration,
            traceLocations,
            traceType,
        });
        const traceResult = await trace(
            utilityNetwork.networkServiceUrl,
            traceParams
        );

        return {
            traceResult,
        };
    }
}
