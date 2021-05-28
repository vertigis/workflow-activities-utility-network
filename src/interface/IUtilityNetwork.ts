import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";

export interface IUtilityNetwork {
    getAssetsByUsageType(
        utilityNetworkUsageType: string,
        domainNetworkName: string
    ): string[];

    createTraceLocation(
        locateFeature: Graphic,
        traceLocationType: "startingPoint" | "barrier",
        pointNearLine: Point,
        layerId: string,
        assetGroupField: string,
        assetTypeField: string,
        globalIdField: string
    ): any;

    definition: {
        domainNetworks: {
            edgeSources: {
                assetGroups: {
                    assetGroupCode: any;
                    assetGroupName: string;
                    assetTypes: {
                        assetTypeCode: any;
                        assetTypeName: string;
                        isTerminalConfigurationSupported?: boolean;
                        terminalConfigurationId?: number;
                    }[];
                }[];
                layerId: number;
                shapeType: any;
                sourceId: number;
                utilityNetworkFeatureClassUsageType: string;
            }[];
            junctionSources: {
                assetGroups: {
                    assetGroupCode: any;
                    assetGroupName: string;
                    assetTypes: {
                        assetTypeCode: any;
                        assetTypeName: string;
                        isTerminalConfigurationSupported?: boolean;
                        terminalConfigurationId?: number;
                    }[];
                }[];
                layerId: number;
                shapeType: any;
                sourceId: number;
                utilityNetworkFeatureClassUsageType: string;
            }[];
            tiers: [];
        }[];
        terminalConfigurations: [];
    };
    featureServiceUrl: string;
    systemLayers: {
        dirtyAreasLayerId: number;
        lineErrorsLayerId: number;
        pointErrorsLayerId: number;
        polygonErrorsLayerId: number;
        associationsTableId: number;
        subnetworksTableId: number;
        rulesTableId: number;
        diagramEdgeLayerId: number;
        diagramJunctionLayerId: number;
        diagramContainerLayerId: number;
        temporaryDiagramEdgeLayerId: number;
        temporaryDiagramJunctionLayerId: number;
        temporaryDiagramContainerLayerId: number;
    };
    utilityNetworkLayerId: number;
    utilityNetworkUrl: string;
}
