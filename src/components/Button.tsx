import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
}: ButtonProps) {
  const { colors, shadows, radius } = useAppTheme();

  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: isPrimary
            ? disabled
              ? colors.primaryTransparent
              : colors.primary
            : "transparent",
          borderRadius: radius.button,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: variant === "outline" ? colors.primary : "transparent",
          ...(isPrimary && !disabled ? shadows.button : {}),
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? "#FFFFFF" : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: isPrimary
                ? "#FFFFFF"
                : variant === "outline"
                  ? colors.primary
                  : colors.primary,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
