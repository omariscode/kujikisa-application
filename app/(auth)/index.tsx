import { Redirect } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(auth)/login"} />;
}
