import { getLayerInfo, getServiceInfo, queryDataElements } from "../request";
import { mockChannel } from "../__mocks__/ChannelProvider";

const dummyServiceUrl = "https://server/arcgis/rest/services/myService/FeatureServer";
const dummyServiceResponse = { foo: "bar" };

describe("request", () => {
    describe("getServiceInfo", () => {
        it("requires url", async () => {
            const channel = mockChannel(() => dummyServiceResponse);
            await expect(() => getServiceInfo(channel, undefined!, Promise.resolve())).rejects.toThrow("url is required");
            await expect(() => getServiceInfo(channel, null!, Promise.resolve())).rejects.toThrow("url is required");
            await expect(() => getServiceInfo(channel, "", Promise.resolve())).rejects.toThrow("url is required");
        });
        it("fetches the service info", async () => {
            const channel = mockChannel(() => dummyServiceResponse);
            const result = await getServiceInfo(channel, dummyServiceUrl, Promise.resolve());
            expect(result).toStrictEqual(dummyServiceResponse);
        });
    });
    describe("getLayerInfo", () => {
        it("requires url", async () => {
            const channel = mockChannel(() => dummyServiceResponse);
            await expect(() => getLayerInfo(channel, undefined!, 2, Promise.resolve())).rejects.toThrow("url is required");
            await expect(() => getLayerInfo(channel, null!, 2, Promise.resolve())).rejects.toThrow("url is required");
            await expect(() => getLayerInfo(channel, "", 2, Promise.resolve())).rejects.toThrow("url is required");
        });
        it("fetches the layer info", async () => {
            const channel = mockChannel(() => dummyServiceResponse);
            const result = await getLayerInfo(channel, dummyServiceUrl, 2, Promise.resolve());
            expect(result).toStrictEqual(dummyServiceResponse);
        });
    });
    describe("queryDataElements", () => {
        it("requires url", async () => {
            const channel = mockChannel(() => dummyServiceResponse);
            await expect(() => queryDataElements(channel, undefined!, 2, Promise.resolve())).rejects.toThrow("url is required");
            await expect(() => queryDataElements(channel, null!, 2, Promise.resolve())).rejects.toThrow("url is required");
            await expect(() => queryDataElements(channel, "", 2, Promise.resolve())).rejects.toThrow("url is required");
        });
        it("performs the query", async () => {
            const channel = mockChannel(() => dummyServiceResponse);
            const result = await queryDataElements(channel, dummyServiceUrl, 2, Promise.resolve());
            expect(result).toStrictEqual(dummyServiceResponse);
        });
    });
});