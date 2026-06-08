import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "kujikisa_token";
const USER_KEY = "kujikisa_user";
const DEVICE_URL_KEY = "kujikisa_device_url";
const ONBOARDING_KEY = "kujikisa_onboarding";

import * as SecureStore from "expo-secure-store";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(TOKEN_KEY);
  if (!SecureStore) return null;
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {}
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (!SecureStore) return;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {}
}

export async function getUser(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(USER_KEY);
  if (!SecureStore) return null;
  try {
    return await SecureStore.getItemAsync(USER_KEY);
  } catch {
    return null;
  }
}

export async function setUser(user: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(USER_KEY, user);
    return;
  }
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(USER_KEY, user);
  } catch {}
}

export async function removeUser(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(USER_KEY);
    return;
  }
  if (!SecureStore) return;
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {}
}

export async function getDeviceUrl(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(DEVICE_URL_KEY);
  if (!SecureStore) return null;
  try {
    return await SecureStore.getItemAsync(DEVICE_URL_KEY);
  } catch {
    return null;
  }
}

export async function setDeviceUrl(url: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(DEVICE_URL_KEY, url);
    return;
  }
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(DEVICE_URL_KEY, url);
  } catch {}
}

export async function removeDeviceUrl(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(DEVICE_URL_KEY);
    return;
  }
  if (!SecureStore) return;
  try {
    await SecureStore.deleteItemAsync(DEVICE_URL_KEY);
  } catch {}
}

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch {}
}
