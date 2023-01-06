import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Symbol from "@arcgis/core/symbols/Symbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import MapView from "@arcgis/core/views/MapView";

/** An interface that defines the inputs of the activity. */
export interface SketchInputs {
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
     * @displayName Graphics Layer Id
     * @required
     */
    layerId: string;
}

/** An interface that defines the outputs of the activity. */
export interface SketchOutputs {
    /**
     * @description The result of the activity.
     */
    graphic: Graphic | undefined;
    layer: GraphicsLayer | undefined;
}

/**
 * @category Utility Network
 * @description Captures a point on the map.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(MapProvider)
export default class Sketch implements IActivityHandler {
    async execute(
        inputs: SketchInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<SketchOutputs> {
        const { symbol, layerId, sketchType } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }

        const mapView = mapProvider.view as MapView;

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
        const output: Graphic | undefined = await new Promise((resolve) => {
            view.on("create", function (event) {
                if (event.state === "complete") {
                    resolve(event.graphic);
                } else if (event.state === "cancel") {
                    resolve(undefined);
                }
            });
        });
        return {
            graphic: output,
            layer: layer,
        };
    }
}
