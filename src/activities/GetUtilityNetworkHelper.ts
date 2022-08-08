import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import WebMap from "@arcgis/core/WebMap";
import type { IActivityHandler } from "@geocortex/workflow/runtime";
import {
    getUtilityNetworkFromGraphic,
    getAssetDomain,
    getAssetSource,
    getAssetGroup,
    getAssetType,
    getWebMapLayerByAsset,
    getLayerIdByDomainAndSourceId,
    getWebMapLayersByAssets,
    isInTier,
    getTerminalIds,
    getUtilityNetworkAttributeFieldByType,
    getAssetSourceByLayerId,
} from "./utils";

/** An interface that defines the outputs of the activity. */
interface GetUtilityNetworkHelperOutputs {
    /**
     * @description A collection of functions for working with a Utility Network.
     */
    utils: {
        getUtilityNetworkFromGraphic: (
            utilityNetworks: UtilityNetwork[],
            graphic: Graphic
        ) => Promise<UtilityNetwork>;
        getAssetDomain: (
            assetGroupCode: number,
            assetTypeCode: number,
            utilityNetwork: UtilityNetwork
        ) => any;
        getAssetSource: (
            assetGroupCode: number,
            assetTypeCode: number,
            domainNetwork: any
        ) => any;
        getAssetGroup: (assetGroupCode: number, assetSource: any) => any;
        getAssetType: (assetTypeCode: number, assetGroup: any) => any;
        getWebMapLayerByAsset: (
            asset: any,
            layerId: number,
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<FeatureLayer>;
        getLayerIdByDomainAndSourceId: (
            domainNetworkId: number,
            assetSourceId: number,
            utilityNetwork: UtilityNetwork
        ) => number;
        getWebMapLayersByAssets: (
            assets: any[],
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<any>;
        isInTier: (
            assetGroupCode: number,
            assetTypeCode: number,
            tier: any
        ) => boolean;
        getAssetUtilityNetwork: (
            assetGroupCode,
            assetTypeCode,
            utilityNetworks
        ) => any;
        getTerminalIds: (graphic, utilityNetwork) => any;
        getUtilityNetworkAttributeFieldByType: (
            type,
            layerId,
            utilityNetwork
        ) => string;
        getAssetSourceByLayerId: (layerId: number, utilityNetwork: any) => any;
    };
}

/**
 * @displayName GetUtilityNetworkHelper
 * @category Custom Activities
 * @description Returns a set of useful functions for working with a Utility Network.
 */
export default class GetUtilityNetworkHelperActivity
    implements IActivityHandler
{
    /** Perform the execution logic of the activity. */
    execute(): GetUtilityNetworkHelperOutputs {
        const utils = (function UtilityNetworkUtils(): any {
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
                getWebMapLayerByAsset: (asset, layerId, map, utilityNetwork) =>
                    getWebMapLayerByAsset(asset, layerId, map, utilityNetwork),
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
                getAssetSourceByLayerId: (layerId, utilityNetwork) =>
                    getAssetSourceByLayerId(layerId, utilityNetwork),
            };
        })();
        return {
            utils,
        };
    }
}
