import {
    RunUtilityNetworkTrace,
    RunUtilityNetworkTraceInputs,
} from "../RunUtilityNetworkTrace";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";
import WebMap from "@arcgis/core/WebMap";
import TraceResult from "@arcgis/core/rest/networks/support/TraceResult";
import { mockWebMap } from "../__mocks__/WebMap";

const mockTraceLocation = {
    globalId: "abc",
    type: "starting-point",
    isFilterBarrier: true,
    percentAlong: 0,
    terminalId: 123,
};

const mockTraceParameters = {
    traceLocations: [],
    traceConfiguration: {},
    traceType: "isolation",
    resultTypes: [],
};

const mockTraceConfiguration = {};

jest.mock("@arcgis/core/rest/networks/support/TraceParameters", () => {
    return function () {
        return mockTraceParameters;
    };
});
jest.mock("@arcgis/core/rest/networks/support/TraceLocation", () => {
    return function () {
        return mockTraceLocation;
    };
});
jest.mock("@arcgis/core/networks/support/TraceConfiguration", () => {
    return function () {
        return mockTraceConfiguration;
    };
});
jest.mock("@arcgis/core/WebMap", () => {
    return function () {
        return {
            portalItem: { portal: { credential: { token: {} } } },
        };
    };
});
jest.mock("@geocortex/workflow/runtime/activities/arcgis/MapProvider");

jest.mock("@arcgis/core/rest/networks/support/TraceLocation", () => {
    return function () {
        return mockTraceLocation;
    };
});

jest.mock("@arcgis/core/rest/networks/trace", () => ({
    trace: () => {
        return {};
    },
}));
jest.mock("@arcgis/core/rest/networks/support/TraceResult", () => {
    return function () {
        return {};
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("RunUtilityNetworkTrace", () => {
    describe("execute", () => {
        it("requires utilityNetwork input", async () => {
            const activity = new RunUtilityNetworkTrace();
            await expect(async () => {
                await activity.execute({
                    utilityNetwork: undefined as any,
                    traceType: "isolation",
                    traceLocations: [],
                    traceConfiguration: {} as any,
                    resultTypes: [],
                    map: {} as any,
                });
            }).rejects.toThrow("utilityNetwork is required");
        });
        it("requires traceType input", async () => {
            const activity = new RunUtilityNetworkTrace();
            await expect(async () => {
                await activity.execute({
                    utilityNetwork: {} as any,
                    traceType: undefined as any,
                    traceLocations: [],
                    traceConfiguration: {} as any,
                    resultTypes: [],
                    map: {} as any,
                });
            }).rejects.toThrow("traceType is required");
        });
        it("requires traceLocations input", async () => {
            const activity = new RunUtilityNetworkTrace();
            await expect(async () => {
                await activity.execute({
                    utilityNetwork: {} as any,
                    traceType: "isolation",
                    traceLocations: undefined as any,
                    traceConfiguration: {} as any,
                    resultTypes: [],
                    map: {} as any,
                });
            }).rejects.toThrow("traceLocations is required");
        });
        it("requires traceConfiguration input", async () => {
            const activity = new RunUtilityNetworkTrace();
            await expect(async () => {
                await activity.execute({
                    utilityNetwork: {} as any,
                    traceType: "isolation",
                    traceLocations: [],
                    traceConfiguration: undefined as any,
                    resultTypes: [],
                    map: {} as any,
                });
            }).rejects.toThrow("traceConfiguration is required");
        });
        it("creates a TraceLocation", async () => {
            const inputs: RunUtilityNetworkTraceInputs = {
                utilityNetwork: {} as any,
                traceType: "isolation",
                traceLocations: [],
                traceConfiguration: {} as any,
                resultTypes: [],
                map: jest.fn() as any,
            };
            (inputs.map as any).map = mockWebMap();
            console.log((inputs.map as any).map);
            const activity = new RunUtilityNetworkTrace();
            const result = await activity.execute(inputs);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({ traceResult: new TraceResult() });
        });
    });
});
