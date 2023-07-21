import RunSynthesizeAssociationGeometries from "../RunSynthesizeAssociationGeometries";
import AssociationGeometriesResult from "@arcgis/core/rest/networks/support/AssociationGeometriesResult";

jest.mock("@arcgis/core/networks/Network", () => {
    return function () {
        return {
            networkServiceUrl: "https://abc",
        };
    };
});
jest.mock(
    "@arcgis/core/rest/networks/support/SynthesizeAssociationGeometriesParameters",
    () => {
        return function (params: any) {
            return {
                extent: params.extent,
                returnAttachmentAssociations:
                    params.returnAttachmentAssociations,
                returnConnectivityAssociations:
                    params.returnConnectivityAssociations,
                returnContainerAssociations: params.returnContainerAssociations,
                outSpatialReference: params.outSR,
                maxGeometryCount: params.maxGeometryCount,
            };
        };
    }
);
jest.mock("@arcgis/core/geometry/Extent");
jest.mock("@arcgis/core/geometry/SpatialReference");
jest.mock(
    "@arcgis/core/rest/networks/support/AssociationGeometriesResult",
    () => {
        return function () {
            return {};
        };
    }
);
jest.mock("@arcgis/core/rest/networks/synthesizeAssociationGeometries", () => ({
    synthesizeAssociationGeometries: () => {
        return new AssociationGeometriesResult();
    },
}));

jest.mock(
    "@arcgis/core/rest/networks/support/AssociationGeometriesResult",
    () => {
        return function (params: any) {
            return {
                associations: [],
            };
        };
    }
);

beforeEach(() => {
    jest.clearAllMocks();
});

describe("RunSynthesizeAssociationGeometries", () => {
    describe("execute", () => {
        it("requires utilityNetwork input", async () => {
            const activity = new RunSynthesizeAssociationGeometries();
            await expect(
                activity.execute({
                    utilityNetwork: undefined as any,
                    extent: {} as any,
                    outSR: {} as any,
                    maxGeometryCount: 1,
                })
            ).rejects.toThrow("utilityNetwork is required");
        });
        it("requires extent input", async () => {
            const activity = new RunSynthesizeAssociationGeometries();
            await expect(
                activity.execute({
                    utilityNetwork: {} as any,
                    extent: undefined as any,
                    outSR: {} as any,
                    maxGeometryCount: 1,
                })
            ).rejects.toThrow("extent is required");
        });

        it("requires maxGeometryCount input", async () => {
            const activity = new RunSynthesizeAssociationGeometries();
            await expect(
                activity.execute({
                    utilityNetwork: {} as any,
                    extent: {} as any,
                    outSR: {} as any,
                    maxGeometryCount: undefined as any,
                })
            ).rejects.toThrow("maxGeometryCount is required");
        });

        it("requires outSR input", async () => {
            const activity = new RunSynthesizeAssociationGeometries();
            await expect(
                activity.execute({
                    utilityNetwork: {} as any,
                    extent: {} as any,
                    outSR: undefined as any,
                    maxGeometryCount: 1,
                })
            ).rejects.toThrow("outSR is required");
        });

        it("generates Associated Geometries based on inputs", async () => {
            const activity = new RunSynthesizeAssociationGeometries();
            const expectedResult = new AssociationGeometriesResult();
            const inputs = {
                utilityNetwork: {} as any,
                extent: {} as any,
                returnAttachmentAssociations: true,
                returnConnectivityAssociations: true,
                returnContainerAssociations: true,
                outSR: {} as any,
                maxGeometryCount: 1,
            };
            const result = await activity.execute(inputs);
            expect(result).toStrictEqual({ result: expectedResult });
        });
    });
});
