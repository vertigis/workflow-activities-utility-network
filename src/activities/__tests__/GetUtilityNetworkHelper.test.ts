import jsonUtils from "esri/geometry/support/jsonUtils";
import GetUtilityNetworkHelper from "../GetUtilityNetworkHelper";
import {
    getAssetDomain,
    getAssetGroup,
    getAssetSource,
    getAssetType,
    getLayerIdByDomainAndSourceId,
    getUtilityNetworkFromGraphic,
    getWebMapLayerByAsset,
    getWebMapLayersByAssets,
    isInTier,
    getTerminalIds,
    getUtilityNetworkAttributeFieldByType,
} from "../utils";

jest.mock("../utils", () => {
    return {
        getUtilityNetworkFromGraphic: jest.fn(),
        getAssetDomain: jest.fn(),
        getAssetSource: jest.fn(),
        getAssetGroup: jest.fn(),
        getAssetType: jest.fn(),
        getWebMapLayerByAsset: jest.fn(),
        getLayerIdByDomainAndSourceId: jest.fn(),
        getWebMapLayersByAssets: jest.fn(),
        isInTier: jest.fn(),
        getAssetUtilityNetwork: jest.fn(),
        getTerminalIds: jest.fn(),
        getUtilityNetworkAttributeFieldByType: jest.fn(),
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
                    getAssetDomain: (assetSourceCode, utilityNetwork) =>
                        getAssetDomain(assetSourceCode, utilityNetwork),
                    getAssetSource: (assetSourceCode, domainNetwork) =>
                        getAssetSource(assetSourceCode, domainNetwork),
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
                    getLayerIdByDomainAndSourceId: (
                        domainNetworkId,
                        assetSourceId,
                        utilityNetwork
                    ) =>
                        getLayerIdByDomainAndSourceId(
                            domainNetworkId,
                            assetSourceId,
                            utilityNetwork
                        ),
                    getWebMapLayersByAssets: (assets, map, utilityNetwork) =>
                        getWebMapLayersByAssets(assets, map, utilityNetwork),
                    isInTier: (assetGroupCode, assetTypeCode, tier) =>
                        isInTier(assetGroupCode, assetTypeCode, tier),
                    getTerminalIds: (graphic, utilityNetwork) =>
                        getTerminalIds(graphic, utilityNetwork),
                    getUtilityNetworkAttributeFieldByType: (
                        type,
                        layerId,
                        utilityNetwork
                    ) =>
                        getUtilityNetworkAttributeFieldByType(
                            type,
                            layerId,
                            utilityNetwork
                        ),
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
