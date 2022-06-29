import FindDiagramFeatures from "../templates/FindDiagramFeatures";
import { mockActivityContext } from "../__mocks__/ActivityContext";
import {
    DefaultMockChannelProviderType,
    getMockData,
    mockChannel,
    setMockData,
} from "../__mocks__/ChannelProvider";
const mockProvider = DefaultMockChannelProviderType;
const context = mockActivityContext();
beforeEach(() => {
    jest.clearAllMocks();
});

describe("FindDiagramFeatures", () => {
    it("throws if service url input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute(
                {
                    serviceUrl: undefined as any,
                    name: "digramName",
                    fromFeatures: ["foo"],
                    addConnectivityAssociations: true,
                    includeAggregations: true,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if name input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    name: undefined as any,
                    fromFeatures: ["foo"],
                    addConnectivityAssociations: true,
                    includeAggregations: true,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("diagramName is required");
    });
    it("throws if fromFeatures input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    name: "name",
                    fromFeatures: undefined as any,
                    addConnectivityAssociations: true,
                    includeAggregations: true,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("fromFeatures is required");
    });
    it("throws if addConnectivityAssociations input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    name: "name",
                    fromFeatures: ["foo"],
                    addConnectivityAssociations: undefined as any,
                    includeAggregations: true,
                },
                context,
                mockChannel as any
            )
        ).rejects.toThrow("addConnectivityAssociations is required");
    });
    it("throws if name includeAggregations is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    name: "name",
                    fromFeatures: ["foo"],
                    addConnectivityAssociations: true,
                    includeAggregations: undefined as any,
                },
                context,
                mockChannel as any
            )
        ).rejects.toThrow("includeAggregations is required");
    });

    it("calls the service with the path and data", async () => {
        const activity = new FindDiagramFeatures();
        setMockData({ features: ["baz"] });
        const result = await activity.execute(
            {
                serviceUrl: "https://server/url",
                name: "name",
                fromFeatures: ["foo"],
                addConnectivityAssociations: true,
                includeAggregations: true,
            },
            context,
            DefaultMockChannelProviderType
        );
        expect(result).toStrictEqual(getMockData());
    });
});
