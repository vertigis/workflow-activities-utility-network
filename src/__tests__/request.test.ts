import { getLayerInfo, getServiceInfo, queryDataElements } from "../request";
import { mockChannel } from "../__mocks__/ChannelProvider";

const dummyFeatureServiceUrl =
    "https://server/arcgis/rest/services/myService/FeatureServer";
const dummyResponse = { foo: "bar" };

describe("request", () => {
    describe("getServiceInfo", () => {
        it("requires url", async () => {
            const channel = mockChannel(() => dummyResponse);
            await expect(() =>
                getServiceInfo(channel, "", Promise.resolve())
            ).rejects.toThrow("url is required");
        });
        it("fetches the service info", async () => {
            const channel = mockChannel(() => dummyResponse);
            const result = await getServiceInfo(
                channel,
                dummyFeatureServiceUrl,
                Promise.resolve()
            );
            expect(result).toStrictEqual(dummyResponse);
        });
    });
    describe("getLayerInfo", () => {
        it("requires url", async () => {
            const channel = mockChannel(() => dummyResponse);
            await expect(() =>
                getLayerInfo(channel, "", 2, Promise.resolve())
            ).rejects.toThrow("url is required");
        });
        it("fetches the layer info", async () => {
            const channel = mockChannel(() => dummyResponse);
            const result = await getLayerInfo(
                channel,
                dummyFeatureServiceUrl,
                2,
                Promise.resolve()
            );
            expect(result).toStrictEqual(dummyResponse);
        });
    });
    describe("queryDataElements", () => {
        it("requires url", async () => {
            const channel = mockChannel(() => dummyResponse);
            await expect(() =>
                queryDataElements(channel, "", 2, Promise.resolve())
            ).rejects.toThrow("url is required");
        });
        it("performs the query", async () => {
            const channel = mockChannel(() => dummyResponse);
            const result = await queryDataElements(
                channel,
                dummyFeatureServiceUrl,
                2,
                Promise.resolve()
            );
            expect(result).toStrictEqual(dummyResponse);
        });
    });
});
