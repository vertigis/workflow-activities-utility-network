import { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { mockActivityContext } from "../../__mocks__/ActivityContext";
import { BaseMockChannelProvider, DefaultMockChannelProviderType, mockChannel } from "../../__mocks__/ChannelProvider";
import { RunUtilityNetworkTrace, RunUtilityNetworkTraceInputs } from "../RunUtilityNetworkTrace";

describe("RunUtilityNetworkTrace", () => {
    describe("execute", () => {
        it("requires serviceUrl input", async () => {
            const activity = new RunUtilityNetworkTrace();
            const inputs: RunUtilityNetworkTraceInputs = {
                serviceUrl: "",
                traceType: "connected",
                traceLocations: [],
            };

            await expect(() => activity.execute(inputs, mockActivityContext(), DefaultMockChannelProviderType)).rejects.toThrow("serviceUrl is required");
        });
        it("requires traceType input", async () => {
            const activity = new RunUtilityNetworkTrace();
            const inputs: RunUtilityNetworkTraceInputs = {
                serviceUrl: "https://server/arcgis/rest/services/myService/UtilityNetworkServer",
                traceType: "",
                traceLocations: [],
            };

            await expect(() => activity.execute(inputs, mockActivityContext(), DefaultMockChannelProviderType)).rejects.toThrow("traceType is required");
        });
        it("performs the trace request", async () => {
            const response = { traceResults: [], success: true };
            class MockChannelProvider extends BaseMockChannelProvider {
                static create(channel?: ChannelProvider, name?: string): ChannelProvider {
                    return mockChannel(() => response);
                }
                constructor(type: typeof ChannelProvider, name?: string) {
                    super();
                    return MockChannelProvider.create();
                }
            }

            const activity = new RunUtilityNetworkTrace();
            const inputs: RunUtilityNetworkTraceInputs = {
                serviceUrl: "https://server/arcgis/rest/services/myService/UtilityNetworkServer",
                traceType: "connected",
                traceLocations: [],
            };

            const result = await activity.execute(inputs, mockActivityContext(), MockChannelProvider as typeof ChannelProvider);
            expect(result).toStrictEqual({
                traceResults: response.traceResults
            });
        });
    });
});