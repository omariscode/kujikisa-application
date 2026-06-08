import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import CustomHeader from "../components/HeaderApp";

export default function AppLayout() {
  const { isDark, backgrounds } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: backgrounds.screen,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#4A9EFF" : "#005EA4"}
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <CustomHeader />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="personal-info" />
        <Stack.Screen name="notification" />
        <Stack.Screen name="review-prescription" />
        <Stack.Screen name="device-setup" />
      </Stack>
    </View>
  );
}
