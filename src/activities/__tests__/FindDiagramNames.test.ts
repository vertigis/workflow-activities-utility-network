import FindDiagramNames from "../diagrams/FindDiagramNames";
beforeEach(() => {
    jest.clearAllMocks();
});
const response = { diagramNames: ["baz"] };
jest.mock("@arcgis/core/request", () => {
    return function (url, options) {
        return new Promise((resolve) => {
            resolve({ data: response });
        });
    };
});

describe("FindDiagraminfos", () => {
    it("throws if service url input is missing", async () => {
        const activity = new FindDiagramNames();
        await expect(
            activity.execute({
                serviceUrl: undefined as any,
            })
        ).rejects.toThrow("serviceUrl is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new FindDiagramNames();
        const result = await activity.execute({
            serviceUrl: "https://server/url",
        });
        expect(result).toStrictEqual(response);
    });
});
