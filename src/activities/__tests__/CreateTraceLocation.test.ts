import CreateTraceLocation, {
    CreateTraceLocationInputs,
} from "../CreateTraceLocation";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation";

const mockTraceLocation = {
    globalId: "abc",
    type: "starting-point",
    isFilterBarrier: true,
    percentAlong: 0,
    terminalId: 123,
};
jest.mock("@arcgis/core/rest/networks/support/TraceLocation", () => {
    return function () {
        return mockTraceLocation;
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("CreateTraceLocation", () => {
    describe("execute", () => {
        it("requires globalId input", () => {
            const activity = new CreateTraceLocation();
            expect(() => {
                activity.execute({
                    globalId: undefined as any,
                    type: "starting-point",
                });
            }).toThrow("globalId is required");
        });
        it("requires type input", () => {
            const activity = new CreateTraceLocation();
            expect(() => {
                activity.execute({
                    globalId: "abc",
                    type: undefined as any,
                });
            }).toThrow("type is required");
        });
        it("creates a TraceLocation", () => {
            const inputs: CreateTraceLocationInputs = {
                globalId: "abc",
                type: "starting-point",
                isFilterBarrier: true,
                percentAlong: 0,
                terminalId: 123,
            };
            const traceLocation = new TraceLocation();
            traceLocation.globalId = inputs.globalId;
            traceLocation.type = inputs.type as any;
            traceLocation.isFilterBarrier = inputs.isFilterBarrier!;
            traceLocation.percentAlong = inputs.percentAlong!;
            traceLocation.terminalId = inputs.terminalId!;
            const activity = new CreateTraceLocation();
            const result = activity.execute(inputs);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({ traceLocation });
        });
    });
});
