import type { IActivityHandler } from "@geocortex/workflow/runtime";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";

import MapView from "esri/views/MapView";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Symbol from "esri/symbols/Symbol";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

/** An interface that defines the inputs of the activity. */
interface SketchPointInputs {
    /**
     * @displayName Point Symbol
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    symbol?: Symbol;

    /**
     * @displayName Sketch Type
     * @required
     */
    sketchType:
        | "point"
        | "multipoint"
        | "polyline"
        | "polygon"
        | "rectangle"
        | "circle";
    /**
     * @displayName Map View
     * @required
     */
    mapView: MapView;
    /**
     * @displayName Graphics Layer Id
     * @required
     */
    layerId: string;
}

/** An interface that defines the outputs of the activity. */
interface SketchPointOutputs {
    /**
     * @description The result of the activity.
     */
    graphic: Graphic | undefined;
    layer: GraphicsLayer;
}

/**
 * @category Utility Network
 * @description Captures a point on the map.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
export default class SketchActivity implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(inputs: SketchPointInputs): Promise<SketchPointOutputs> {
        const { symbol, mapView, layerId, sketchType } = inputs;

        let layer: GraphicsLayer = mapView.map.allLayers.find(
            (x) => x.id == layerId && x.type == "graphics"
        ) as GraphicsLayer;
        if (layer == undefined) {
            layer = new GraphicsLayer({ id: layerId });
        }
        let view: SketchViewModel;

        switch (sketchType) {
            case "circle":
            case "polygon":
            case "rectangle":
                view = new SketchViewModel({
                    view: mapView,
                    layer: layer,
                    polygonSymbol: symbol as SimpleFillSymbol,
                });
                break;
            case "multipoint":
            case "point":
                view = new SketchViewModel({
                    view: mapView,
                    layer: layer,
                    pointSymbol: symbol as SimpleMarkerSymbol,
                });
                break;
            case "polyline":
                view = new SketchViewModel({
                    view: mapView,
                    layer: layer,
                    polylineSymbol: symbol as SimpleLineSymbol,
                });
        }

        view.create(sketchType);
        const output: Graphic = await new Promise((resolve) => {
            view.on("create", function (event) {
                if (event.state === "complete") {
                    resolve(event.graphic);
                }
            });
        });
        return {
            graphic: output,
            layer: layer,
        };
    }
}
