import { InitializeUtilityNetwork } from "../InitializeUtilityNetwork";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import Collection from "@arcgis/core/core/Collection";
import { mockActivityContext } from "../__mocks__/ActivityContext";
import { mockWebMap } from "../__mocks__/WebMap";
import { mockMapView } from "../__mocks__/MapView";
import WebMap from "@arcgis/core/WebMap";

jest.mock("@arcgis/core/identity/IdentityManager", () => ({
    registerToken: jest.fn(),
}));

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
            view: mockMapView(),
        };
    },
    load: jest.fn(),
    map: {},
    view: {},
    UtilityNetworks: new Collection(),
};

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function () {
        return {
            load: jest.fn(),
        };
    };
});
const mockUn = new UtilityNetwork();
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

const mockColl = new Collection();
mockColl.push(mockUn);

jest.mock("@arcgis/core/WebMap", () => {
    return function (params: any) {
        return {
            portalItem: {
                portal: {
                    credential: {},
                },
            } as any,
            utilityNetworks: mockColl,
            load: () => {
                //no op
            },
        };
    };
});

const mockMap = new WebMap();
mockMap.utilityNetworks = mockColl;

mockProvider.map = mockMap;
beforeEach(() => {
    jest.clearAllMocks();
});

describe("InitializeUtilityNetwork", () => {
    describe("execute", () => {
        const context = mockActivityContext();
        it("gets first UtilityNetwork from the WebMap's utilityNetworks collection", async () => {
            const activity = new InitializeUtilityNetwork();
            const result = await activity.execute(
                {},
                context,
                mockProvider as any
            );
            expect(result).toStrictEqual({
                result: mockUn,
                utilityNetworks: [mockUn],
            });
        });
    });
});
