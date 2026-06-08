import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  style,
  variant = "default",
}: CardProps) {
  const { backgrounds, borders, shadows, radius } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: backgrounds.card,
    borderRadius: radius.card,
    borderWidth: variant === "outlined" ? 1 : 1,
    borderColor: borders.card,
    ...(variant === "elevated" ? shadows.card : shadows.cardSm),
  };

  return <View style={[styles.card, cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
});
