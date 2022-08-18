import Collection from "@arcgis/core/core/Collection";
import WebMap from "@arcgis/core/WebMap";
import Layer from "@arcgis/core/layers/Layer";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function () {
        // no op;
    };
});
export const mockUn = new UtilityNetwork();
jest.mock("@arcgis/core/core/Collection", () => {
    return function () {
        return {
            push: (utilityNetwork: UtilityNetwork) => {
                //no op
            },
            getItemAt: (i: number) => {
                return mockUn;
            },
            toArray: () => {
                return [mockUn];
            },
        };
    };
});

export const mockColl = new Collection();

export function mockWebMap(): WebMap {
    const webMap: Partial<WebMap> = {
        load: () => {
            return Promise.resolve({} as WebMap);
        },
        utilityNetworks: mockColl,
        allLayers: new Collection<Layer>(),
        portalItem: {
            portal: {
                credential: {},
            },
        } as any,
    };

    return webMap as WebMap;
}
