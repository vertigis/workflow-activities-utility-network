/* eslint-disable prettier/prettier */
import type { IActivityHandler, IActivityContext } from "@geocortex/workflow/runtime/IActivityHandler";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";
import {
    NetworkGraphic,
    getPercentageAlong,
    getValue,
    createNetworkGraphic,
    getNetworkLayerIds,
} from "./utils";
import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import UtilityNetwork from "esri/networks/UtilityNetwork";
import Network from "@arcgis/core/networks/Network";
import Layer from "@arcgis/core/layers/Layer";

/** An interface that defines the inputs of the activity. */
export interface SelectNetworkGraphicsInputs {
    /**
     * @displayName Point
     * @description The point on the map to search.
     ** @required
     */
    point: Point;

    /**
     * @displayName Location Type
     * @description The type of location.
     ** @required
     */
    locationType: "starting-point" | "barrier";

    /**
     * @displayName Utility Network
     * @description The Utility Network object for the target service.
     * @required
     */
         utilityNetwork: Network & UtilityNetwork;

    /**
     * @displayName Is Filter Barrier
     * @description This indicates whether this barrier starting location should be skipped (filtered) when a trace attempts to find upstream controllers.
     */
     isFilterBarrier?: boolean;

    /**
      * @displayName Terminal Id
      * @description The terminal Id to place the starting location at. Applicable for junction/device sources only.
      */
     terminalId?: number;
}

/** An interface that defines the outputs of the activity. */
export interface SelectNetworkGraphicsOutputs {
    /**
     * @description The trace configurations associated with the Utility Network results.
     */
     networkGraphics?: NetworkGraphic[];

}

/**
 * @category Utility Network
 * @description Select the Utility Network Graphics to be used as a starting point or barrier from a map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-support-TraceConfiguration.html
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(MapProvider)
export class SelectNetworkGraphics implements IActivityHandler {
    async execute(
        inputs: SelectNetworkGraphicsInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<SelectNetworkGraphicsOutputs> {
        const { point, utilityNetwork, locationType, isFilterBarrier, terminalId } = inputs;

        if (!point) {
            throw new Error("point is required");
        }
        if (!locationType) {
            throw new Error("locationType is required");
        }
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        const mapProvider = type.create();
        await mapProvider.load();

        const webMap = mapProvider.map as WebMap;
        const view = mapProvider.view as MapView;
        const supportedLayerIds = getNetworkLayerIds(utilityNetwork);
        const supportedLayers: Layer[] = [];
        const queriedGraphics: Graphic[] = [];
        for (let i = 0; i < supportedLayerIds.length; i++) {
            const l = webMap.allLayers.find(
                (x) => x.type === "feature" && (x as any).source?.layer?.layerId == supportedLayerIds[i]
            );
            if (l != undefined ) {
                supportedLayers.push(l);
                if(!l.initialized) {
                    await l.load();
                }
            }
            
        }
        await view.when();


        const screenPoint = view.toScreen(point);
        const hitResult = await view.hitTest(screenPoint);
        const hitGraphics = hitResult.results
        .filter((g) => g.graphic?.attributes);
        
        for (let i = 0; i < hitGraphics.length; i++) {
            const x = hitGraphics[i];
            if(x.graphic.layer.type == "feature"  
                && supportedLayers.findIndex(l=> (l as FeatureLayer).layerId == (x.graphic.layer as FeatureLayer).layerId) != -1) {
                const result = await (x.graphic
                    .layer as FeatureLayer).queryFeatures({
                    objectIds: [x.graphic.getObjectId()],
                    returnGeometry: true,
                    outFields: ["*"],
                    outSpatialReference: { wkid: point.spatialReference.wkid },
                });
                if(result.features.length > 0 && getValue(result.features[0].attributes, "globalid") != undefined &&
                getValue(result.features[0].attributes, "assettype") != undefined ){
                    result.features[0].layer = x.graphic.layer;
                    queriedGraphics.push(result.features[0]);
                }
            }
        };
        const networkGraphics: NetworkGraphic[] = [];

        for(const queriedGraphic of queriedGraphics){
            const percAlong = await getPercentageAlong(queriedGraphic.geometry, point);
            const networkGraphic = createNetworkGraphic(
                point,
                queriedGraphic.attributes,
                queriedGraphic.layer as FeatureLayer,
                percAlong,
                locationType,
                isFilterBarrier,
                terminalId,

            );
            networkGraphics.push(networkGraphic);

        }
        return {
            networkGraphics: networkGraphics,
        };
    }
}
