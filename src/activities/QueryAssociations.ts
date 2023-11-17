import type { IActivityHandler } from "@geocortex/workflow/runtime/IActivityHandler";
import Network from "@arcgis/core/networks/Network";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import { queryAssociations } from "@arcgis/core/rest/networks/queryAssociations";
import QueryAssociationsParameters from "esri/rest/networks/support/QueryAssociationsParameters";
import QueryAssociationsResult from "esri/rest/networks/support/QueryAssociationsResult";

export interface QueryAssociationsInputs {
    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
    utilityNetwork: Network & UtilityNetwork;

    /**
     * @displayName Network Elements
     * @description The Network Elements for which the association is queried.
     * @required
     */
    elements?: {
        assetGroupCode?: number;
        assetTypeCode?: number;
        globalId: string;
        networkSourceId: number;
        objectId?: number;
        positionFrom?: number;
        positionTo?: number;
        terminalId?: number;
    }[];

    /**
     * @description The association types to be queried. The default is all association types.
     */
    types?: "connectivity" | "attachment" | "containment" | "junction-edge-from-connectivity" | "junction-midspan-connectivity" | "junction-edge-to-connectivity" | string[];

    /**
     * @displayName Geodatabase Version
     * @description The geodatabase version on which the operation will be performed.
     */
    gdbVersion?: string;

    /**
     * @description Whether to return logically deleted associations. The default is false.
     */
    returnDeletes?: boolean;

    /**
     * @displayName Moment
     * @description The date/timestamp (in UTC) to execute the trace at a given time.
     */
    moment?: number;
}

export interface QueryAssociationsOutputs {
    /**
     * @description The associations result.
     */
    result: QueryAssociationsResult
}

/**
 * @category Utility Network
 * @description Queries the associations table and return associations for network features in a utility network.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-networks-queryAssociations.html
 * @clientOnly
 * @supportedApps EXB, GWV
 */
export default class QueryAssociations implements IActivityHandler {
    async execute(inputs: QueryAssociationsInputs): Promise<QueryAssociationsOutputs> {
        const {
            types,
            utilityNetwork,
            ...other
        } = inputs;

        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }

        const params = new QueryAssociationsParameters({
            types: typeof types === "string" ? [types] : types,
            ...other
        });
        const result = await queryAssociations(utilityNetwork.networkServiceUrl, params);

        return {
            result,
        };
    }
}
