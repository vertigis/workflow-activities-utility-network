import TraceConfigurationFromJSON from "../TraceConfigurationFromJSON";
import { TraceConfigurationFromJSONInputs } from "../TraceConfigurationFromJSON";
import TraceConfiguration from "@arcgis/core/networks/support/TraceConfiguration";
jest.mock("@arcgis/core/networks/support/TraceConfiguration", () => {
    return function () {
        // no op
    };
});

const dummyTraceConfig: TraceConfiguration = new TraceConfiguration({});

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
