import {
    TraceConfigurationFromJSON,
    TraceConfigurationFromJSONInputs,
} from "../TraceConfigurationFromJSON";
import UNTraceConfiguration from "@arcgis/core/networks/support/UNTraceConfiguration";

const dummyTraceConfig: UNTraceConfiguration = new UNTraceConfiguration({});

jest.mock("@arcgis/core/networks/support/UNTraceConfiguration", () => {
    return function () {
        // no op
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GetTraceConfiguration", () => {
    describe("execute", () => {
        it("requires json input", () => {
            const activity = new TraceConfigurationFromJSON();
            expect(() => {
                activity.execute({
                    json: undefined as any,
                });
            }).toThrow("json is required");
        });
        it("creates a Trace Configuration", () => {
            const inputs: TraceConfigurationFromJSONInputs = {
                json: {},
            };
            const activity = new TraceConfigurationFromJSON();
            const result = activity.execute(inputs);
            expect(result).toBeDefined();

            expect(result.traceConfiguration).toEqual(dummyTraceConfig);
        });
    });
});
