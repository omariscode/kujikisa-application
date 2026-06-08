import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

export default function VerifyCodeScreen() {
  const { colors, backgrounds, borders, shadows, radius, isDark } = useAppTheme();
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (!cleaned && text !== "") return;
    const newCode = [...code];
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split("");
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
      return;
    }
    newCode[index] = cleaned;
    setCode(newCode);
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setError("");
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Insira o código completo de 6 dígitos.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/(auth)/new-password");
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const isComplete = code.every((d) => d !== "");
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
        backgroundColor={backgrounds.screen}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 64, marginTop: 40 }}>
          <TouchableOpacity style={{ padding: 8, borderRadius: 50 }} onPress={() => router.back()} activeOpacity={0.7}>
            <FontAwesome name="arrow-left" size={18} color={colors.primary} />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
            <View style={{ width: "100%", maxWidth: 400, backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 24, alignItems: "center", borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
            <View style={{ width: 80, height: 80, borderRadius: 50, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 36 }}>📧</Text>
            </View>

            {error ? (
              <View style={{ width: "100%", backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error }}>
                <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
              </View>
            ) : null}
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
              Enviamos um código de 6 dígitos para o seu e-mail. Por favor, insira-o abaixo para continuar.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32, width: "100%" }}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={{
                    width: 46,
                    height: 56,
                    borderRadius: radius.input,
                    borderWidth: 1,
                    borderColor: digit !== "" ? colors.primary : inputBorder,
                    backgroundColor: digit !== ""
                      ? (isIOS ? "rgba(0,94,164,0.08)" : "rgba(0,94,164,0.06)")
                      : inputBg,
                    fontSize: 24,
                    fontWeight: "700",
                    color: colors.textPrimary,
                    textAlign: "center",
                    ...(digit !== ""
                      ? (isIOS
                          ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 }
                          : { elevation: 2 })
                      : {}),
                  }}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>

            <TouchableOpacity
              style={{ width: "100%", backgroundColor: loading ? colors.primaryTransparent : colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", ...(loading ? {} : shadows.button) }}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}> Verificando...</Text>
                </View>
              ) : (
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Verificar</Text>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 24, alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Não recebeu o código?</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: canResend ? colors.primary : colors.textTertiary }}>
                    Reenviar código
                  </Text>
                </TouchableOpacity>
                {!canResend && (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}> ({timer}s)</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
