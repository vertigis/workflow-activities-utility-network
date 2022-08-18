import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import WebMap from "@arcgis/core/WebMap";
import type { IActivityHandler } from "@geocortex/workflow/runtime";
import {
    getAssetDomain,
    getAssetGroup,
    getAssetSource,
    getAssetSourceByLayerId,
    getAssetType,
    getLayerIdByDomainAndSourceId,
    getTerminalIds,
    getUtilityNetworkAttributeFieldByType,
    getUtilityNetworkFromGraphic,
    getWebMapLayerByAsset,
    getWebMapLayersByAssets,
    isInTier,
} from "./utils";

/** An interface that defines the outputs of the activity. */
interface GetUtilityNetworkHelperOutputs {
    /**
     * @description A collection of functions for working with a Utility Network.
     */
    utils: {
        getAssetDomain: (
            assetSourceCode: number,
            utilityNetwork: UtilityNetwork
        ) => any | undefined;
        getAssetGroup: (
            assetGroupCode: number,
            assetSource: Record<string, any>
        ) => any | undefined;
        getAssetSource: (
            assetSourceCode: number,
            domainNetwork: Record<string, any>
        ) => any | undefined;
        getAssetSourceByLayerId: (
            layerId: number,
            utilityNetwork: UtilityNetwork
        ) => any | undefined;
        getAssetType: (
            assetTypeCode: number,
            assetGroup: Record<string, any>
        ) => any | undefined;
        getLayerIdByDomainAndSourceId: (
            domainNetworkId: number,
            assetSourceId: number,
            utilityNetwork: UtilityNetwork
        ) => number | undefined;
        getTerminalIds: (
            graphic: Graphic,
            utilityNetwork: UtilityNetwork
        ) => number[];
        getUtilityNetworkAttributeFieldByType: (
            type: string,
            layerId: number,
            utilityNetwork: UtilityNetwork
        ) => string | undefined;
        getUtilityNetworkFromGraphic: (
            utilityNetworks: UtilityNetwork[],
            graphic: Graphic
        ) => Promise<UtilityNetwork | undefined>;
        getWebMapLayerByAsset: (
            asset: Record<string, any>,
            layerId: number,
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<FeatureLayer | undefined>;
        getWebMapLayersByAssets: (
            assets: any[],
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<any>;
        isInTier: (
            assetGroupCode: number,
            assetTypeCode: number,
            tier: Record<string, any>
        ) => boolean;
    };
}

/**
 * @category Utility Network
 * @defaultName unHelper
 * @displayName Get Utility Network Helper
 * @description Returns a set of useful functions for working with a Utility Network.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-support-TraceConfiguration.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export default class GetUtilityNetworkHelper implements IActivityHandler {
    execute(): GetUtilityNetworkHelperOutputs {
        return {
            utils: Object.freeze({
                getAssetDomain,
                getAssetGroup,
                getAssetSource,
                getAssetSourceByLayerId,
                getAssetType,
                getLayerIdByDomainAndSourceId,
                getTerminalIds,
                getUtilityNetworkAttributeFieldByType,
                getUtilityNetworkFromGraphic,
                getWebMapLayerByAsset,
                getWebMapLayersByAssets,
                isInTier,
            }),
        };
    }
}
