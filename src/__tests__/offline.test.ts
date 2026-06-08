import { cacheData, getCachedData, clearAllCache } from "@/src/services/offline";

const mockStorage: Record<string, string> = {};

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] ?? null);
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

describe("offline service", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });

  it("caches and retrieves data", async () => {
    await cacheData("test_key", { foo: "bar" });
    const result = await getCachedData<{ foo: string }>("test_key");
    expect(result).toEqual({ foo: "bar" });
  });

  it("returns null for missing key", async () => {
    const result = await getCachedData("nonexistent");
    expect(result).toBeNull();
  });

  it("clears all cache", async () => {
    await cacheData("key1", { a: 1 });
    await cacheData("key2", { b: 2 });
    const allKeysBefore = Object.keys(mockStorage).filter((k) =>
      k.startsWith("kujikisa_cache_"),
    );
    expect(allKeysBefore.length).toBe(2);

    await clearAllCache();
    const allKeysAfter = Object.keys(mockStorage).filter((k) =>
      k.startsWith("kujikisa_cache_"),
    );
    expect(allKeysAfter.length).toBe(0);
  });
});
