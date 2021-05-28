import * as geometryEngine from "esri/geometry/geometryEngine";
import { IUtilityNetwork } from "../interface/IUtilityNetwork";
import Point from "esri/geometry/Point";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
export class UtilityNetwork implements IUtilityNetwork {
    definition: any;
    featureServiceUrl: string;
    systemLayers: any;
    utilityNetworkLayerId: number;
    utilityNetworkUrl: string;

    constructor(
        definition: any,
        featureServiceUrl: string,
        systemLayers: any,
        utilityNetworkLayerId: number,
        utilityNetworkUrl: string
    ) {
        this.definition = definition;
        this.featureServiceUrl = featureServiceUrl;
        this.systemLayers = systemLayers;
        this.utilityNetworkLayerId = utilityNetworkLayerId;
        this.utilityNetworkUrl = utilityNetworkUrl;
    }
    public getAssetsByUsageType(
        utilityNetworkUsageType: string,
        domainNetworkName: string
    ): string[] {
        const layerIds: string[] = [];
        for (const domainNetwork of this.definition.domainNetworks) {
            if (
                domainNetwork.domainNetworkName.toLowerCase() ===
                domainNetworkName.toLowerCase()
            ) {
                for (const junctionSource of domainNetwork.junctionSources) {
                    if (
                        junctionSource.utilityNetworkFeatureClassUsageType ===
                        utilityNetworkUsageType
                    ) {
                        layerIds.push(junctionSource.layerId);
                    }
                }

                for (const edgeSource of domainNetwork.edgeSources) {
                    if (
                        edgeSource.utilityNetworkFeatureClassUsageType ===
                        utilityNetworkUsageType
                    ) {
                        layerIds.push(edgeSource.layerId);
                    }
                }
            }
        }
        return layerIds;
    }

    public createTraceLocation(
        locateFeature: Graphic,
        traceLocationType: "startingPoint" | "barrier",
        tracePoint: Point,
        layerId: string,
        assetGroupField: string,
        assetTypeField: string,
        globalIdField: string
    ): any {
        const assetType: any = this.getAssetType(
            layerId,
            locateFeature.attributes[assetGroupField],
            locateFeature.attributes[assetTypeField]
        );
        const traceLocation: any = {};
        if (locateFeature.geometry.type === "polyline") {
            traceLocation.traceLocationType = traceLocationType;
            traceLocation.globalId = locateFeature.attributes[globalIdField];
            traceLocation.layerId = layerId;
            traceLocation.assetGroupCode =
                locateFeature.attributes[assetGroupField];
            traceLocation.assetTypeCode =
                locateFeature.attributes[assetTypeField];
            traceLocation.isTerminalConfigurationSupported =
                assetType.isTerminalConfigurationSupported;
            if (this.isEdge(traceLocation.layerId)) {
                traceLocation.percentAlong = this.getPercentAlong(
                    locateFeature.geometry,
                    tracePoint
                );
            }
        } else {
            const terminalConfiguration = this.getTerminalConfiguration(
                assetType
            );
            if (terminalConfiguration) {
                for (const tc of terminalConfiguration.terminals) {
                    traceLocation.traceLocationType = traceLocationType;
                    traceLocation.globalId =
                        locateFeature.attributes[globalIdField];
                    traceLocation.layerId = layerId;
                    traceLocation.assetGroupCode =
                        locateFeature.attributes[assetGroupField];
                    traceLocation.assetTypeCode =
                        locateFeature.attributes[assetTypeField];
                    traceLocation.isTerminalConfigurationSupported =
                        assetType.isTerminalConfigurationSupported;
                    traceLocation.terminalId = tc.terminalId;
                }
            }
        }
        return traceLocation;
    }

    private isEdge(layerId: any): boolean {
        for (let i = 0; i < this.definition.domainNetworks.length; i++) {
            const domainNetwork = this.definition.domainNetworks[i];

            for (let j = 0; j < domainNetwork.edgeSources.length; j++)
                if (domainNetwork.edgeSources[j].layerId === layerId)
                    return true;
        }

        return false;
    }

    private getAssetType(
        layerId: string,
        assetGroupCode: string,
        assetTypeCode: string
    ): any {
        let assetType: any = undefined;
        for (const domainNetwork of this.definition.domainNetworks) {
            for (const junctionSource of domainNetwork.junctionSources) {
                if (junctionSource.layerId == layerId) {
                    const assetGroup = junctionSource.assetGroups.find(
                        (ag) => ag.assetGroupCode === assetGroupCode
                    );
                    if (assetGroup instanceof Object) {
                        const at = assetGroup.assetTypes.find(
                            (at) => at.assetTypeCode === assetTypeCode
                        );

                        assetType = at;
                        assetType.assetGroupName = assetGroup.assetGroupName;
                        assetType.utilityNetworkFeatureClassUsageType =
                            junctionSource.utilityNetworkFeatureClassUsageType;
                        return assetType;
                    }
                }
            }

            for (const edgeSource of domainNetwork.edgeSources) {
                if (edgeSource.layerId == layerId) {
                    const assetGroup = edgeSource.assetGroups.find(
                        (ag) => ag.assetGroupCode === assetGroupCode
                    );
                    if (assetGroup instanceof Object) {
                        const at = assetGroup.assetTypes.find(
                            (at) => at.assetTypeCode === assetTypeCode
                        );

                        assetType = at;
                        assetType.assetGroupName = assetGroup.assetGroupName;
                        assetType.utilityNetworkFeatureClassUsageType =
                            edgeSource.utilityNetworkFeatureClassUsageType;
                        return assetType;
                    }
                }
            }
        }
        return assetType;
    }

    private getPercentAlong(geometry: any, pointNearLine: Point) {
        const sourceLine = this.createPolyline(
            geometry.paths,
            geometry.spatialReference.wkid
        );
        let pt = geometry.getPoint(0, 0);

        if (pointNearLine) {
            pt = new Point({ x: pointNearLine.x, y: pointNearLine.y, z: 0 });
        }
        const pntOnLine: any = geometryEngine.nearestCoordinate(geometry, pt);
        const padXMin = (pntOnLine.coordinate.x as number) - 50;
        const padXMax = (pntOnLine.coordinate.x as number) + 50;
        const padYMin = (pntOnLine.coordinate.y as number) - 50;
        const padYMax = (pntOnLine.coordinate.y as number) + 50;
        const newCoodsForLine: any[] = [];
        newCoodsForLine[0] = [];
        newCoodsForLine[0].push([padXMin, padYMin]);
        newCoodsForLine[0].push([padXMax, padYMax]);
        const flagLine = this.createPolyline(
            newCoodsForLine,
            geometry.spatialReference.wkid
        );
        const newGeom = geometryEngine.cut(sourceLine, flagLine);
        const sourceLength = geometryEngine.planarLength(sourceLine, "feet");
        const piece1Length = geometryEngine.planarLength(newGeom[0], "feet");
        const percentage = piece1Length / sourceLength;
        return percentage;
    }

    private createPolyline(paths: any, inSR: number) {
        const newLine = new Polyline({
            hasZ: false,
            hasM: true,
            paths: paths,
            spatialReference: { wkid: inSR },
        });
        return newLine;
    }

    private getTerminalConfiguration(assetType: any) {
        return this.definition.terminalConfigurations.find(
            (tc) =>
                tc.terminalConfigurationId === assetType.terminalConfigurationId
        );
    }
}
