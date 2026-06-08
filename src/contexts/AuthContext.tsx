import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { getToken, getUser, removeToken, removeUser, setToken, setUser } from "@/src/services/storage";
import * as authService from "@/src/services/auth";
import type { UserProfile, LoginRequest, RegisterRequest } from "@/src/types";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      const storedToken = await getToken();
      const storedUser = await getUser();

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(JSON.parse(storedUser));
        try {
          await authService.syncTime();
        } catch {}
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    await setToken(response.access);
    await setUser(JSON.stringify(response.user));
    setTokenState(response.access);
    setUserState(response.user);
    try {
      await authService.syncTime();
    } catch {}
    router.replace("/(app)/(tabs)");
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    await removeToken();
    await removeUser();
    setTokenState(null);
    setUserState(null);
    router.replace("/(auth)/login");
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUserState(profile);
      await setUser(JSON.stringify(profile));
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
