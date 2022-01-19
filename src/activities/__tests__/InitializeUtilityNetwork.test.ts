import { InitializeUtilityNetwork } from "../InitializeUtilityNetwork";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import WebMap from "@arcgis/core/WebMap";
import Collection from "@arcgis/core/core/Collection";
import { mockActivityContext } from "../__mocks__/ActivityContext";

jest.mock("@arcgis/core/identity/IdentityManager", () => {
    return function () {
        // no op
    };
});

jest.mock("@arcgis/core/networks/UtilityNetwork", () => {
    return function () {
        return {
            load: () => {
                // no op
            },
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
        const mockedMap = new WebMap({
            portalItem: {
                id: "abc",
                portal: { url: "edf" },
            },
            utilityNetworks: uns,
        });
        (context as any).map = mockedMap;

        it("gets first UtilityNetwork from the WebMap's utilityNetworks collection", async () => {
            const activity = new InitializeUtilityNetwork();
            const result = await activity.execute(context);
            expect(result).toStrictEqual({
                result: mockUn,
            });
        });
    });
});
