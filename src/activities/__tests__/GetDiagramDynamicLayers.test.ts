import GetDiagramDynamicLayersActivity from "../templates/GetDiagramDynamicLayers";
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
        const activity = new GetDiagramDynamicLayersActivity();
        await expect(
            activity.execute(
                {
                    serviceUrl: undefined as any,
                    name: "name",
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if name input is missing", async () => {
        const activity = new GetDiagramDynamicLayersActivity();
        await expect(
            activity.execute(
                {
                    serviceUrl: "https://server/url",
                    name: undefined as any,
                },
                context,
                DefaultMockChannelProviderType as any
            )
        ).rejects.toThrow("name is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new GetDiagramDynamicLayersActivity();
        setMockData({
            dynamicLayers: [
                {
                    id: 101,
                    source: {
                        type: "workspaceLayer",
                        workspaceId: "Diagram",
                        layerId: "0_ElectricDistributionAssembly",
                    },
                    definitionExpression:
                        "MAP.UN_6_Junctions.DIAGRAMGUID = '{FDA323D6-4868-4375-9773-06AFF80B2F02}'",
                },
            ],
        });
        const result = await activity.execute(
            {
                serviceUrl: "https://server/url",
                name: "name",
            },
            context,
            DefaultMockChannelProviderType
        );
        expect(result).toStrictEqual(getMockData());
    });
});
