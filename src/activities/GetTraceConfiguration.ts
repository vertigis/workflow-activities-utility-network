import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import TraceConfiguration from "@arcgis/core/networks/support/TraceConfiguration";
import UNTraceConfiguration from "@arcgis/core/networks/support/UNTraceConfiguration";

/** An interface that defines the inputs of the activity. */
export interface GetTraceConfigurationInputs {
    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
    utilityNetwork: UtilityNetwork;

    /**
     * @displayName Trace Configuration ID
     * @description The GUID or Title that uniquely identifies the shared trace configuration to be loaded.
     * @required
     */
    traceId: string;
}

/** An interface that defines the outputs of the activity. */
export interface GetTraceConfigurationOutputs {
    /**
     * @description The trace configurations associated with the Utility Network results.
     */
    traceConfiguration: TraceConfiguration | UNTraceConfiguration | undefined;
    traceType: string | undefined;
    resultTypes: any[] | undefined;
}

/**
 * @category Utility Network
 * @description Get the Trace Configurations associated with a Utility Network.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-support-TraceConfiguration.html
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class GetTraceConfiguration implements IActivityHandler {
    execute(inputs: GetTraceConfigurationInputs): GetTraceConfigurationOutputs {
        const { utilityNetwork, traceId } = inputs;
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        if (!traceId) {
            throw new Error("traceId is required");
        }
        let traceConfiguration:
            | TraceConfiguration
            | UNTraceConfiguration
            | undefined;
        let resultTypes: any[] | undefined;
        let traceType: string | undefined;

        const namedTraceConfiguration =
            utilityNetwork.sharedNamedTraceConfigurations.find(
                (x) => x.title === traceId || x.globalId === traceId
            );

        if (namedTraceConfiguration) {
            traceConfiguration = namedTraceConfiguration.traceConfiguration;
            resultTypes = namedTraceConfiguration.resultTypes;
            traceType = namedTraceConfiguration.traceType;
        }

        return {
            traceConfiguration,
            resultTypes,
            traceType,
        };
    }
}
