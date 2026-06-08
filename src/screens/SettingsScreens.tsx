import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS, RADIUS } from "@/src/theme/platform";
import { getDevices } from "@/src/services/devices";
import type { Device } from "@/src/types";

const SPRING_CONFIG = { damping: 18, stiffness: 220 };

function AnimatedToggle({ value, onToggle, colors }: { value: boolean; onToggle: (v: boolean) => void; colors: any }) {
  const translateX = useSharedValue(value ? 18 : 2);
  const trackColor = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    translateX.value = withSpring(value ? 18 : 2, SPRING_CONFIG);
    trackColor.value = withSpring(value ? 1 : 0, SPRING_CONFIG);
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const trackStyle = useAnimatedStyle(() => ({ backgroundColor: trackColor.value > 0.5 ? colors.primary : colors.border }));

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onToggle(!value)} style={{ padding: 4 }}>
      <Animated.View style={[{ width: 44, height: 28, borderRadius: 14, justifyContent: "center" }, trackStyle]}>
        <Animated.View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white }, thumbStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function SettingItem({ icon, label, description, toggle, value, onToggle, onPress, danger, colors, backgrounds, borders, shadows, radius }: {
  icon: string;
  label: string;
  description?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  colors: any;
  backgrounds: any;
  borders: any;
  shadows: any;
  radius: typeof RADIUS;
}) {
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: borders.card, ...shadows.cardSm }}
      onPress={toggle && onToggle ? () => onToggle(!value) : onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: danger ? colors.errorBg : colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
          <FontAwesome name={icon as any} size={16} color={danger ? colors.error : colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: danger ? colors.error : colors.textPrimary }}>{label}</Text>
          {description ? <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{description}</Text> : null}
        </View>
      </View>
      {toggle && onToggle ? <AnimatedToggle value={!!value} onToggle={onToggle} colors={colors} /> : <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

const TabBarPadding = isIOS ? 120 : 100;

export default function SettingsScreen() {
  const { colors, backgrounds, borders, shadows, radius, isDark, setDarkMode } = useAppTheme();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    loadDevice();
  }, []);

  async function loadDevice() {
    try {
      const devices = await getDevices();
      if (devices.length > 0) setDevice(devices[0]);
    } catch {}
  }

  const shared = { colors, backgrounds, borders, shadows, radius };

  const s = useMemo(() => ({
    container: { flex: 1, backgroundColor: backgrounds.screen } as const,
    scroll: { paddingBottom: TabBarPadding } as const,
    section: { paddingHorizontal: 20, marginTop: 24 } as const,
    sectionTitle: { fontSize: 12, fontWeight: "700" as const, color: colors.textTertiary, letterSpacing: 0.5, textTransform: "uppercase" as const, marginBottom: 10 },
  }), [backgrounds.screen, colors.textTertiary]);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notificações</Text>
          <SettingItem icon="bell" label="Notificações Push" description="Receber lembretes de medicação" toggle value={notifications} onToggle={setNotifications} {...shared} />
          <SettingItem icon="music" label="Som" description="Activar som nos alertas" toggle value={sound} onToggle={setSound} {...shared} />
          <SettingItem icon="mobile" label="Vibração" description="Vibrar quando receber alerta" toggle value={vibration} onToggle={setVibration} {...shared} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Aparência</Text>
          <SettingItem icon="moon-o" label="Modo Escuro" description="Activar tema escuro" toggle value={isDark} onToggle={setDarkMode} {...shared} />
          <SettingItem icon="text-height" label="Tamanho da Fonte" description="Normal" onPress={() => {}} {...shared} />
          <SettingItem icon="language" label="Idioma" description="Português" onPress={() => {}} {...shared} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Segurança</Text>
          <SettingItem icon="fingerprint" label="Biometria" description="Entrar com impressão digital" toggle value={biometric} onToggle={setBiometric} {...shared} />
          <SettingItem icon="lock" label="Alterar Senha" onPress={() => {}} {...shared} />
          <SettingItem icon="shield" label="Privacidade" onPress={() => {}} {...shared} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Dispositivo</Text>
          <SettingItem icon="bluetooth" label="Gerir Dispositivo" description={device ? `${device.name} · ${device.status}` : "Nenhum dispositivo"} onPress={() => {}} {...shared} />
          <SettingItem icon="refresh" label="Verificar Actualizações" description={`Firmware ${device?.firmware_version || "N/A"}`} onPress={() => {}} {...shared} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Suporte</Text>
          <SettingItem icon="question-circle" label="Ajuda & FAQ" onPress={() => {}} {...shared} />
          <SettingItem icon="envelope" label="Contactar Suporte" onPress={() => {}} {...shared} />
          <SettingItem icon="info-circle" label="Sobre a App" description="Versão 1.0.0" onPress={() => {}} {...shared} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Zona Perigosa</Text>
          <SettingItem icon="trash" label="Eliminar Conta" danger onPress={() => {}} {...shared} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
