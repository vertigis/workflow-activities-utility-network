import type { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { Activator } from "@geocortex/workflow/runtime/Activator";

export class BaseMockChannelProvider {
    static register(activator: Activator): void {
        // No op
    }
    static type: "mock";
}
let mockData;

export function setMockData(data: Record<string, any>): void {
    mockData = data;
}
export function getMockData(): any {
    return mockData;
}
export class DefaultMockChannelProvider extends BaseMockChannelProvider {
    static create(channel?: ChannelProvider, name?: string): ChannelProvider {
        return mockChannel(() => mockData);
    }
    constructor(type: typeof ChannelProvider, name?: string) {
        super();
        return DefaultMockChannelProvider.create();
    }
}

export const DefaultMockChannelProviderType =
    DefaultMockChannelProvider as typeof ChannelProvider;

export function mockChannel(
    getResponse: (channel: Partial<ChannelProvider>) => Record<string, any>
): ChannelProvider {
    const channel: Partial<ChannelProvider> = {
        cancel: () => {
            // No op
        },
        getResponseData: (payload: Record<string, unknown>) => {
            return mockData;
        },
        request: {
            headers: {},
        },
    };
    channel.send = () => {
        channel.response = {
            headers: {},
            payload: getResponse,
        };
    };
    return channel as ChannelProvider;
}
