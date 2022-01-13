import {
    SelectNetworkGraphics,
    SelectNetworkGraphicsInputs,
} from "../SelectNetworkGraphics";
import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";
import WebMap from "@arcgis/core/WebMap";
import { mockMapView } from "../__mocks__/MapView";
import { mockWebMap } from "../__mocks__/WebMap";

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

jest.mock("@arcgis/core/WebMap");

jest.mock("@arcgis/core/views/MapView");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("SelectNetworkGraphics", () => {
    describe("execute", () => {
        it("requires mapView input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute({
                    mapView: undefined as any,
                    point: {} as Point,
                    locationType: "barrier",
                });
            }).rejects.toThrow("mapView is required");
        });
        it("requires point input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute({
                    mapView: {} as any,
                    point: undefined as any,
                    locationType: "barrier",
                });
            }).rejects.toThrow("point is required");
        });
        it("requires locationType input", async () => {
            const activity = new SelectNetworkGraphics();
            await expect(async () => {
                await activity.execute({
                    mapView: {} as any,
                    point: {} as Point,
                    locationType: undefined as any,
                });
            }).rejects.toThrow("locationType is required");
        });

        it("Creates an array of LocationGraphics", async () => {
            const inputs: SelectNetworkGraphicsInputs = {
                mapView: mockMapView(),
                point: new Point(),
                locationType: "barrier",
            };
            inputs.mapView.map = mockWebMap();
            const activity = new SelectNetworkGraphics();
            const result = await activity.execute(inputs);
            expect(result).toBeDefined();
            expect(result).toEqual({
                locationGraphics: [],
            });
        });
    });
});
