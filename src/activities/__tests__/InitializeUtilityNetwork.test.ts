import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { UtilityNetwork } from "../../model/UtilityNetwork";
import { mockActivityContext } from "../../__mocks__/ActivityContext";
import {
    BaseMockChannelProvider,
    DefaultMockChannelProviderType,
    mockChannel,
} from "../../__mocks__/ChannelProvider";
import {
    InitializeUtilityNetwork,
    InitializeUtilityNetworkInputs,
} from "../InitializeUtilityNetwork";

const dummyFeatureServiceUrl =
    "https://server/arcgis/rest/services/myService/FeatureServer";
const dummyUtilityNetworkServiceUrl =
    "https://server/arcgis/rest/services/myService/UtilityNetworkServer";

describe("InitializeUtilityNetwork", () => {
    describe("execute", () => {
        it("requires serviceUrl input", async () => {
            const activity = new InitializeUtilityNetwork();
            await expect(() =>
                activity.execute(
                    { serviceUrl: undefined! },
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("serviceUrl is required");
            await expect(() =>
                activity.execute(
                    { serviceUrl: null! },
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("serviceUrl is required");
            await expect(() =>
                activity.execute(
                    { serviceUrl: "" },
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("serviceUrl is required");
        });

        it("initializes the service", async () => {
            const mockServiceResponse = {
                controllerDatasetLayers: {
                    utilityNetworkLayerId: 0,
                },
            };
            const mockLayerResponse = {
                systemLayers: {
                    subnetworksTableId: 0,
                },
            };
            const mockQueryDataElementsResponse = {
                layerDataElements: [
                    {
                        dataElement: {
                            edgeSources: [],
                            junctionSources: [],
                        },
                    },
                ],
            };

            class MockChannelProvider extends BaseMockChannelProvider {
                static create(
                    channel?: ChannelProvider,
                    name?: string
                ): ChannelProvider {
                    return mockChannel((c) => {
                        const url = c.request?.url;
                        if (!url) {
                            throw new Error(
                                `Invalid request. URL not specified`
                            );
                        }
                        if (url.endsWith("/FeatureServer")) {
                            return mockServiceResponse;
                        } else if (url.endsWith("/FeatureServer/0")) {
                            return mockLayerResponse;
                        } else if (
                            url.endsWith("/FeatureServer/queryDataElements")
                        ) {
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
                serviceUrl: dummyFeatureServiceUrl,
            };

            const result = await activity.execute(
                inputs,
                mockActivityContext(),
                MockChannelProvider as typeof ChannelProvider
            );
            const mockUtiltyNetwork = new UtilityNetwork(
                mockQueryDataElementsResponse.layerDataElements[0].dataElement,
                inputs.serviceUrl,
                mockLayerResponse.systemLayers,
                0,
                dummyUtilityNetworkServiceUrl
            );
            expect(result).toBeDefined();
            expect(result.result).toStrictEqual(mockUtiltyNetwork);
        });

        it("fails if the service does not provide a utilityNetworkLayerId", async () => {
            const mockServiceResponse = {
                foo: "bar",
            };
            class MockChannelProvider extends BaseMockChannelProvider {
                static create(
                    channel?: ChannelProvider,
                    name?: string
                ): ChannelProvider {
                    return mockChannel((c) => mockServiceResponse);
                }
                constructor(type: typeof ChannelProvider, name?: string) {
                    super();
                    return MockChannelProvider.create();
                }
            }

            const activity = new InitializeUtilityNetwork();
            const inputs: InitializeUtilityNetworkInputs = {
                serviceUrl: dummyFeatureServiceUrl,
            };
            await expect(() =>
                activity.execute(
                    inputs,
                    mockActivityContext(),
                    MockChannelProvider as typeof ChannelProvider
                )
            ).rejects.toThrow(
                `Utility Network not found in feature service ${inputs.serviceUrl}`
            );
        });

        it("fails if the service does not provide a dataElement", async () => {
            const mockServiceResponse = {
                controllerDatasetLayers: {
                    utilityNetworkLayerId: 0,
                },
            };
            const mockQueryDataElementsResponse = {
                layerDataElements: [
                    {
                        foo: "bar",
                    },
                ],
            };
            class MockChannelProvider extends BaseMockChannelProvider {
                static create(
                    channel?: ChannelProvider,
                    name?: string
                ): ChannelProvider {
                    return mockChannel((c) => {
                        const url = c.request?.url;
                        if (!url) {
                            throw new Error(
                                `Invalid request. URL not specified`
                            );
                        }
                        if (url.endsWith("/FeatureServer")) {
                            return mockServiceResponse;
                        } else if (
                            url.endsWith("/FeatureServer/queryDataElements")
                        ) {
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
                serviceUrl: dummyFeatureServiceUrl,
            };
            await expect(() =>
                activity.execute(
                    inputs,
                    mockActivityContext(),
                    MockChannelProvider as typeof ChannelProvider
                )
            ).rejects.toThrow(
                `Utility Network definition dataElement not found in feature service ${inputs.serviceUrl}`
            );
        });
        it("fails if the service does not provide systemLayers", async () => {
            const mockServiceResponse = {
                controllerDatasetLayers: {
                    utilityNetworkLayerId: 0,
                },
            };
            const mockLayerResponse = {
                foo: "bar",
            };
            const mockQueryDataElementsResponse = {
                layerDataElements: [
                    {
                        dataElement: {
                            edgeSources: [],
                            junctionSources: [],
                        },
                    },
                ],
            };
            class MockChannelProvider extends BaseMockChannelProvider {
                static create(
                    channel?: ChannelProvider,
                    name?: string
                ): ChannelProvider {
                    return mockChannel((c) => {
                        const url = c.request?.url;
                        if (!url) {
                            throw new Error(
                                `Invalid request. URL not specified`
                            );
                        }
                        if (url.endsWith("/FeatureServer")) {
                            return mockServiceResponse;
                        } else if (url.endsWith("/FeatureServer/0")) {
                            return mockLayerResponse;
                        } else if (
                            url.endsWith("/FeatureServer/queryDataElements")
                        ) {
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
                serviceUrl: dummyFeatureServiceUrl,
            };

            await expect(() =>
                activity.execute(
                    inputs,
                    mockActivityContext(),
                    MockChannelProvider as typeof ChannelProvider
                )
            ).rejects.toThrow(
                `Utility Network systemLayers not found in feature service ${inputs.serviceUrl}`
            );
        });
    });
});
