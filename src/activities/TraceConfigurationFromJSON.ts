import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import UNTraceConfiguration from "@arcgis/core/networks/support/UNTraceConfiguration";

/** An interface that defines the inputs of the activity. */
export interface TraceConfigurationFromJSONInputs {
    /**
     * @displayName JSON
     * @description The trace configuration as JSON.
     * @required
     */
    json: any;
}

/** An interface that defines the outputs of the activity. */
export interface TraceConfigurationFromJSONOutputs {
    /**
     * @description The result of the activity.
     */
    traceConfiguration: UNTraceConfiguration;
}

/**
 * @category Utility Network
 * @description Create a trace location for a given location along the network.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-support-TraceConfiguration.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export class TraceConfigurationFromJSON implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    execute(
        inputs: TraceConfigurationFromJSONInputs
    ): TraceConfigurationFromJSONOutputs {
        const { json } = inputs;
        if (!json) {
            throw new Error("json is required");
        }
        const traceConfig = new UNTraceConfiguration(json);
        return {
            traceConfiguration: traceConfig,
        };
    }
}
