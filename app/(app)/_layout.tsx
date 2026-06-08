import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import CustomHeader from "../components/HeaderApp";

export default function AppLayout() {
  const { isDark, backgrounds } = useAppTheme();

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
