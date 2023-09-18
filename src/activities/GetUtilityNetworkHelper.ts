import Graphic from "@arcgis/core/Graphic";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import NetworkElement from "@arcgis/core/rest/networks/support/NetworkElement";
import WebMap from "@arcgis/core/WebMap";
import type { IActivityHandler } from "@geocortex/workflow/runtime";
import {
    LayerSet,
    getAssetDomain,
    getAssetGroup,
    getAssetSource,
    getAssetSourceByLayerId,
    getAssetType,
    getLayerIdByDomainAndSourceId,
    getTerminalIds,
    getUtilityNetworkAttributeFieldByType,
    getUtilityNetworkFromGraphic,
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
        getWebMapLayersByAssets: (
            assets: NetworkElement[],
            map: WebMap,
            utilityNetwork: UtilityNetwork
        ) => Promise<LayerSet[]>;
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
 * @supportedApps EXB, GWV
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
                getWebMapLayersByAssets,
                isInTier,
            }),
        };
    }
}
