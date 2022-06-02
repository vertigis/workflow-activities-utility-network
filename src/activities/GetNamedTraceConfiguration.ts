import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import NamedTraceConfiguration from "@arcgis/core/networks/support/NamedTraceConfiguration";

/** An interface that defines the inputs of the activity. */
export interface GetNamedTraceConfigurationInputs {
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
export interface GetNamedTraceConfigurationOutputs {
    /**
     * @description The result of the activity.
     */
    namedTraceConfiguration: NamedTraceConfiguration | undefined;
}

/**
 * @displayName GetNamedTraceConfiguration
 * @description Get a named trace configuration from a Utility Network.
 * @category Utility Network
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export class GetNamedTraceConfigurationActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    execute(
        inputs: GetNamedTraceConfigurationInputs
    ): GetNamedTraceConfigurationOutputs {
        const { utilityNetwork, traceId } = inputs;
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        if (!traceId) {
            throw new Error("traceId is required");
        }

        const namedTraceConfiguration =
            utilityNetwork.sharedNamedTraceConfigurations.find(
                (x) => x.title === traceId || x.globalId === traceId
            );

        return {
            namedTraceConfiguration,
        };
    }
}
