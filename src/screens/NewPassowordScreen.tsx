import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";
import { getApiError } from "@/src/services/client";
import { changePassword } from "@/src/services/auth";

function getPasswordStrength(password: string, colors: any) {
  if (password.length === 0) return { level: 0, text: "", color: colors.textMuted };
  if (password.length < 6) return { level: 1, text: "Senha fraca", color: colors.error };
  if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, text: "Senha forte", color: colors.primary };
  if (password.length >= 8) return { level: 3, text: "Senha boa", color: "#4FC3F7" };
  return { level: 2, text: "Senha razoável", color: "#58CAFE" };
}

export default function NewPasswordScreen() {
  const { colors, backgrounds, borders, shadows, radius, isDark } = useAppTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const strength = getPasswordStrength(newPassword, colors);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = currentPassword && newPassword.length >= 6 && passwordsMatch && !loading;

  const handleSave = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setSaved(true);
      setTimeout(() => router.push("/(auth)/login"), 1500);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = isIOS ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.15)") : "rgba(0,94,164,0.2)";
  const inputBg = isIOS ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)") : isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={backgrounds.screen} translucent={false} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 64, marginTop: 40 }}>
          <TouchableOpacity style={{ padding: 8, borderRadius: 50 }} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={18} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary }}>Nova Senha</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 32, justifyContent: "center", flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ width: "100%", maxWidth: 480, backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 24, borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16, ...(isIOS ? { borderWidth: 1, borderColor: borders.card } : {}) }}>
              <FontAwesome name="lock" size={32} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 24 }}>Crie uma nova senha forte para proteger sua conta Kujikisa.</Text>

            {error ? (
              <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error }}>
                <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
              </View>
            ) : null}

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>Senha Atual</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg }}>
                <TextInput style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, color: colors.textPrimary, fontSize: 16 }} placeholder="Digite sua senha atual" placeholderTextColor={colors.textTertiary} secureTextEntry={!showCurrent} value={currentPassword} onChangeText={setCurrentPassword} editable={!saved} />
                <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => setShowCurrent(!showCurrent)}>
                  <FontAwesome name={showCurrent ? "eye-slash" : "eye"} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>Nova Senha</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg }}>
                <TextInput style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, color: colors.textPrimary, fontSize: 16 }} placeholder="Digite sua nova senha" placeholderTextColor={colors.textTertiary} secureTextEntry={!showNew} value={newPassword} onChangeText={setNewPassword} editable={!saved} />
                <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => setShowNew(!showNew)}>
                  <FontAwesome name={showNew ? "eye-slash" : "eye"} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {newPassword.length > 0 && (
                <>
                  <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
                    {[1, 2, 3, 4].map((bar) => (
                      <View key={bar} style={{ flex: 1, height: 6, borderRadius: 50, backgroundColor: bar <= strength.level ? strength.color : colors.border }} />
                    ))}
                  </View>
                  <Text style={{ fontSize: 11, textAlign: "right", marginTop: 4, fontWeight: "500", color: strength.color }}>{strength.text}</Text>
                </>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>Confirmar Nova Senha</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.input, borderWidth: 1, borderColor: passwordsMismatch ? colors.error : passwordsMatch ? colors.primary : inputBorder, backgroundColor: inputBg }}>
                <TextInput style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, color: colors.textPrimary, fontSize: 16 }} placeholder="Repita sua nova senha" placeholderTextColor={colors.textTertiary} secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword} editable={!saved} />
                <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => setShowConfirm(!showConfirm)}>
                  <FontAwesome name={showConfirm ? "eye-slash" : "eye"} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {passwordsMismatch && <Text style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>As senhas não coincidem</Text>}
              {passwordsMatch && <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: "500" }}>✓ Senhas coincidem</Text>}
            </View>

            {saved && (
              <View style={{ backgroundColor: colors.primaryGlass, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.primaryTransparent }}>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500", textAlign: "center" }}>✅ Senha alterada com sucesso! Redirecionando...</Text>
              </View>
            )}

            <TouchableOpacity
              style={{ width: "100%", backgroundColor: (!canSubmit || saved) ? colors.primaryTransparent : colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", marginTop: 8, ...((!canSubmit || saved) ? {} : shadows.button) }}
              onPress={handleSave}
              disabled={!canSubmit || saved}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}> Salvando...</Text>
                </View>
              ) : (
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>{saved ? "Senha salva ✓" : "Salvar nova senha"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
