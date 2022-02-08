/* eslint-disable prettier/prettier */
import type { IActivityHandler, IActivityContext } from "@geocortex/workflow/runtime/IActivityHandler";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";
import {
    TraceGraphic,
    getPercentageAlong,
    getValue,
    getTraceGraphic,
    createSymbol,
} from "./utils";
import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";

import { activate } from "@geocortex/workflow/runtime/Hooks";
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
     * @displayName Selection Color
     * @description The [RGBA] code for the color for the selected features.
     */
    selectionColor?: number[];

    /**
     * @displayName Selection Size
     * @description The size of the symbol for the selected features.
     */
    selectionSize?: number;

    /**
     * @displayName Supported Layer Names
     * @description The names of layers that are supported by the target trace.
     */
    supportedLayerNames?: string[];
}

/** An interface that defines the outputs of the activity. */
export interface SelectNetworkGraphicsOutputs {
    /**
     * @description The trace configurations associated with the Utility Network results.
     */
    locationGraphics: TraceGraphic[];
}

const SELECTION_COLOR = [27, 227, 251, 0.4];
const SELECTION_SIZE = 10;

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
        const { point, supportedLayerNames, locationType } = inputs;

        if (!point) {
            throw new Error("point is required");
        }
        if (!locationType) {
            throw new Error("locationType is required");
        }

        const mapProvider = type.create();
        await mapProvider.load();

        const webMap = mapProvider.map as WebMap;
        const view = mapProvider.view as MapView;
        const supportedLayers = !supportedLayerNames
            ? []
            : supportedLayerNames;

        const selectionColor = inputs.selectionColor
            ? inputs.selectionColor
            : SELECTION_COLOR;
        const selectionSize = inputs.selectionSize
            ? inputs.selectionSize
            : SELECTION_SIZE;


        const queriedGraphics: Graphic[] = [];
        await webMap.load().then(() => {
            webMap.allLayers.forEach( (layer) => {
                if (layer.type == "feature") {
                    const f = layer as FeatureLayer;
                    
                    f.outFields = ["*"];
                    if (f.fields.find(x=> x.name.toLowerCase() === "assetgroup") && f.fields.find(x=> x.name.toLowerCase() === "globalid")) {
                        
                        supportedLayers.push(layer.title);
                   
                    }
                }
            });
        });
        await view.when();
        
        for (let i = 0; i < supportedLayers.length; i++) {
            const l = webMap.allLayers.find(
                (x) => x.title == supportedLayers[i]
            );
            if (l != undefined && !l.initialized) {
                await l.load();
            }
        }

        const screenPoint = view.toScreen(point);
        const hitResult = await view.hitTest(screenPoint);
        const hitGraphics = hitResult.results
        .filter((g) => g.graphic?.attributes);
        
        for (let i = 0; i < hitGraphics.length; i++) {
            const x = hitGraphics[i];
            if(x.graphic.layer.type == "feature"){
                const result = await (x.graphic
                    .layer as FeatureLayer).queryFeatures({
                    objectIds: [x.graphic.getObjectId()],
                    returnGeometry: true,
                    outFields: ["*"],
                    outSpatialReference: { wkid: point.spatialReference.wkid },
                });
                if(result.features.length > 0 && getValue(result.features[0].attributes, "globalid") != undefined){
                    queriedGraphics.push(result.features[0]);
                }
            }
        };


        const graphics = queriedGraphics.map((g) => {
            const percAlong = getPercentageAlong(g.geometry, point);
            g.attributes.percentageAlong = percAlong;
            const symbol = createSymbol("point", selectionColor, selectionSize);
            const result = getTraceGraphic(
                point,
                symbol,
                g.attributes,
                ((g.layer as FeatureLayer).source as any).layer.layerId,
                locationType,
                percAlong
            );
            return result;
        });

        const graphicResults = await Promise.all(graphics);

        return {
            locationGraphics: graphicResults,
        };
    }
}
