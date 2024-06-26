import type { IActivityHandler } from "@vertigis/workflow/IActivityHandler";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";

/** An interface that defines the inputs of the activity. */
export interface CreateTraceLocationInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @displayName Global Id
     * @description The globalId (UUID) of the feature to start or stop the trace.
     * @required
     */
    globalId: string;

    /**
     * @displayName Type
     * @description The type of the trace location; starting-point defines where the trace should start and barrier defines where the trace should stop.
     * @required
     */
    type: "starting-point" | "barrier" | string;

    /**
     * @displayName Is Filter Barrier
     * @description This indicates whether this barrier starting location should be skipped (filtered) when a trace attempts to find upstream controllers.
     */
    isFilterBarrier?: boolean;
    /**
     * @displayName Percent Along
     * @description This double parameter of value of 0-1 indicates a percentage along the line of where the starting location is placed.
     */
    percentAlong?: number;
    /**
     * @displayName Terminal Id
     * @description The terminal Id to place the starting location at. Applicable for junction/device sources only.
     */
    terminalId?: number;

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

/** An interface that defines the outputs of the activity. */
export interface CreateTraceLocationOutputs {
    /**
     * @description The trace location.
     */
    traceLocation: TraceLocation;
}

/**
 * @category Utility Network
 * @description Create a trace location for a given location along the network.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-networks-support-TraceLocation.html
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class CreateTraceLocation implements IActivityHandler {
    execute(inputs: CreateTraceLocationInputs): CreateTraceLocationOutputs {
        const { globalId, isFilterBarrier, percentAlong, type, terminalId } =
            inputs;
        if (!globalId) {
            throw new Error("globalId is required");
        }
        if (!type) {
            throw new Error("type is required");
        }

        const traceLocation = new TraceLocation({
            globalId,
            isFilterBarrier,
            percentAlong,
            type: type as any,
            terminalId,
        });

        return {
            traceLocation,
        };
    }
}
