import FindDiagraminfos from "../templates/FindDiagramInfos";
import { mockActivityContext } from "../__mocks__/ActivityContext";
import {
    DefaultMockChannelProviderType,
    getMockData,
    setMockData,
} from "../__mocks__/ChannelProvider";
const mockProvider = DefaultMockChannelProviderType;
const context = mockActivityContext();
beforeEach(() => {
    jest.clearAllMocks();
});

describe("FindDiagraminfos", () => {
    it("throws if service url input is missing", async () => {
        const activity = new FindDiagraminfos();
        await expect(
            activity.execute(
                {
                    serviceUrl: undefined as any,
                    names: ["digramName"],
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if names input is missing", async () => {
        const activity = new FindDiagraminfos();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    names: undefined as any,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("names is required");
    });

    it("calls the service with the path and data", async () => {
        const activity = new FindDiagraminfos();
        setMockData({ diagramInfos: ["baz"] });
        const result = await activity.execute(
            {
                serviceUrl: "https://server/url",
                names: ["name"],
            },
            context,
            DefaultMockChannelProviderType
        );
        expect(result).toStrictEqual(getMockData());
    });
});
