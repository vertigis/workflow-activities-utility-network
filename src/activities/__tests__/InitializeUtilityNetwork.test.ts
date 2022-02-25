import { InitializeUtilityNetwork } from "../InitializeUtilityNetwork";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import Collection from "@arcgis/core/core/Collection";
import { mockActivityContext } from "../__mocks__/ActivityContext";
import { mockWebMap } from "../__mocks__/WebMap";
import { mockMapView } from "../__mocks__/MapView";

const mockMapProvider = jest.fn();

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
};

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function () {
        // no op
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
        };
    };
});

const mockColl = new Collection();
mockColl.push(mockUn);

jest.mock("@arcgis/core/WebMap", () => {
    return function (params: any) {
        return {
            portalItem: params.portalItem,
            utilityNetworks: mockColl,
            load: () => {
                //no op
            },
        };
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("InitializeUtilityNetwork", () => {
    describe("execute", () => {
        const un = new UtilityNetwork();
        const uns = new Collection<UtilityNetwork>();
        uns.push(un);
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
            });
        });
    });
});
