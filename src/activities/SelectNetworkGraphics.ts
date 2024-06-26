/* eslint-disable prettier/prettier */
import type {
    IActivityHandler,
    IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";
import {
    NetworkGraphic,
    getPercentageAlong,
    createNetworkGraphic,
    getTerminalIds,
    getPolylineIntersection,
    getUtilityNetworkAttributeFieldByType,
} from "./utils";
import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork";
import Network from "@arcgis/core/networks/Network";
import { Polyline } from "@arcgis/core/geometry";
import SubtypeGroupLayer from "esri/layers/SubtypeGroupLayer";

/** An interface that defines the inputs of the activity. */
export interface SelectNetworkGraphicsInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @displayName Point
     * @description The point on the map to search.
     * @required
     */
    point: Point;

    /**
     * @displayName Location Type
     * @description The type of location.
     * @required
     */
    locationType: "starting-point" | "barrier" | string;

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

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
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
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class SelectNetworkGraphics implements IActivityHandler {
    async execute(
        inputs: SelectNetworkGraphicsInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<SelectNetworkGraphicsOutputs> {
        const { point, locationType, isFilterBarrier, utilityNetwork } = inputs;
        if (!point) {
            throw new Error("point is required");
        }
        if (!locationType) {
            throw new Error("locationType is required");
        }
        if (!utilityNetwork) {
            throw new Error("utilityNetwork is required");
        }

        const networkGraphics: NetworkGraphic[] = [];
        let hitPoint = point;

        const queriedGraphics = await this.queryFeatures(
            hitPoint,
            type,
            utilityNetwork
        );

        for (const queriedGraphic of queriedGraphics) {
            const percAlong = await getPercentageAlong(
                queriedGraphic.geometry,
                hitPoint
            );
            let terminalIds: number[] | undefined = undefined;
            if (queriedGraphic.geometry) {
                if (queriedGraphic.geometry.type === "point") {
                    terminalIds = getTerminalIds(
                        queriedGraphic,
                        utilityNetwork
                    );
                    hitPoint = queriedGraphic.geometry as Point;
                } else if (queriedGraphic.geometry.type === "polyline") {
                    const snappedPoint = await getPolylineIntersection(
                        queriedGraphic.geometry as Polyline,
                        hitPoint
                    );
                    if (snappedPoint) {
                        hitPoint = snappedPoint;
                    }
                }
            }

            const networkGraphic = createNetworkGraphic(
                hitPoint,
                queriedGraphic.geometry,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                queriedGraphic.attributes,
                queriedGraphic.layer as FeatureLayer | SubtypeGroupLayer,
                percAlong,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                locationType as any,
                utilityNetwork,
                isFilterBarrier,
                terminalIds
            );
            if (networkGraphic) {
                networkGraphics.push(networkGraphic);
            }
        }

        return {
            networkGraphics: networkGraphics,
        };
    }

    private async queryFeatures(
        hitPoint: Point,
        type: typeof MapProvider,
        utilityNetwork: UtilityNetwork
    ): Promise<Graphic[]> {
        const queriedGraphics: Graphic[] = [];
        const mapProvider = type.create();
        await mapProvider.load();

        const webMap = mapProvider.map as WebMap;
        const view = mapProvider.view as MapView;
        for (let i = 0; i < webMap.allLayers.length; i++) {
            const l = webMap.allLayers.getItemAt(i);
            if (l != undefined) {
                if (!l.initialized) {
                    await l.load();
                }
            }
        }
        await view.when();
        const screenPoint = view.toScreen(hitPoint);
        const hitResult = await view.hitTest(screenPoint);
        const hitGraphics = hitResult.results
            .map((g) => {
                if (
                    g.type === "graphic" &&
                    g.layer &&
                    (g.layer.type === "feature" ||
                        g.layer.type === "subtype-group")
                ) {
                    return g;
                }
            })
            .filter((x): x is __esri.GraphicHit => !!x);

        for (let i = 0; i < hitGraphics.length; i++) {
            const x = hitGraphics[i];
            let qLyr: SubtypeGroupLayer | FeatureLayer;
            if (x.layer.type === "subtype-group") {
                qLyr = x.layer as SubtypeGroupLayer;
            } else {
                qLyr = x.layer as FeatureLayer;
            }

            const result = await qLyr.queryFeatures({
                objectIds: [x.graphic.getObjectId()],
                returnGeometry: true,
                outFields: ["*"],
                outSpatialReference: { wkid: hitPoint.spatialReference.wkid },
            });

            const validFeature = this.getValidFeature(
                result.features,
                qLyr,
                utilityNetwork
            );
            if (validFeature) {
                queriedGraphics.push(validFeature);
            }
        }
        return queriedGraphics;
    }

    private getValidFeature(
        features: Graphic[],
        layer: FeatureLayer | SubtypeGroupLayer,
        utilityNetwork: UtilityNetwork
    ): Graphic | undefined {
        const assetTypeField = getUtilityNetworkAttributeFieldByType(
            "esriUNAUTAssetType",
            layer.layerId,
            utilityNetwork
        );
        const assetGroupField = getUtilityNetworkAttributeFieldByType(
            "esriUNAUTAssetGroup",
            layer.layerId,
            utilityNetwork
        );
        const globalIdField = layer.fields.find((x) => x.type === "global-id");

        if (
            features.length > 0 &&
            globalIdField &&
            assetGroupField &&
            assetTypeField
        ) {
            features[0].layer = layer;

            return features[0];
        }
        return undefined;
    }
}
