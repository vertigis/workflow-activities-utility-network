import Collection from "@arcgis/core/core/Collection";
import WebMap from "@arcgis/core/WebMap";
import Layer from "@arcgis/core/layers/Layer";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function () {
        // no op;
    };
});

export function mockWebMap(): WebMap {
    const webMap: Partial<WebMap> = {
        load: () => {
            return Promise.resolve({} as WebMap);
        },
        utilityNetworks: new Collection<UtilityNetwork>([new UtilityNetwork()]),
        allLayers: new Collection<Layer>(),
        portalItem: {
            portal: {
                credential: {},
            },
        } as any,
    };

    return webMap as WebMap;
}
