import { IUtilityNetworkDefinition } from "../../interface/IUtilityNetworkDefinition";
import { UtilityNetwork } from "../../model/UtilityNetwork";

const dummyFeatureServiceUrl =
    "https://server/arcgis/rest/services/myService/FeatureServer";
const dummyUtilityNetworkServiceUrl =
    "https://server/arcgis/rest/services/myService/UtilityNetworkServer";
describe("InitializeUtilityNetwork", () => {
    const mockSystemLayers = {
        subnetworksTableId: 0,
    };

    const mockDefinition = {
        edgeSources: [],
        junctionSources: [],
        domainNetworks: [
            {
                releaseNumber: 1,
                isStructureNetwork: false,
                domainNetworkId: 2,
                domainNetworkName: "Communications",
                domainNetworkAliasName: "Communications",
                subnetworkLayerId: 620,
                subnetworkLabelFieldName: "SUBNETWORKNAME",
                tierDefinition: "esriTDHierarchical",
                subnetworkControllerType: "Source",
                tierGroups: [
                    {
                        name: "Strand",
                    },
                ],
                tiers: [],
                junctionSources: [
                    {
                        sourceId: 9,
                        layerId: 913,
                        usesGeometry: true,
                        shapeType: "esriGeometryPoint",
                        utilityNetworkFeatureClassUsageType: "esriUNFCUTDevice",
                        assetTypeFieldName: "ASSETTYPE",
                        supportedProperties: [
                            "esriNSSPSupportsContainment",
                            "esriNSSPSupportsCategories",
                            "esriNSSPSupportsTerminals",
                            "esriNSSPSupportsNetworkAttributes",
                        ],
                        assetGroups: [
                            {
                                creationTime: 1620082611000,
                                assetGroupCode: 45,
                                assetGroupName: "Drop Cable Components",
                                assetTypes: [
                                    {
                                        creationTime: 1620082662000,
                                        assetTypeCode: 6,
                                        assetTypeName: "Network Interface Unit",
                                        containmentViewScale: 1,
                                        associationDeleteType: "esriADTCascade",
                                        associationRoleType: "esriARTContainer",
                                        isTerminalConfigurationSupported: true,
                                        terminalConfigurationId: 0,
                                        isLinearConnectivityPolicySupported: false,
                                        connectivityPolicy: "esriNECPEndVertex",
                                        categories: [],
                                        splitContent: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
                edgeSources: [
                    {
                        sourceId: 10,
                        layerId: 916,
                        usesGeometry: true,
                        shapeType: "esriGeometryPolyline",
                        utilityNetworkFeatureClassUsageType: "esriUNFCUTLine",
                        assetTypeFieldName: "ASSETTYPE",
                        supportedProperties: [
                            "esriNSSPSupportsContainment",
                            "esriNSSPSupportsCategories",
                            "esriNSSPSupportsNetworkAttributes",
                        ],
                        assetGroups: [
                            {
                                creationTime: 1620083959000,
                                assetGroupCode: 45,
                                assetGroupName: "Drop Cable",
                                assetTypes: [
                                    {
                                        creationTime: 1620084015000,
                                        assetTypeCode: 3,
                                        assetTypeName: "Fiber",
                                        containmentViewScale: 150,
                                        associationDeleteType: "esriADTCascade",
                                        associationRoleType: "esriARTContainer",
                                        isTerminalConfigurationSupported: false,
                                        terminalConfigurationId: 0,
                                        isLinearConnectivityPolicySupported: true,
                                        connectivityPolicy: "esriNECPAnyVertex",
                                        categories: ["C:Cable"],
                                        splitContent: true,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        terminalConfigurations: [
            {
                creationTime: 1620078755000,
                terminalConfigurationId: 0,
                terminalConfigurationName: "Single terminal",
                traversabilityModel: "esriUNTMBidirectional",
                terminals: [
                    {
                        terminalId: 1,
                        terminalName: "Single Terminal",
                        isUpstreamTerminal: false,
                    },
                ],
                validConfigurationPaths: [],
                defaultConfiguration: "All",
            },
            {
                creationTime: 1620086017000,
                terminalConfigurationId: 2,
                terminalConfigurationName: "Communications Port",
                traversabilityModel: "esriUNTMBidirectional",
                terminals: [
                    {
                        terminalId: 2,
                        terminalName: "C:Back",
                        isUpstreamTerminal: false,
                    },
                    {
                        terminalId: 3,
                        terminalName: "C:Front",
                        isUpstreamTerminal: false,
                    },
                ],
                validConfigurationPaths: [],
                defaultConfiguration: "All",
            },
            {
                creationTime: 1620086017000,
                terminalConfigurationId: 3,
                terminalConfigurationName: "Communications Equipment",
                traversabilityModel: "esriUNTMDirectional",
                terminals: [
                    {
                        terminalId: 4,
                        terminalName: "C:Port In",
                        isUpstreamTerminal: true,
                    },
                    {
                        terminalId: 5,
                        terminalName: "C:Port Out",
                        isUpstreamTerminal: false,
                    },
                ],
                validConfigurationPaths: [],
                defaultConfiguration: "All",
            },
        ],
    };
    const mockUtiltyNetwork = new UtilityNetwork(
        mockDefinition as any,
        dummyFeatureServiceUrl,
        mockSystemLayers,
        0,
        dummyUtilityNetworkServiceUrl
    );
    const mockAssetTypeArray = [913];
    const mockPointTraceLocation = {
        assetGroupCode: 45,
        assetTypeCode: 6,
        globalId: "{MOCKED_ID}",
        isTerminalConfigurationSupported: true,
        layerId: 913,
        terminalId: 1,
        traceLocationType: "startingPoint",
    };
    const mockPolylineTraceLocation = {
        assetGroupCode: 45,
        assetTypeCode: 3,
        globalId: "{MOCKED_ID}",
        isTerminalConfigurationSupported: false,
        layerId: 916,
        traceLocationType: "startingPoint",
        percentAlong: 1,
    };
    it("returns asset type", () => {
        const utilityNetworkUsageType = "esriUNFCUTDevice";
        const domainNetworkName = "Communications";
        const result = mockUtiltyNetwork.getAssetsByUsageType(
            utilityNetworkUsageType,
            domainNetworkName
        );
        expect(result).toBeDefined();
        expect(result).toStrictEqual(mockAssetTypeArray);
    });
    it("returns a trace location from a point feature", () => {
        const mockLocationPoinyGraphic = {
            attributes: {
                ASSETGROUP: 45,
                ASSETTYPE: 6,
                GLOBALID: "{MOCKED_ID}",
            },
            geometry: {
                type: "point",
                x: 0,
                y: 0,
                m: 0,
                z: 0,
                spatialReference: { wkid: 102100 },
            },
        };
        const mockPoint = {
            type: "point",
            x: 0,
            y: 0,
            m: 0,
            z: 0,
            spatialReference: { wkid: 102100 },
        };
        const utilityNetworkUsageType = "esriUNFCUTDevice";
        const domainNetworkName = "Communications";
        const result = mockUtiltyNetwork.createTraceLocation(
            mockLocationPoinyGraphic as any,
            "startingPoint",
            mockPoint as any,
            913,
            "ASSETGROUP",
            "ASSETTYPE",
            "GLOBALID"
        );

        expect(result).toBeDefined();
        expect(result).toStrictEqual(mockPointTraceLocation);
    });
    it("returns a trace location from a polyline feature", () => {
        const mockLocationPolylineGraphic = {
            attributes: {
                ASSETGROUP: 45,
                ASSETTYPE: 3,
                GLOBALID: "{MOCKED_ID}",
            },
            geometry: {
                type: "polyline",
                paths: [
                    [0, 0],
                    [1, 1],
                ],
                spatialReference: { wkid: 102100 },
            },
        };
        const mockPoint = {
            type: "point",
            x: 0,
            y: 0,
            m: 0,
            z: 0,
            spatialReference: { wkid: 102100 },
        };

        const createTraceLocation = jest.fn(
            (
                locateFeature: any,
                traceLocationType: "startingPoint" | "barrier",
                tracePoint: any,
                layerId: number,
                assetGroupField: string,
                assetTypeField: string,
                globalIdField: string
            ) => {
                return mockPolylineTraceLocation;
            }
        );

        const result = createTraceLocation(
            mockLocationPolylineGraphic as any,
            "startingPoint",
            mockPoint as any,
            916,
            "ASSETGROUP",
            "ASSETTYPE",
            "GLOBALID"
        );

        expect(result).toBeDefined();
        expect(result).toStrictEqual(mockPolylineTraceLocation);
    });
});
