import { isIOS } from "@/src/theme/platform";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { getDevices } from "@/src/services/devices";
import type { Device } from "@/src/types";

export default function ProfileScreen() {
  const { colors, backgrounds, borders, shadows, radius } = useAppTheme();
  const { user, logout } = useAuth();
  const [device, setDevice] = useState<Device | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadDevice();
  }, []);

  async function loadDevice() {
    try {
      const devices = await getDevices();
      if (devices.length > 0) setDevice(devices[0]);
    } catch {}
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const s = useMemo(() => ({
    scroll: { paddingBottom: 120, backgroundColor: backgrounds.screen },
    container: { flex: 1, backgroundColor: backgrounds.screen } as const,
  }), [backgrounds.screen]);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} style={{ backgroundColor: backgrounds.screen }}>
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center", marginBottom: 12, ...(isIOS ? { borderWidth: 1, borderColor: borders.card, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 } : {}) }}>
            <FontAwesome name="user" size={52} color={colors.primary} />
            <View style={{ position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: backgrounds.screen }}>
              <FontAwesome name="camera" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>{user?.full_name || "Utilizador"}</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>{user?.email || ""}</Text>
          {device && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, backgroundColor: colors.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 }}>
              <FontAwesome name="check-circle" size={14} color={colors.success} />
              <Text style={{ fontSize: 13, color: colors.success, fontWeight: "500" }}>Dispositivo vinculado</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textTertiary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Informações da Conta</Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: borders.card, ...shadows.cardSm }}
            onPress={() => router.push("/(app)/personal-info")}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
                <FontAwesome name="user-circle" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Dados Pessoais</Text>
                <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>E-mail, telefone, senha</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textTertiary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Cuidador / Familiar</Text>
          <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 16, borderWidth: 1, borderColor: borders.card, gap: 12, ...shadows.cardSm }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="heart" size={16} color={colors.error} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Nenhum cuidador adicionado</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>Adiciona alguém para receber notificações</Text>
              </View>
            </View>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: colors.primaryGlass, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50 }}>
              <FontAwesome name="plus" size={14} color={colors.primary} />
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary }}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20, paddingVertical: 16, borderRadius: radius.cardSm, borderWidth: 1, borderColor: colors.errorBg, backgroundColor: colors.errorBg }}
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <FontAwesome name="sign-out" size={18} color={colors.error} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.error }}>Terminar Sessão</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
