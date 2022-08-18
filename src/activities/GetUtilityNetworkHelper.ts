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
 * @description Returns a set of useful functions for working with a Utility Network.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-support-TraceConfiguration.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export default class GetUtilityNetworkHelper implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    execute(): GetUtilityNetworkHelperOutputs {
        const utils = (function UtilityNetworkUtils(): any {
            return {
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
            };
        })();
        return {
            utils,
        };
    }
}
