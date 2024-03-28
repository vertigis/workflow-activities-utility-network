import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import TraceConfiguration from "@arcgis/core/networks/support/TraceConfiguration";

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
    traceConfiguration: TraceConfiguration;
}

/**
 * @category Utility Network
 * @description Create a trace configuration from JSON.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-support-TraceConfiguration.html
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class TraceConfigurationFromJSON implements IActivityHandler {
    execute(
        inputs: TraceConfigurationFromJSONInputs
    ): TraceConfigurationFromJSONOutputs {
        const { json } = inputs;
        if (!json) {
            throw new Error("json is required");
        }

        const traceConfiguration = new TraceConfiguration(json);

        return {
            traceConfiguration,
        };
    }
}
