export interface IUtilityNetworkDefinition {
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
}
