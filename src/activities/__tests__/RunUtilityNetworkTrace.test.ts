import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { mockActivityContext } from "../../__mocks__/ActivityContext";
import {
    BaseMockChannelProvider,
    DefaultMockChannelProviderType,
    mockChannel,
} from "../../__mocks__/ChannelProvider";
import {
    RunUtilityNetworkTrace,
    RunUtilityNetworkTraceInputs,
} from "../RunUtilityNetworkTrace";

const dummyServiceUrl =
    "https://server/arcgis/rest/services/myService/UtilityNetworkServer";

describe("RunUtilityNetworkTrace", () => {
    describe("execute", () => {
        it("requires serviceUrl input", async () => {
            const activity = new RunUtilityNetworkTrace();

            await expect(() =>
                activity.execute(
                    {
                        serviceUrl: undefined!,
                        traceType: "connected",
                        traceLocations: [],
                    },
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("serviceUrl is required");
            await expect(() =>
                activity.execute(
                    {
                        serviceUrl: null!,
                        traceType: "connected",
                        traceLocations: [],
                    },
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("serviceUrl is required");
            await expect(() =>
                activity.execute(
                    {
                        serviceUrl: "",
                        traceType: "connected",
                        traceLocations: [],
                    },
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("serviceUrl is required");
        });
        it("requires traceType input", async () => {
            const activity = new RunUtilityNetworkTrace();
            const inputs: RunUtilityNetworkTraceInputs = {
                serviceUrl: dummyServiceUrl,
                traceType: "",
                traceLocations: [],
            };

            await expect(() =>
                activity.execute(
                    inputs,
                    mockActivityContext(),
                    DefaultMockChannelProviderType
                )
            ).rejects.toThrow("traceType is required");
        });
        it("performs the trace request", async () => {
            const response = { traceResults: [], success: true };
            class MockChannelProvider extends BaseMockChannelProvider {
                static create(
                    channel?: ChannelProvider,
                    name?: string
                ): ChannelProvider {
                    return mockChannel(() => response);
                }
                constructor(type: typeof ChannelProvider, name?: string) {
                    super();
                    return MockChannelProvider.create();
                }
            }

            const activity = new RunUtilityNetworkTrace();
            const inputs: RunUtilityNetworkTraceInputs = {
                serviceUrl: dummyServiceUrl,
                traceType: "connected",
                traceLocations: [],
            };

            const result = await activity.execute(
                inputs,
                mockActivityContext(),
                MockChannelProvider as typeof ChannelProvider
            );
            expect(result).toStrictEqual({
                traceResults: response.traceResults,
            });
        });
    });
});
