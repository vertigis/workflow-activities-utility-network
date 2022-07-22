import {
    SelectNetworkGraphics,
    SelectNetworkGraphicsInputs,
} from "../SelectNetworkGraphics";
import Point from "@arcgis/core/geometry/Point";
//import { mockMapView } from "../__mocks__/MapView";
import { mockWebMap } from "../__mocks__/WebMap";
import { mockActivityContext } from "../__mocks__/ActivityContext";

jest.mock("@geocortex/workflow/runtime/activities/arcgis/MapProvider", () => {
    return function () {
        // no op
    };
});

const mockProvider = {
    create: () => {
        return {
            load: jest.fn(),
            map: mockWebMap(),
            //view: mockMapView(),
        };
    },
};

const context = mockActivityContext();

jest.mock("../utils", () => {
    return {
        getNetworkGraphic: jest.fn(),
        getPercentageAlong: jest.fn(),
        getNetworkLayerIds: (ids) => {
            return [1, 2, 3];
        },
    };
});
jest.mock("@arcgis/core/geometry/Point", () => {
    return function () {
        return {
            x: 0,
            y: 0,
            spatialReference: {},
            type: "point",
        };
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("SelectNetworkGraphics", () => {
    describe("execute", () => {
        it("requires point input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute(
                    {
                        point: undefined as any,
                        locationType: "barrier",
                        utilityNetwork: {} as any,
                    },
                    context,
                    mockProvider as any
                );
            }).rejects.toThrow("point is required");
        });
        it("requires locationType input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute(
                    {
                        point: {} as Point,
                        locationType: undefined as any,
                        utilityNetwork: {} as any,
                    },
                    context,
                    mockProvider as any
                );
            }).rejects.toThrow("locationType is required");
        });

        it("Creates an array of LocationGraphics", async () => {
            const inputs: SelectNetworkGraphicsInputs = {
                point: new Point(),
                locationType: "barrier",
                utilityNetwork: {} as any,
            };
            const activity = new SelectNetworkGraphics();
            const result = await activity.execute(
                inputs,
                context,
                mockProvider as any
            );
            expect(result).toBeDefined();
            expect(result).toEqual({
                networkGraphics: [],
            });
        });
    });
});
