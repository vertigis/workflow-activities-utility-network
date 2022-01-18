import {
    SelectNetworkGraphics,
    SelectNetworkGraphicsInputs,
} from "../SelectNetworkGraphics";
import Point from "@arcgis/core/geometry/Point";
import { mockMapView } from "../__mocks__/MapView";
import { mockWebMap } from "../__mocks__/WebMap";
import WebMap from "@arcgis/core/WebMap";

jest.mock("../utils", () => {
    return {
        getTraceGraphic: jest.fn(),
        createSymbol: jest.fn(),
        getPercentageAlong: jest.fn(),
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
        it("requires mapView input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute({
                    map: undefined as any,
                    point: {} as Point,
                    locationType: "barrier",
                });
            }).rejects.toThrow("map is required");
        });
        it("requires point input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute({
                    map: {} as any,
                    point: undefined as any,
                    locationType: "barrier",
                });
            }).rejects.toThrow("point is required");
        });
        it("requires locationType input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute({
                    map: {} as any,
                    point: {} as Point,
                    locationType: undefined as any,
                });
            }).rejects.toThrow("locationType is required");
        });

        it("Creates an array of LocationGraphics", async () => {
            const inputs: SelectNetworkGraphicsInputs = {
                map: jest.fn() as any,
                point: new Point(),
                locationType: "barrier",
            };
            (inputs.map as any).view = mockMapView();
            (inputs.map as any).view.map = mockWebMap();
            const activity = new SelectNetworkGraphics();
            const result = await activity.execute(inputs);
            expect(result).toBeDefined();
            expect(result).toEqual({
                locationGraphics: [],
            });
        });
    });
});
