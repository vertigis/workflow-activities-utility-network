import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { mockActivityContext } from "../../__mocks__/ActivityContext";
import { BaseMockChannelProvider, DefaultMockChannelProviderType, mockChannel } from "../../__mocks__/ChannelProvider";
import { InitializeUtilityNetwork, InitializeUtilityNetworkInputs } from "../InitializeUtilityNetwork";

describe("InitializeUtilityNetwork", () => {
    describe("execute", () => {
        it("requires serviceUrl input", async () => {
            const activity = new InitializeUtilityNetwork();
            const inputs: InitializeUtilityNetworkInputs = {
                serviceUrl: "",
            };

            await expect(() => activity.execute(inputs, mockActivityContext(), DefaultMockChannelProviderType)).rejects.toThrow("serviceUrl is required");
        });

        it("initializes the service", async () => {
            const mockServiceResponse = {
                controllerDatasetLayers: {
                    utilityNetworkLayerId: 0,
                }
            };
            const mockLayerResponse = {
                systemLayers: {
                    subnetworksTableId: 0,
                }
            };
            const mockQueryDataElementsResponse = {
                layerDataElements: [
                    {
                        dataElement: {
                            edgeSources: [],
                            junctionSources: [],
                        }
                    }
                ]
            };
            class MockChannelProvider extends BaseMockChannelProvider {
                static create(channel?: ChannelProvider, name?: string): ChannelProvider {
                    return mockChannel((c) => {
                        const url = c.request?.url;
                        if (!url) {
                            throw new Error(`Invalid request. URL not specified`);
                        }
                        if (url.endsWith("/FeatureServer")) {
                            return mockServiceResponse;
                        } else if (url.endsWith("/FeatureServer/0")) {
                            return mockLayerResponse;
                        } else if (url.endsWith("/FeatureServer/queryDataElements")) {
                            return mockQueryDataElementsResponse;
                        }
                        throw new Error(`Request not mocked ${url}`);
                    });
                }
                constructor(type: typeof ChannelProvider, name?: string) {
                    super();
                    return MockChannelProvider.create();
                }
            }

            const activity = new InitializeUtilityNetwork();
            const inputs: InitializeUtilityNetworkInputs = {
                serviceUrl: "https://server/arcgis/rest/services/myService/FeatureServer",
            };

            const result = await activity.execute(inputs, mockActivityContext(), MockChannelProvider as typeof ChannelProvider);
            expect(result).toBeDefined();
            expect(result.result).toStrictEqual({
                dataElement: mockQueryDataElementsResponse.layerDataElements[0].dataElement,
                featureServiceUrl: inputs.serviceUrl,
                systemLayers: mockLayerResponse.systemLayers,
                utilityNetworkLayerId: 0,
                utilityNetworkUrl: "https://server/arcgis/rest/services/myService/UtilityNetworkServer",
            });
        });
    });
});