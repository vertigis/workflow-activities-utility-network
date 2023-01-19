import Extent from "@arcgis/core/geometry/Extent";
import ValidateNetworkTopology from "../ValidateNetworkTopology";
jest.mock("@arcgis/core/request", () => {
    return function (url, options) {
        return new Promise((resolve) => {
            resolve({ data: response });
        });
    };
});
const response = {
    moment: 123456,
    fullUpdate: false,
    validateErrorsCreated: false,
    dirtyAreaCount: 0,
    exceededTransferLimit: false,
    serviceEdits: [
        // only if returnEdits is true
        {
            id: 123,
            editedFeatures: {
                adds: [],
                updates: [],
                deletes: [],
            },
        },
    ],
    success: true,
};
describe("FindDiagraminfos", () => {
    it("throws if utilityNetwork input is missing", async () => {
        const activity = new ValidateNetworkTopology();
        await expect(
            activity.execute({
                utilityNetwork: undefined as any,
                validateArea: {} as any,
            })
        ).rejects.toThrow("utilityNetwork is required");
    });
    it("throws if validateArea input is missing", async () => {
        const activity = new ValidateNetworkTopology();
        await expect(
            activity.execute({
                utilityNetwork: {
                    networkServiceUrl: "https://someSever",
                } as any,
                validateArea: undefined as any,
            })
        ).rejects.toThrow("validateArea is required");
    });
    it("calls the service with the path and data", async () => {
        const activity = new ValidateNetworkTopology();

        const result = await activity.execute({
            utilityNetwork: { networkServiceUrl: "https://someSever" } as any,
            validateArea: {
                xmin: -109.55,
                ymin: 25.76,
                xmax: -86.39,
                ymax: 49.94,
                spatialReference: {
                    wkid: 4326,
                },
            } as Extent,
        });
        expect(result.result).toStrictEqual(response);
    });
});
