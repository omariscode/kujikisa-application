import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isDark, colors, backgrounds, borders } = useAppTheme();

  const isTabScreen = pathname.includes("(tabs)");
  const isHomeScreen = pathname === "/(app)" || pathname === "/(app)/" || pathname === "/(app)/(tabs)" || pathname === "/(app)/(tabs)/";
  const showBackButton = !isTabScreen && !isHomeScreen && pathname !== "/";

  const handleBack = () => {
    router.back();
  };

  if (isIOS) {
    return (
      <>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <BlurView
          intensity={60}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.header,
            {
              paddingTop: insets.top,
              borderBottomColor: borders.card,
            },
          ]}
        >
          <View
            style={[
              styles.headerOverlay,
              { backgroundColor: backgrounds.header },
            ]}
          />
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {showBackButton && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <FontAwesome name="arrow-left" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
              <Text style={[styles.brandName, { color: colors.primary }]}>
                Kujikisa
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => router.push("/(app)/notification")}
                style={styles.notificationButton}
              >
                <FontAwesome name="bell" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: backgrounds.header,
            borderBottomColor: borders.card,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <FontAwesome name="arrow-left" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            <Text style={[styles.brandName, { color: colors.primary }]}>
              Kujikisa
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/(app)/notification")}
              style={styles.notificationButton}
            >
              <FontAwesome name="bell" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    borderBottomWidth: 1,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
  },
});
