import FindDiagramFeatures from "../diagrams/FindDiagramFeatures";
beforeEach(() => {
    jest.clearAllMocks();
});
const response = { features: ["baz"] };
jest.mock("@arcgis/core/request", () => {
    return function (url, options) {
        return new Promise((resolve) => {
            resolve({ data: response });
        });
    };
});

describe("FindDiagramFeatures", () => {
    it("throws if service url input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute({
                serviceUrl: undefined as any,
                name: "digramName",
                fromFeatures: ["foo"],
                addConnectivityAssociations: true,
                includeAggregations: true,
            })
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if name input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                name: undefined as any,
                fromFeatures: ["foo"],
                addConnectivityAssociations: true,
                includeAggregations: true,
            })
        ).rejects.toThrow("diagramName is required");
    });
    it("throws if fromFeatures input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                name: "name",
                fromFeatures: undefined as any,
                addConnectivityAssociations: true,
                includeAggregations: true,
            })
        ).rejects.toThrow("fromFeatures is required");
    });
    it("throws if addConnectivityAssociations input is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                name: "name",
                fromFeatures: ["foo"],
                addConnectivityAssociations: undefined as any,
                includeAggregations: true,
            })
        ).rejects.toThrow("addConnectivityAssociations is required");
    });
    it("throws if name includeAggregations is missing", async () => {
        const activity = new FindDiagramFeatures();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                name: "name",
                fromFeatures: ["foo"],
                addConnectivityAssociations: true,
                includeAggregations: undefined as any,
            })
        ).rejects.toThrow("includeAggregations is required");
    });

    it("calls the service with the path and data", async () => {
        const activity = new FindDiagramFeatures();
        const result = await activity.execute({
            serviceUrl: "https://server/url",
            name: "name",
            fromFeatures: ["foo"],
            addConnectivityAssociations: true,
            includeAggregations: true,
        });
        expect(result).toStrictEqual(response);
    });
});
function result(result: any): Promise<any> {
    throw new Error("Function not implemented.");
}
