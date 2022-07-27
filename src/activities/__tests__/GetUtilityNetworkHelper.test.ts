import jsonUtils from "esri/geometry/support/jsonUtils";
import GetUtilityNetworkHelper from "../GetUtilityNetworkHelper";
import {
    getAssetDomain,
    getAssetGroup,
    getAssetSource,
    getAssetType,
    getLayerIdBySourceId,
    getUtilityNetworkFromGraphic,
    getWebMapLayerByAsset,
    getWebMapLayersByAssets,
    isInTier,
} from "../utils";

jest.mock("../utils", () => {
    return {
        getUtilityNetworkFromGraphic: jest.fn(),
        getAssetDomain: jest.fn(),
        getAssetSource: jest.fn(),
        getAssetGroup: jest.fn(),
        getAssetType: jest.fn(),
        getWebMapLayerByAsset: jest.fn(),
        getLayerIdBySourceId: jest.fn(),
        getWebMapLayersByAssets: jest.fn(),
        isInTier: jest.fn(),
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GetUtilityNeworkHelper", () => {
    describe("execute", () => {
        it("creates a utils helper function", () => {
            const mockUtils = (function UtilityNetworkUtils(): any {
                return {
                    getUtilityNetworkFromGraphic: (utilityNetwork, graphic) =>
                        getUtilityNetworkFromGraphic(utilityNetwork, graphic),
                    getAssetDomain: (
                        assetGroupCode,
                        assetTypeCode,
                        utilityNetwork
                    ) =>
                        getAssetDomain(
                            assetGroupCode,
                            assetTypeCode,
                            utilityNetwork
                        ),
                    getAssetSource: (
                        assetGroupCode,
                        assetTypeCode,
                        domainNetwork
                    ) =>
                        getAssetSource(
                            assetGroupCode,
                            assetTypeCode,
                            domainNetwork
                        ),
                    getAssetGroup: (assetGroupCode, assetSource) =>
                        getAssetGroup(assetGroupCode, assetSource),
                    getAssetType: (assetTypeCode, assetGroup) =>
                        getAssetType(assetTypeCode, assetGroup),
                    getWebMapLayerByAsset: (
                        asset,
                        layerId,
                        map,
                        utilityNetwork
                    ) =>
                        getWebMapLayerByAsset(
                            asset,
                            layerId,
                            map,
                            utilityNetwork
                        ),
                    getLayerIdBySourceId: (assetSourceId, utilityNetwork) =>
                        getLayerIdBySourceId(assetSourceId, utilityNetwork),
                    getWebMapLayersByAssets: (assets, map, utilityNetwork) =>
                        getWebMapLayersByAssets(assets, map, utilityNetwork),
                    isInTier: (assetGroupCode, assetTypeCode, tier) =>
                        isInTier(assetGroupCode, assetTypeCode, tier),
                };
            })();
            const activity = new GetUtilityNetworkHelper();
            const result = activity.execute();
            expect(result).toBeDefined();
            expect(JSON.stringify(result)).toStrictEqual(
                JSON.stringify({ utils: mockUtils })
            );
        });
    });
});
