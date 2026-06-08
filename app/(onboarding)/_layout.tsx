import { Stack } from "expo-router";
import { View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";

export default function OnboardingLayout() {
  const { backgrounds } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}