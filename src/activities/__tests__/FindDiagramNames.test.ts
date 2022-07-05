import FindDiagramNamesActivity from "../templates/FindDiagramNames";
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
        const activity = new FindDiagramNamesActivity();
        await expect(
            activity.execute(
                {
                    serviceUrl: undefined as any,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("serviceUrl is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new FindDiagramNamesActivity();
        setMockData({ diagramNames: ["baz"] });
        const result = await activity.execute(
            {
                serviceUrl: "https://server/url",
            },
            context,
            DefaultMockChannelProviderType
        );
        expect(result).toStrictEqual(getMockData());
    });
});
