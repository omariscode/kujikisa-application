import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import {
  BACKGROUNDS,
  BORDERS,
  COLORS,
  DARK_BACKGROUNDS,
  DARK_BORDERS,
  DARK_COLORS,
  DARK_SHADOWS,
  RADIUS,
  SHADOWS,
} from "./platform";

export type Theme = {
  isDark: boolean;
  colors: typeof COLORS;
  backgrounds: typeof BACKGROUNDS;
  borders: typeof BORDERS;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
  setDarkMode: (dark: boolean) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Theme>({
  isDark: false,
  colors: COLORS,
  backgrounds: BACKGROUNDS,
  borders: BORDERS,
  radius: RADIUS,
  shadows: SHADOWS,
  setDarkMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  useEffect(() => {
    setIsDark(systemScheme === "dark");
  }, [systemScheme]);

  const value = useMemo(
    () => ({
      isDark,
      colors: isDark ? DARK_COLORS : COLORS,
      backgrounds: isDark ? DARK_BACKGROUNDS : BACKGROUNDS,
      borders: isDark ? DARK_BORDERS : BORDERS,
      radius: RADIUS,
      shadows: isDark ? DARK_SHADOWS : SHADOWS,
      setDarkMode: setIsDark,
      toggleTheme: () => setIsDark((prev) => !prev),
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
