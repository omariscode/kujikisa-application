import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";

export default function ForgotPasswordScreen() {
  const { colors, backgrounds, borders, shadows, radius, isDark } = useAppTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = () => {
    setError("");
    if (!email.trim()) {
      setError("Preencha o email.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      router.push("/(auth)/verify-code");
    }, 1500);
  };

  const inputBorder = isIOS
    ? isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.15)"
    : "rgba(0,94,164,0.2)";
  const inputBg = isIOS
    ? isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)"
    : isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity
            style={{ padding: 8, borderRadius: 50 }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 24, ...(isIOS ? { borderWidth: 1, borderColor: borders.card } : {}) }}>
            <FontAwesome name="lock" size={36} color={colors.primary} />
          </View>

          <View style={{ marginBottom: 32, alignItems: "center" }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 }}>
              Recuperar Senha
            </Text>
            <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22, textAlign: "center" }}>
              Digite seu e-mail para receber o código de verificação
            </Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error }}>
              <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>
              E-mail
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
              <FontAwesome name="envelope-o" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, paddingVertical: 14, color: colors.textPrimary, fontSize: 15 }}
                placeholder="exemplo@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!sent}
              />
            </View>
          </View>

          {sent && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primaryGlass, borderRadius: radius.button, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.primaryTransparent }}>
              <FontAwesome name="check-circle" size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500" }}>
                Código enviado! Verifique seu e-mail.
              </Text>
            </View>
          )}

          <View style={{ marginTop: "auto", paddingBottom: 32, paddingTop: 24 }}>
            <TouchableOpacity
              style={{ width: "100%", backgroundColor: (loading || sent) ? colors.primaryTransparent : colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", ...((loading || sent) ? {} : shadows.button) }}
              onPress={handleSendCode}
              activeOpacity={0.85}
              disabled={loading || sent}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}> Enviando...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <FontAwesome name="paper-plane" size={14} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
                    {sent ? "Código enviado ✓" : "Enviar código"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {sent && (
              <TouchableOpacity
                style={{ alignItems: "center", marginTop: 16 }}
                onPress={() => { setSent(false); setEmail(""); }}
              >
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "500" }}>
                  Usar outro e-mail
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
