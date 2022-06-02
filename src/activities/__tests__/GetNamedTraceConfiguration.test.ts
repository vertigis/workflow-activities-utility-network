import {
    GetNamedTraceConfigurationActivity,
    GetNamedTraceConfigurationInputs,
} from "../GetNamedTraceConfiguration";
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
    globalId: "abc",
    sharedNamedTraceConfigurations: [dummyNamedTraceConfig],
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GetNamedTraceConfiguration", () => {
    describe("execute", () => {
        it("requires utilityNetwork input", () => {
            const activity = new GetNamedTraceConfigurationActivity();
            expect(() => {
                activity.execute({
                    utilityNetwork: undefined as any,
                    traceId: "abc",
                });
            }).toThrow("utilityNetwork is required");
        });
        it("requires traceId input", () => {
            const activity = new GetNamedTraceConfigurationActivity();
            expect(() => {
                activity.execute({
                    utilityNetwork: dummyUn,
                    traceId: undefined as any,
                });
            }).toThrow("traceId is required");
        });
        it("gets a Named Trace Configuration", () => {
            const inputs: GetNamedTraceConfigurationInputs = {
                traceId: "abc",
                utilityNetwork: dummyUn,
            };
            const activity = new GetNamedTraceConfigurationActivity();
            const result = activity.execute(inputs);
            expect(result).toBeDefined();
            if (result.namedTraceConfiguration) {
                expect(JSON.stringify(result.namedTraceConfiguration)).toEqual(
                    JSON.stringify(dummyNamedTraceConfig)
                );
            }
        });
    });
});
