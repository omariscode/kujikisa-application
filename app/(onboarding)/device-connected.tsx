import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/theme/ThemeContext";

export default function DeviceConnectedScreen() {
  const insets = useSafeAreaInsets();
  const { colors, backgrounds, isDark } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.successBg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <FontAwesome name="check" size={44} color={colors.success} />
        </View>

        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 }}>
          Dispensador Conectado!
        </Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 40 }}>
          O seu Kujikisa foi encontrado. Agora crie uma conta para começar a gerir as suas medicações.
        </Text>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 50,
            width: "100%",
            maxWidth: 320,
          }}
          onPress={() => router.replace("/(auth)/register")}
          activeOpacity={0.85}
        >
          <FontAwesome name="user-plus" size={16} color="#FFF" />
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
            Criar Conta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ fontSize: 14, color: colors.textTertiary }}>
            Já tenho conta —{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Fazer login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingBottom: insets.bottom + 20, alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.replace("/(onboarding)/connect-device")}>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            Conectar outro dispositivo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}