import {
    GetTraceConfigurations,
    GetTraceConfigurationInputs,
} from "../GetTraceConfiguration";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import UNTraceConfiguration from "@arcgis/core/networks/support/UNTraceConfiguration";
import NamedTraceConfiguration from "@arcgis/core/networks/support/NamedTraceConfiguration";

const dummyTraceConfig: UNTraceConfiguration = new UNTraceConfiguration({});

jest.mock("@arcgis/core/networks/support/UNTraceConfiguration", () => {
    return function (params?: any) {
        return {
            toJSON: () => {
                return {};
            },
        };
    };
});

jest.mock("@arcgis/core/networks/support/NamedTraceConfiguration", () => {
    return function (params: any) {
        return {
            globalId: params.globalId,
            title: params.title,
            traceConfiguration: params.traceConfiguration as UNTraceConfiguration,
        };
    };
});
const dummyNamedTroceConfig: NamedTraceConfiguration = new NamedTraceConfiguration(
    {
        globalId: "abc",
        title: "xyz",
        traceConfiguration: dummyTraceConfig,
    }
);

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function (params: any) {
        return {
            sharedNamedTraceConfigurations: [dummyNamedTroceConfig],
        };
    };
});

const dummyUn = new UtilityNetwork({
    globalId: "abc",
    sharedNamedTraceConfigurations: [dummyNamedTroceConfig],
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GetTraceConfiguration", () => {
    describe("execute", () => {
        it("requires utilityNetwork input", () => {
            const activity = new GetTraceConfigurations();
            expect(() => {
                activity.execute({
                    utilityNetwork: undefined as any,
                    traceId: "abc",
                });
            }).toThrow("utilityNetwork is required");
        });
        it("requires traceId input", () => {
            const activity = new GetTraceConfigurations();
            expect(() => {
                activity.execute({
                    utilityNetwork: dummyUn,
                    traceId: undefined as any,
                });
            }).toThrow("traceId is required");
        });
        it("gets a TraceLocation", () => {
            const inputs: GetTraceConfigurationInputs = {
                traceId: "abc",
                utilityNetwork: dummyUn,
            };
            const activity = new GetTraceConfigurations();
            const result = activity.execute(inputs);
            expect(result).toBeDefined();

            expect(result.traceConfiguration.toJSON()).toEqual(
                dummyTraceConfig.toJSON()
            );
        });
    });
});
