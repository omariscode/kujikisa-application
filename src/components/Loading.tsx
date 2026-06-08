import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message, fullScreen }: LoadingProps) {
  const { isDark, backgrounds } = useAppTheme();

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: backgrounds.screen },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#4A9EFF" : "#005EA4"}
        />
        {message ? (
          <Text style={[styles.message, { color: isDark ? "#B0B8C4" : "#404752" }]}>
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator
        size="small"
        color={isDark ? "#4A9EFF" : "#005EA4"}
      />
      {message ? (
        <Text
          style={[
            styles.message,
            { color: isDark ? "#B0B8C4" : "#404752" },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
  },
});
