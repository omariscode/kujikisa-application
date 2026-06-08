import { isIOS } from "@/src/theme/platform";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../theme/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { getApiError } from "@/src/services/client";

export default function LoginScreen() {
  const { colors, backgrounds, shadows, radius, isDark } = useAppTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = isIOS
    ? isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.15)"
    : "rgba(0,94,164,0.2)";
  const inputBg = isIOS
    ? isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)"
    : isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)";
  const dividerColor = isIOS
    ? isDark ? "rgba(255,255,255,0.12)" : "rgba(60,60,67,0.12)"
    : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,94,164,0.12)";
  const socialBorder = isIOS
    ? isDark ? "rgba(255,255,255,0.2)" : "rgba(60,60,67,0.15)"
    : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,94,164,0.2)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Image source={require("../../assets/images/logo2.png")} style={{ width: 58, height: 98, marginBottom: 12 }} />
              <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary, marginBottom: 8 }}>KUJIKISA</Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: "center", fontWeight: "700" }}>
              Dose certa, cuidar da saúde na hora certa.
            </Text>
          </View>

          <View style={{ width: "100%", maxWidth: 400, borderRadius: radius.card, paddingHorizontal: 20, paddingVertical: 40, alignSelf: "center" }}>
            {error ? (
              <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error }}>
                <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
              </View>
            ) : null}

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textTertiary, marginBottom: 6 }}>E-mail</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
                <FontAwesome name="envelope-o" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }}
                  placeholder="example@gmail.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textTertiary, marginBottom: 6 }}>Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
                <FontAwesome name="lock" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }}
                  placeholder="********"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, marginTop: 8 }}>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.primary, marginRight: 8, justifyContent: "center", alignItems: "center", backgroundColor: rememberMe ? colors.primary : "transparent" }}>
                  {rememberMe && <FontAwesome name="check" size={10} color="#FFFFFF" />}
                </View>
                <Text style={{ fontSize: 14, color: colors.textTertiary }}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500" }}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", backgroundColor: (!email || !password || loading) ? colors.primaryTransparent : colors.primary, paddingVertical: 14, borderRadius: radius.button, marginBottom: 16, ...((!email || !password || loading) ? {} : shadows.button) }}
              onPress={handleLogin}
              disabled={!email || !password || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: dividerColor }} />
              <Text style={{ color: colors.textTertiary, fontSize: 14, marginHorizontal: 12 }}>Or Login with</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: dividerColor }} />
            </View>

            <View style={{ flexDirection: "row", gap: 12, justifyContent: "center" }}>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: radius.button, borderWidth: 1, borderColor: socialBorder, backgroundColor: backgrounds.elevated, width: "50%" }}>
                <MaterialCommunityIcons name="google" size={18} color="#DB4437" />
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.textPrimary }}> Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: radius.button, borderWidth: 1, borderColor: socialBorder, backgroundColor: backgrounds.elevated, width: "50%" }}>
                <MaterialCommunityIcons name="apple" size={18} color={colors.textPrimary} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.textPrimary }}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Did not have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
