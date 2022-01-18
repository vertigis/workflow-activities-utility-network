import Collection from "@arcgis/core/core/Collection";
import WebMap from "@arcgis/core/WebMap";
import Layer from "@arcgis/core/layers/Layer";

jest.mock("@arcgis/core/core/Collection", () => {
    return function () {
        return {
            forEach: jest.fn(),
        };
    };
});

export function mockWebMap(): WebMap {
    const webMap: Partial<WebMap> = {
        load: () => {
            return Promise.resolve({} as WebMap);
        },
        allLayers: new Collection<Layer>(),
        portalItem: {
            portal: {
                credential: {},
            },
        } as any,
    };

    return webMap as WebMap;
}
