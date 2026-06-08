import { Platform } from "react-native";

// ─── Light palette ─────────────────────────────────────────────────────────
export const COLORS = {
  primary: "#005EA4",
  primaryLight: "#0077CE",
  primaryDark: "#004A75",
  primaryGlass: "rgba(0, 94, 164, 0.12)",
  primaryTransparent: "rgba(0, 94, 164, 0.08)",

  success: "#388E3C",
  successBg: "#E8F5E9",
  error: "#BA1A1A",
  errorBg: "#FFDAD6",

  textPrimary: "#181C22",
  textSecondary: "#404752",
  textTertiary: "#707783",
  textMuted: "#C0C7D4",

  border: "#E0E2EA",
  borderLight: "#F1F3FC",

  white: "#FFFFFF",
  black: "#1A1C1C",
};

// ─── Dark palette ──────────────────────────────────────────────────────────
export const DARK_COLORS = {
  primary: "#4A9EFF",
  primaryLight: "#6DB5FF",
  primaryDark: "#005EA4",
  primaryGlass: "rgba(74, 158, 255, 0.18)",
  primaryTransparent: "rgba(74, 158, 255, 0.1)",

  success: "#4CAF50",
  successBg: "#1B5E20",
  error: "#EF5350",
  errorBg: "#4A1C1C",

  textPrimary: "#F1F3F9",
  textSecondary: "#B0B8C4",
  textTertiary: "#7A8290",
  textMuted: "#484F5C",

  border: "#2A2D35",
  borderLight: "#1F2229",

  white: "#FFFFFF",
  black: "#0E0E12",
};

// ─── Light platform-specific backgrounds ───────────────────────────────────
export const BACKGROUNDS = Platform.select({
  ios: {
    screen: "#F2F2F7",
    card: "rgba(255, 255, 255, 0.65)",
    elevated: "rgba(255, 255, 255, 0.78)",
    header: "rgba(255, 255, 255, 0.6)",
    tabBar: "rgba(255, 255, 255, 0.5)",
  },
  android: {
    screen: "#F0F4FA",
    card: "#FFFFFF",
    elevated: "#FFFFFF",
    header: "#F0F4FA",
    tabBar: "#F0F4FA",
  },
  default: {
    screen: "#F0F4FA",
    card: "#FFFFFF",
    elevated: "#FFFFFF",
    header: "#FFFFFF",
    tabBar: "#FFFFFF",
  },
}) as {
  screen: string;
  card: string;
  elevated: string;
  header: string;
  tabBar: string;
};

// ─── Dark platform-specific backgrounds ────────────────────────────────────
export const DARK_BACKGROUNDS = Platform.select({
  ios: {
    screen: "#0E0E12",
    card: "rgba(255, 255, 255, 0.07)",
    elevated: "rgba(255, 255, 255, 0.12)",
    header: "rgba(14, 14, 18, 0.8)",
    tabBar: "rgba(14, 14, 18, 0.75)",
  },
  android: {
    screen: "#0F1117",
    card: "#1C1E26",
    elevated: "#24262E",
    header: "#0F1117",
    tabBar: "#0F1117",
  },
  default: {
    screen: "#0F1117",
    card: "rgba(255, 255, 255, 0.08)",
    elevated: "rgba(255, 255, 255, 0.14)",
    header: "#0F1117",
    tabBar: "#0F1117",
  },
}) as {
  screen: string;
  card: string;
  elevated: string;
  header: string;
  tabBar: string;
};

// ─── Light border colours ──────────────────────────────────────────────────
export const BORDERS = Platform.select({
  ios: {
    card: "rgba(255, 255, 255, 0.9)",
    subtle: "rgba(60, 60, 67, 0.08)",
  },
  android: {
    card: "rgba(0, 94, 164, 0.15)",
    subtle: "rgba(0, 94, 164, 0.08)",
  },
  default: {
    card: "#E0E2EA",
    subtle: "#F1F3FC",
  },
}) as {
  card: string;
  subtle: string;
};

// ─── Dark border colours ───────────────────────────────────────────────────
export const DARK_BORDERS = Platform.select({
  ios: {
    card: "rgba(255, 255, 255, 0.1)",
    subtle: "rgba(255, 255, 255, 0.05)",
  },
  android: {
    card: "rgba(255, 255, 255, 0.12)",
    subtle: "rgba(255, 255, 255, 0.06)",
  },
  default: {
    card: "rgba(255, 255, 255, 0.08)",
    subtle: "rgba(255, 255, 255, 0.04)",
  },
}) as {
  card: string;
  subtle: string;
};

// ─── Border radii ──────────────────────────────────────────────────────────
export const RADIUS = Platform.select({
  ios: {
    card: 24,
    cardSm: 16,
    button: 50,
    input: 14,
    avatar: 50,
    iconBox: 14,
  },
  android: {
    card: 20,
    cardSm: 14,
    button: 50,
    input: 12,
    avatar: 50,
    iconBox: 12,
  },
  default: {
    card: 20,
    cardSm: 14,
    button: 50,
    input: 12,
    avatar: 50,
    iconBox: 12,
  },
}) as {
  card: number;
  cardSm: number;
  button: number;
  input: number;
  avatar: number;
  iconBox: number;
};

// ─── Light Shadows ─────────────────────────────────────────────────────────
export const SHADOWS = Platform.select({
  ios: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    cardSm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    button: {
      shadowColor: "#005EA4",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
  },
  android: {
    card: {
      elevation: 2,
      shadowColor: "#005EA4",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    cardSm: {
      elevation: 1,
      shadowColor: "#005EA4",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    button: {
      elevation: 3,
      shadowColor: "#005EA4",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  },
  default: {
    card: { elevation: 2 },
    cardSm: { elevation: 1 },
    button: { elevation: 3 },
  },
}) as {
  card: Record<string, any>;
  cardSm: Record<string, any>;
  button: Record<string, any>;
};

// ─── Dark Shadows ──────────────────────────────────────────────────────────
export const DARK_SHADOWS = Platform.select({
  ios: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    cardSm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    button: {
      shadowColor: "#4A9EFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  },
  android: {
    card: {
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    cardSm: {
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    button: {
      elevation: 4,
      shadowColor: "#4A9EFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
  },
  default: {
    card: { elevation: 4 },
    cardSm: { elevation: 2 },
    button: { elevation: 4 },
  },
}) as {
  card: Record<string, any>;
  cardSm: Record<string, any>;
  button: Record<string, any>;
};

// ─── Helpers ───────────────────────────────────────────────────────────────
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export function cardStyle(extra?: Record<string, any>) {
  return {
    backgroundColor: BACKGROUNDS.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: BORDERS.card,
    ...SHADOWS.card,
    ...extra,
  };
}

export function cardSmStyle(extra?: Record<string, any>) {
  return {
    backgroundColor: BACKGROUNDS.card,
    borderRadius: RADIUS.cardSm,
    borderWidth: 1,
    borderColor: BORDERS.card,
    ...SHADOWS.cardSm,
    ...extra,
  };
}
