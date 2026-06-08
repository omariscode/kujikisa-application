import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const { colors, radius } = useAppTheme();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.errorBg,
          borderRadius: radius.input,
          borderColor: colors.error,
        },
      ]}
    >
      <Text
        style={[styles.text, { color: colors.error }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
