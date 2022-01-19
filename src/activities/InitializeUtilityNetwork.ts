import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import WebMap from "@arcgis/core/WebMap";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
/** An interface that defines the outputs of the activity. */
export interface InitializeUtilityNetworkOutputs {
    /**
     * @description The initialized Utility Network.
     */
    result: UtilityNetwork;
}

/**
 * @category Utility Network
 * @description Initializes the Utility Network from the given web map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-UtilityNetwork.html
 * @clientOnly
 * @unsupportedApps GMV
 */

export class InitializeUtilityNetwork implements IActivityHandler {
    async execute(
        context: IActivityContext
    ): Promise<InitializeUtilityNetworkOutputs> {
        const map = (context as any).map;
        if (!map) {
            throw new Error("map is required");
        }
        let utilityNetwork!: UtilityNetwork;

        if (map.utilityNetworks) {
            utilityNetwork = map.utilityNetworks.getItemAt(0);
        } else {
            const token = this.getOauthInfo();
            IdentityManager.registerToken(token);
            const webmap = new WebMap({
                portalItem: {
                    id: map.portalItem.id,
                    portal: { url: map.portalItem.portal.url },
                },
            });

            await webmap.load();
            if (
                webmap.utilityNetworks &&
                webmap.utilityNetworks != null &&
                webmap.utilityNetworks.length > 0
            ) {
                utilityNetwork = webmap.utilityNetworks.getItemAt(0);
                const uToken = {
                    expires: token.expires,
                    server: (utilityNetwork as any).layerUrl,
                    ssl: token.ssl,
                    token: token.token,
                    userId: token.userId,
                };
                IdentityManager.registerToken(uToken);
                await utilityNetwork.load();
            } else {
                throw new Error("Utility network not found.");
            }
        }
        return {
            result: utilityNetwork,
        };
    }
    getOauthInfo(): any {
        let token;
        try {
            const userInfo = this.getUserInfo();
            token = {
                expires: userInfo.credentials.expiration,
                server: userInfo.credentials.url,
                ssl: true,
                token: userInfo.credentials.token,
                userId: userInfo.identity.username,
            };
        } catch (e) {
            throw new Error("Unable to access user info.");
        }
        return token;
    }

    getUserInfo(): any {
        try {
            for (const itemKey in localStorage) {
                // Looking for something like {GUID}:oauth-result
                if (
                    itemKey ===
                    "EDD74EC3-3013-45CB-9935-EB9117BB7979:oauth-result"
                ) {
                    return JSON.parse(localStorage[itemKey]);
                }
            }
        } catch (e) {
            throw new Error("Unable to locate token for user.");
        }
    }
}
