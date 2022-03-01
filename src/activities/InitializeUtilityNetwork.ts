import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import WebMap from "@arcgis/core/WebMap";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import Credential from "@arcgis/core/identity/Credential";
import Network from "@arcgis/core/networks/Network";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";

import { activate } from "@geocortex/workflow/runtime/Hooks";

/** An interface that defines the outputs of the activity. */
export interface InitializeUtilityNetworkOutputs {
    /**
     * @description The initialized Utility Network.
     */
    result: UtilityNetwork;
}

/**
 * @category Utility Network
 * @defaultName initUtilityNetwork
 * @description Initializes the Utility Network from the given web map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-UtilityNetwork.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(MapProvider)
export class InitializeUtilityNetwork implements IActivityHandler {
    async execute(
        inputs: unknown,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<InitializeUtilityNetworkOutputs> {
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }
        const map = mapProvider.map as WebMap;
        let utilityNetwork: UtilityNetwork;
        const portalItem = map.portalItem as any;
        if (map.utilityNetworks) {
            utilityNetwork = map.utilityNetworks.getItemAt(0);
        } else {
            const portalOauthInfo = this.getOauthInfo(
                portalItem.portal.credential
            );
            IdentityManager.registerToken(portalOauthInfo);
            const webmap = new WebMap({
                portalItem: {
                    id: portalItem.id,
                    portal: { url: portalItem.portal.url },
                },
            });

            await webmap.load();
            if (webmap.utilityNetworks?.length > 0) {
                utilityNetwork = webmap.utilityNetworks.getItemAt(0);
                const agsOauthInfo = this.getOauthInfo(
                    portalItem.portal.credential,
                    (utilityNetwork as unknown as Network).networkServiceUrl
                );
                IdentityManager.registerToken(agsOauthInfo);
                await utilityNetwork.load();
            } else {
                throw new Error("Utility network not found.");
            }
        }
        return {
            result: utilityNetwork,
        };
    }
    getOauthInfo(credential: Credential, server?: string): any {
        let token;
        try {
            token = {
                expires: credential.expires,
                server: server ? server : credential.server,
                ssl: true,
                token: credential.token,
                userId: credential.userId,
            };
        } catch (e) {
            throw new Error("Unable to access user info.");
        }
        return token;
    }
}
