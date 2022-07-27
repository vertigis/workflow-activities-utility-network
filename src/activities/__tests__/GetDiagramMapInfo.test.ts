import GetDiagramMapInfoActivity from "../diagrams/GetDiagramMapInfo";
jest.mock("@arcgis/core/request", () => {
    return function (url, options) {
        return new Promise((resolve) => {
            resolve({ data: response });
        });
    };
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
describe("FindDiagraminfos", () => {
    it("throws if service url input is missing", async () => {
        const activity = new GetDiagramMapInfoActivity();
        await expect(
            activity.execute({
                serviceUrl: undefined as any,
                diagramName: "name",
            })
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if diagramName input is missing", async () => {
        const activity = new GetDiagramMapInfoActivity();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                diagramName: undefined as any,
            })
        ).rejects.toThrow("diagramName is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new GetDiagramMapInfoActivity();

        const result = await activity.execute({
            serviceUrl: "https://server/url",
            diagramName: "name",
        });
        expect(result.result).toStrictEqual(response);
    });
});
