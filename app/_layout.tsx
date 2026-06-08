import { Stack } from "expo-router";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { ThemeProvider, useAppTheme } from "@/src/theme/ThemeContext";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";

function RootLayoutContent() {
  const { isDark, backgrounds } = useAppTheme();
  const { isLoading } = useAuth();

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

  return (
    <View style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
