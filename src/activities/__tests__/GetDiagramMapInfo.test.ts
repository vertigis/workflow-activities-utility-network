import GetDiagramMapInfoActivity from "../templates/GetDiagramMapInfo";
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
        const activity = new GetDiagramMapInfoActivity();
        await expect(
            activity.execute(
                {
                    serviceUrl: undefined as any,
                    diagramName: "name",
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if diagramName input is missing", async () => {
        const activity = new GetDiagramMapInfoActivity();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    diagramName: undefined as any,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("diagramName is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new GetDiagramMapInfoActivity();
        setMockData({
            result: {
                tag: "#ElectricDistribution#RMT001#Medium Voltage Radial",
            },
        });
        const result = await activity.execute(
            {
                serviceUrl: "https://server/url",
                diagramName: "name",
            },
            context,
            DefaultMockChannelProviderType
        );
        expect(result.result).toStrictEqual(getMockData());
    });
});
