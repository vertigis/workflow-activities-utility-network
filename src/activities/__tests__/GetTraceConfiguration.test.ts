import { GetTraceConfigurationInputs } from "../GetTraceConfiguration";
import GetTraceConfiguration from "../GetTraceConfiguration";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import TraceConfiguration from "@arcgis/core/networks/support/TraceConfiguration";
import NamedTraceConfiguration from "@arcgis/core/networks/support/NamedTraceConfiguration";

jest.mock("@arcgis/core/networks/support/TraceConfiguration", () => {
    return function (params?: any) {
        return {
            toJSON: () => {
                return {};
            },
        };
    };
});

const dummyTraceConfig: TraceConfiguration = new TraceConfiguration({});

jest.mock("@arcgis/core/networks/support/NamedTraceConfiguration", () => {
    return function (params: any) {
        return {
            globalId: params.globalId,
            title: params.title,
            traceConfiguration: params.traceConfiguration as TraceConfiguration,
            resultTypes: [],
            traceType: "upstream",
        };
    };
});
const dummyNamedTraceConfig: NamedTraceConfiguration =
    new NamedTraceConfiguration({
        globalId: "abc",
        title: "xyz",
        traceConfiguration: dummyTraceConfig,
    });

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function (params: any) {
        return {
            sharedNamedTraceConfigurations: [dummyNamedTraceConfig],
        };
    };
});

const dummyUn = new UtilityNetwork({
    sharedNamedTraceConfigurations: [dummyNamedTraceConfig],
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GetTraceConfiguration", () => {
    describe("execute", () => {
        it("requires utilityNetwork input", () => {
            const activity = new GetTraceConfiguration();
            expect(() => {
                activity.execute({
                    utilityNetwork: undefined as any,
                    traceId: "abc",
                });
            }).toThrow("utilityNetwork is required");
        });
        it("requires traceId input", () => {
            const activity = new GetTraceConfiguration();
            expect(() => {
                activity.execute({
                    utilityNetwork: dummyUn,
                    traceId: undefined as any,
                });
            }).toThrow("traceId is required");
        });
        it("gets a TraceLocation", () => {
            const outputs = {
                traceConfiguration: dummyTraceConfig,
                resultTypes: [],
                traceType: "upstream",
            };
            const inputs: GetTraceConfigurationInputs = {
                traceId: "abc",
                utilityNetwork: dummyUn,
            };
            const activity = new GetTraceConfiguration();
            const result = activity.execute(inputs);
            expect(result).toBeDefined();
            if (result.traceConfiguration) {
                expect(JSON.stringify(result.traceConfiguration)).toEqual(
                    JSON.stringify(outputs.traceConfiguration)
                );
                expect(JSON.stringify(result.resultTypes)).toEqual(
                    JSON.stringify(outputs.resultTypes)
                );
                expect(JSON.stringify(result.traceType)).toEqual(
                    JSON.stringify(outputs.traceType)
                );
            }
        });
    });
});
