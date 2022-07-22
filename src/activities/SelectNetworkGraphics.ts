/* eslint-disable prettier/prettier */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";
import {
    NetworkGraphic,
    getPercentageAlong,
    getValue,
    createNetworkGraphic,
    getTerminalIds,
    getPolylineIntersection,
} from "./utils";
import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import Network from "@arcgis/core/networks/Network";
import { Polyline } from "@arcgis/core/geometry";

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
     * @description The target Utility Network.
     * @required
     */
    utilityNetwork: Network & UtilityNetwork;

    /**
     * @displayName Is Filter Barrier
     * @description This indicates whether this barrier starting location should be skipped (filtered) when a trace attempts to find upstream controllers.
     */
    isFilterBarrier?: boolean;

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
        const {
            point,
            locationType,
            isFilterBarrier,
            utilityNetwork,
        } = inputs;
        if (!point) {
            throw new Error("point is required");
        }
        if (!locationType) {
            throw new Error("locationType is required");
        }
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }
        let hitPoint = point;
        const mapProvider = type.create();
        await mapProvider.load();

        const webMap = mapProvider.map as WebMap;
        const view = mapProvider.view as MapView;
        const queriedGraphics: Graphic[] = [];
        for (let i = 0; i < webMap.allLayers.length; i++) {
            const l = webMap.allLayers.getItemAt(i)
            if (l != undefined) {
                if (!l.initialized) {
                    await l.load();
                }
            }
        }
        await view.when();

        const screenPoint = view.toScreen(hitPoint);
        const hitResult = await view.hitTest(screenPoint);
        const hitGraphics = hitResult.results.filter(
            (g) => g.graphic?.attributes && g.graphic.layer.type === "feature"
        );

        for (let i = 0; i < hitGraphics.length; i++) {
            const x = hitGraphics[i];
            const result = await (
                x.graphic.layer as FeatureLayer
            ).queryFeatures({
                objectIds: [x.graphic.getObjectId()],
                returnGeometry: true,
                outFields: ["*"],
                outSpatialReference: { wkid: point.spatialReference.wkid },
            });
            if (
                result.features.length > 0 &&
                getValue(result.features[0].attributes, "globalid") !=
                undefined &&
                getValue(result.features[0].attributes, "assettype") !=
                undefined
            ) {
                result.features[0].layer = x.graphic.layer;

                queriedGraphics.push(result.features[0]);

            }

        }
        const networkGraphics: NetworkGraphic[] = [];

        for (const queriedGraphic of queriedGraphics) {
            const percAlong = await getPercentageAlong(
                queriedGraphic.geometry,
                hitPoint
            );
            let terminalIds: number[] | undefined = undefined;
            if (utilityNetwork != undefined) {
                if (queriedGraphic.geometry) {
                    if (queriedGraphic.geometry.type === 'point') {

                        terminalIds = getTerminalIds(queriedGraphic, utilityNetwork);
                        hitPoint = queriedGraphic.geometry as Point;
                    } else if (queriedGraphic.geometry.type === 'polyline') {
                        const snappedPoint = await getPolylineIntersection(queriedGraphic.geometry as Polyline, hitPoint);
                        if (snappedPoint) {
                            hitPoint = snappedPoint;
                        }
                    }
                }

                const networkGraphic = createNetworkGraphic(
                    hitPoint,
                    queriedGraphic.geometry,
                    queriedGraphic.attributes,
                    queriedGraphic.layer as FeatureLayer,
                    percAlong,
                    locationType,
                    utilityNetwork,
                    isFilterBarrier,
                    terminalIds,

                );
                if (networkGraphic != undefined) {
                    networkGraphics.push(networkGraphic);
                }
            }
        }
        return {
            networkGraphics: networkGraphics,
        };
    }
}
