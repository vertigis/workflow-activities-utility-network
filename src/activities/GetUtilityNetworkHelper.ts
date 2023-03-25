import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import NetworkElement from "@arcgis/core/rest/networks/support/NetworkElement";
import WebMap from "@arcgis/core/WebMap";
import type { IActivityHandler } from "@geocortex/workflow/runtime";
import SubtypeGroupLayer from "@arcgis/core/layers/SubtypeGroupLayer";
import type { LayerSetCollection } from "./utils";
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
        ) => Record<string, any> | undefined;
        getAssetGroup: (
            assetGroupCode: number,
            assetSource: Record<string, any>
        ) => Record<string, any> | undefined;
        getAssetSource: (
            assetSourceCode: number,
            domainNetwork: Record<string, any>
        ) => Record<string, any> | undefined;
        getAssetSourceByLayerId: (
            layerId: number,
            utilityNetwork: UtilityNetwork
        ) => Record<string, any> | undefined;
        getAssetType: (
            assetTypeCode: number,
            assetGroup: Record<string, any>
        ) => Record<string, any> | undefined;
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
            asset: NetworkElement,
            layerId: number,
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<FeatureLayer | SubtypeGroupLayer | undefined>;
        getWebMapLayersByAssets: (
            assets: NetworkElement[],
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<LayerSetCollection>;
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
