import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import Network from "@arcgis/core/networks/Network";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import { trace } from "@arcgis/core/rest/networks/trace";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import TraceResult from "@arcgis/core/rest/networks/support/TraceResult";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";

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
@activate(MapProvider)
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

        if (traceConfiguration && typeof traceConfiguration !== "string") {
            (traceConfiguration as any).toJSON = () => {
                // A Utlity Network Trace requires a UNTraceConfiguration (if it is defined),
                // however, the arcgis/core package doesn't expose this module. We use
                // TraceConfiguration instead but TraceConfiguration.toJSON discards
                // UNTraceConfiguration properties so we need to create a deep clone and override
                // the toJSON function to force a full copy.
                const obj = deepClone(traceConfiguration);
                obj.toJSON = null;
                const jsonString = JSON.stringify(obj);
                const json = JSON.parse(jsonString);
                return json;
            };
        }
        const traceParams = new TraceParameters({
            gdbVersion,
            moment,
            namedTraceConfigurationGlobalId,
            resultTypes: resultTypes,
            traceConfiguration:
                typeof traceConfiguration !== "string"
                    ? traceConfiguration
                    : undefined,
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

function deepClone(inObject: any) {
    let value: any;
    let key: any;
    if (typeof inObject !== "object" || inObject === null) {
        return inObject; // Return the value if inObject is not an object
    }
    // Create an array or object to hold the values
    const outObject = Array.isArray(inObject) ? [] : {};

    for (key in inObject) {
        value = inObject[key];
        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepClone(value);
    }
    return outObject;
}
