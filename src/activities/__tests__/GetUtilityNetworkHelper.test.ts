import GetUtilityNetworkHelper from "../GetUtilityNetworkHelper";
import * as utils from "../utils";

describe("GetUtilityNetworkHelper", () => {
    describe("execute", () => {
        it("creates a utils helper", () => {
            const activity = new GetUtilityNetworkHelper();
            const result = activity.execute();
            expect(result).toBeDefined();
            expect(result.utils).toBeDefined();
            expect(result.utils.getAssetDomain).toBe(utils.getAssetDomain);
            expect(result.utils.getAssetGroup).toBe(utils.getAssetGroup);
            expect(result.utils.getAssetSource).toBe(utils.getAssetSource);
            expect(result.utils.getAssetSourceByLayerId).toBe(
                utils.getAssetSourceByLayerId
            );
            expect(result.utils.getAssetType).toBe(utils.getAssetType);
            expect(result.utils.getLayerIdByDomainAndSourceId).toBe(
                utils.getLayerIdByDomainAndSourceId
            );
            expect(result.utils.getLayerIdByDomainAndSourceId).toBe(
                utils.getLayerIdByDomainAndSourceId
            );
            expect(result.utils.getUtilityNetworkAttributeFieldByType).toBe(
                utils.getUtilityNetworkAttributeFieldByType
            );
            expect(result.utils.getUtilityNetworkFromGraphic).toBe(
                utils.getUtilityNetworkFromGraphic
            );
            expect(result.utils.getWebMapLayersByAssets).toBe(
                utils.getWebMapLayersByAssets
            );
            expect(result.utils.isInTier).toBe(utils.isInTier);
        });
    });
});
