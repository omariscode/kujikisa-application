import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getOnboardingComplete } from "@/src/services/storage";

export default function Index() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboardingComplete().then(setOnboardingDone);
  }, []);

  if (onboardingDone === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Redirect href={onboardingDone ? "/(auth)" : "/(onboarding)"} />
  );
}