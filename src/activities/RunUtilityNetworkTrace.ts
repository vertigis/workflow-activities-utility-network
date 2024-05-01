import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import Network from "@arcgis/core/networks/Network";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import * as Trace from "@arcgis/core/rest/networks/trace";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import TraceResult from "@arcgis/core/rest/networks/support/TraceResult";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";

type TraceConfiguration = TraceParameters["traceConfiguration"];

/** An interface that defines the inputs of the activity. */
export interface RunUtilityNetworkTraceInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

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
        | "subnetwork-controllers"
        | string;
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
        includeDomainDescriptions: boolean;
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
     * The spatial reference that should be used to project the aggregated geometries returned by the trace (if applicable).
     */
    outSpatialReference?: __esri.SpatialReference;
    /**
     * @displayName Moment
     * @description The date/timestamp (in UTC) to execute the trace at a given time.
     */
    moment?: number;
    /**
     * @description Additional options to be used for the request.
     */
    requestOptions?: {
        /** The HTTP request method. The default is auto. */
        method?: "auto" | "post" | string;
        /** The amount of time in milliseconds to wait for a response from the server. Set to 0 to wait for the response indefinitely. The default is 60000. */
        timeout?: number;
    };

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
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
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class RunUtilityNetworkTrace implements IActivityHandler {
    async execute(
        inputs: RunUtilityNetworkTraceInputs
    ): Promise<RunUtilityNetworkTraceOutputs> {
        const {
            gdbVersion,
            moment,
            outSpatialReference,
            requestOptions,
            resultTypes = [],
            traceType,
            traceLocations,
            traceConfiguration,
            utilityNetwork,
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

        // We need to handle the discrepancy between Experience Builder and VertiGIS Studio Web module exports.
        const trace =
            (Trace as any).default != undefined
                ? ((Trace as any).default as typeof Trace)
                : Trace;

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
                // A Utility Network Trace requires a UNTraceConfiguration (if it is defined),
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
            outSpatialReference,
            resultTypes: resultTypes as any,
            traceConfiguration:
                typeof traceConfiguration !== "string"
                    ? traceConfiguration
                    : undefined,
            traceLocations,
            traceType: traceType as any,
        });
        const traceResult = await trace.trace(
            utilityNetwork.networkServiceUrl,
            traceParams,
            requestOptions
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
