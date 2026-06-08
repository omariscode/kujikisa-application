import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";
import { useAuth } from "@/src/contexts/AuthContext";
import { getApiError } from "@/src/services/client";
import * as authService from "@/src/services/auth";
import { setOnboardingComplete } from "@/src/services/storage";

function getPasswordStrength(password: string, colors: any) {
  if (password.length === 0) return { level: 0, text: "", color: colors.textMuted };
  if (password.length < 6) return { level: 1, text: "Senha fraca", color: colors.error };
  if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, text: "Senha forte", color: colors.primary };
  if (password.length >= 8) return { level: 3, text: "Senha boa", color: "#4FC3F7" };
  return { level: 2, text: "Senha razoável", color: "#58CAFE" };
}

export default function RegisterScreen() {
  const { colors, backgrounds, shadows, radius, isDark } = useAppTheme();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password, colors);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = fullName.trim() && email && password.length >= 6 && passwordsMatch && !loading;

  const handleRegister = async () => {
    setError("");
    if (!fullName.trim()) {
      setError("Preencha o nome completo.");
      return;
    }
    if (!email.trim()) {
      setError("Preencha o email.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await authService.register({ full_name: fullName, email, password });
      await login({ email, password });
      await setOnboardingComplete();
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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}>
        <View style={{ paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 38 : 34 }}>
          <TouchableOpacity style={{ padding: 8, borderRadius: 50, width: 40, height: 40, alignItems: "center", justifyContent: "center" }} onPress={() => router.back()} activeOpacity={0.7}>
            <FontAwesome name="arrow-left" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, justifyContent: "center", flexGrow: 1, paddingVertical: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
          <View style={{ marginBottom: 24, alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: "900", color: colors.primary, marginBottom: 12 }}>Sign up to Kujikisa</Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: "center" }}>Your health, our priority.</Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error }}>
              <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textTertiary, marginBottom: 6 }}>Nome Completo</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
              <FontAwesome name="user-o" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }} placeholder="Seu nome completo" placeholderTextColor={colors.textTertiary} autoCapitalize="words" value={fullName} onChangeText={setFullName} editable={!loading} />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textTertiary, marginBottom: 6 }}>Email</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
              <FontAwesome name="envelope-o" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }} placeholder="seu@email.com" placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} editable={!loading} />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textTertiary, marginBottom: 6 }}>Senha</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
              <FontAwesome name="lock" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }} placeholder="Crie uma senha forte" placeholderTextColor={colors.textTertiary} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} editable={!loading} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
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

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textTertiary, marginBottom: 6 }}>Confirmar Senha</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: passwordsMismatch ? colors.error : passwordsMatch ? colors.primary : inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
              <FontAwesome name="lock" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }} placeholder="Repita a senha" placeholderTextColor={colors.textTertiary} secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} editable={!loading} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {passwordsMismatch && <Text style={{ fontSize: 12, color: colors.error, marginTop: 4 }}><FontAwesome name="times-circle" size={12} color={colors.error} /> As senhas não coincidem</Text>}
            {passwordsMatch && <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: "500" }}><FontAwesome name="check-circle" size={12} color={colors.primary} /> Senhas coincidem</Text>}
          </View>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", backgroundColor: loading ? colors.primaryTransparent : colors.primary, paddingVertical: 14, borderRadius: radius.button, marginTop: 8, ...(loading ? {} : shadows.button) }}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Cadastrar-se</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Já tenho conta. </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
