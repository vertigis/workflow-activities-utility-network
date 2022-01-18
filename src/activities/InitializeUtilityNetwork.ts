import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import WebMap from "@arcgis/core/WebMap";

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

                await utilityNetwork.load();
            } else {
                throw new Error("Utility network not found.");
            }
        }
        await utilityNetwork.load();
        return {
            result: utilityNetwork,
        };
    }
}
