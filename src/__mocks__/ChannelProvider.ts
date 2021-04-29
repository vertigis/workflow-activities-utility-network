import type { ChannelProvider } from "@geocortex/workflow/runtime/activities/core/ChannelProvider";
import { Activator } from "@geocortex/workflow/runtime/Activator";

export class BaseMockChannelProvider {
    static register(activator: Activator) { }
    static type: "mock";
}

export class DefaultMockChannelProvider extends BaseMockChannelProvider {
    static create(channel?: ChannelProvider, name?: string): ChannelProvider {
        throw new Error(`Request not mocked`);
    }
    constructor(type: typeof ChannelProvider, name?: string) {
        super();
        return DefaultMockChannelProvider.create();
    }
}

export const DefaultMockChannelProviderType = DefaultMockChannelProvider as typeof ChannelProvider;

export function mockChannel(getResponse: (channel: Partial<ChannelProvider>) => Record<string, any>): ChannelProvider {
    const channel: Partial<ChannelProvider> = {
        cancel: () => { },
        getResponseData: (payload: {}) => {
            return payload;
        },
        request: {
            headers: {}
        }
    };
    channel.send = () => {
        channel.response = {
            headers: {},
            payload: getResponse(channel),
        };
    };
    channel.new = () => channel as ChannelProvider;
    return channel as ChannelProvider;
}