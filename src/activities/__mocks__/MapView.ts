import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";

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
export function mockMapView(): MapView {
    const mapView: Partial<MapView> = {
        hitTest: (
            screenPoint: __esri.MapViewScreenPoint,
            options: __esri.MapViewHitTestOptions
        ) => {
            return Promise.resolve({ results: [] } as any);
        },
        toScreen: (point: Point) => {
            return {
                x: 0,
                y: 0,
                spatialReference: {},
                type: "point",
            } as __esri.MapViewScreenPoint;
        },
        when: jest.fn().mockResolvedValueOnce({}),
    };
    mapView.map = {} as WebMap;
    return mapView as MapView;
}
