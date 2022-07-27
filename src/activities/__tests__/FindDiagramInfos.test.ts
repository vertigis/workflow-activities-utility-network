import FindDiagraminfos from "../diagrams/FindDiagramInfos";
beforeEach(() => {
    jest.clearAllMocks();
});
const response = { diagramInfos: ["baz"] };
jest.mock("@arcgis/core/request", () => {
    return function (url, options) {
        return new Promise((resolve) => {
            resolve({ data: response });
        });
    };
});

describe("FindDiagraminfos", () => {
    it("throws if service url input is missing", async () => {
        const activity = new FindDiagraminfos();
        await expect(
            activity.execute({
                serviceUrl: undefined as any,
                names: ["digramName"],
            })
        ).rejects.toThrow("serviceUrl is required");
    });
    it("throws if names input is missing", async () => {
        const activity = new FindDiagraminfos();
        await expect(
            activity.execute({
                serviceUrl: "https://server/url",
                names: undefined as any,
            })
        ).rejects.toThrow("names is required");
    });

    it("calls the service with the path and data", async () => {
        const activity = new FindDiagraminfos();
        const result = await activity.execute({
            serviceUrl: "https://server/url",
            names: ["name"],
        });
        expect(result).toStrictEqual(response);
    });
});
