import GetDiagramDynamicLayersActivity from "../diagrams/GetDiagramDynamicLayers";
beforeEach(() => {
    jest.clearAllMocks();
});
const response = {
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
};
jest.mock("@arcgis/core/request", () => {
    return function (url, options) {
        return new Promise((resolve) => {
            resolve({ data: response });
        });
    };
});

describe("FindDiagraminfos", () => {
    it("throws if service url input is missing", async () => {
        const activity = new GetDiagramDynamicLayersActivity();
        await expect(
            activity.execute({
                serviceUrl: undefined as any,
                name: "name",
            })
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if name input is missing", async () => {
        const activity = new GetDiagramDynamicLayersActivity();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                name: undefined as any,
            })
        ).rejects.toThrow("name is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new GetDiagramDynamicLayersActivity();

        const result = await activity.execute({
            serviceUrl: "https://server/url",
            name: "name",
        });
        expect(result).toStrictEqual(response);
    });
});
