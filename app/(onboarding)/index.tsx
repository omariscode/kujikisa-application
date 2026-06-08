import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";

export default function OnboardingWelcome() {
  const insets = useSafeAreaInsets();
  const { colors, backgrounds, isDark } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: backgrounds.screen }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View style={[styles.topSection, { paddingTop: insets.top + 40 }]}>
        <Image
          source={require("../../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.brandName, { color: colors.primary }]}>
          KUJIKISA
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Dose certa, cuidar da saúde na hora certa.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <FeatureCard
          icon="wifi"
          title="Conecte ao Dispensador"
          description="Ligue ao Wi-Fi do seu Kujikisa para começar."
          colors={colors}
          backgrounds={backgrounds}
          isDark={isDark}
        />
        <FeatureCard
          icon="calendar-check-o"
          title="Agende suas Medicações"
          description="Crie prescrições com horários personalizados."
          colors={colors}
          backgrounds={backgrounds}
          isDark={isDark}
        />
        <FeatureCard
          icon="bell-o"
          title="Receba Lembretes"
          description="Nunca mais perca um horário de medicação."
          colors={colors}
          backgrounds={backgrounds}
          isDark={isDark}
        />
      </View>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(onboarding)/connect-device")}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>Começar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 12 }}
          onPress={() => router.replace("/(auth)")}
        >
          <Text style={{ fontSize: 14, color: colors.textTertiary }}>
            Já tenho conta —{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Fazer login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  colors,
  backgrounds,
  isDark,
}: {
  icon: string;
  title: string;
  description: string;
  colors: any;
  backgrounds: any;
  isDark: boolean;
}) {
  const icons: Record<string, string> = {
    wifi: "📶",
    "calendar-check-o": "💊",
    "bell-o": "🔔",
  };

  if (isIOS) {
    return (
      <BlurView
        intensity={40}
        tint={isDark ? "dark" : "light"}
        style={[styles.featureCard, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)" }]}
      >
        <Text style={styles.featureIcon}>{icons[icon] || "•"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.featureDesc, { color: colors.textTertiary }]}>{description}</Text>
        </View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.featureCard, { backgroundColor: backgrounds.card, borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,94,164,0.08)" }]}>
      <Text style={styles.featureIcon}>{icons[icon] || "•"}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textTertiary }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 72,
    height: 120,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresSection: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  featureIcon: {
    fontSize: 28,
    width: 44,
    textAlign: "center",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  startButton: {
    width: "100%",
    maxWidth: 320,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});