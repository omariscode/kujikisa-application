import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_PREFIX = "kujikisa_cache_";
const LAST_SYNC_KEY = "kujikisa_last_sync";

export async function cacheData(key: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(
      OFFLINE_PREFIX + key,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {}
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data as T;
  } catch {
    return null;
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(OFFLINE_PREFIX));
    for (const key of cacheKeys) {
      await AsyncStorage.removeItem(key);
    }
  } catch {}
}

export async function setLastSync(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch {}
}

export async function getLastSync(): Promise<number | null> {
  try {
    const val = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

export async function isOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("http://kujikisa.local/api/health", {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
