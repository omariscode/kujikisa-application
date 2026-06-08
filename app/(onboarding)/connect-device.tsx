import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { setDeviceUrl } from "@/src/services/storage";

const ESP32_KNOWN_SSIDS = ["Kujikisa-Setup", "kujikisa-setup", "kujikisa"];

interface WiFiNetwork {
  SSID: string;
  BSSID?: string;
  frequency?: number;
  level?: number;
  timestamp?: number;
}

export default function ConnectDeviceScreen() {
  const { colors, backgrounds, radius, isDark } = useAppTheme();
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [manualSSID, setManualSSID] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [showManual, setShowManual] = useState(false);

  const scanNetworks = useCallback(async () => {
    setScanning(true);
    setError("");
    try {
      const WifiManager = require("react-native-wifi-reborn").default;
      const list: WiFiNetwork[] = await WifiManager.loadWifiList();
      const sorted = [...list].sort((a, b) => (b.level ?? -100) - (a.level ?? -100));
      const unique = sorted.filter(
        (net, i, arr) => arr.findIndex((n) => n.SSID === net.SSID) === i,
      );
      setNetworks(unique);
    } catch (e: any) {
      if (Platform.OS === "ios") {
        setError("No iOS a leitura de redes não é suportada. Insira os dados manualmente.");
        setShowManual(true);
      } else {
        setError("Erro ao ler redes. Tente novamente.");
      }
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    if (!isIOS) scanNetworks();
    else setShowManual(true);
  }, []);

  const handleConnect = async (ssid: string, password?: string) => {
    setConnecting(true);
    setError("");
    try {
      if (Platform.OS === "android") {
        const WifiManager = require("react-native-wifi-reborn").default;
        await WifiManager.connectToProtectedSSID(
          ssid,
          password ?? "kujikisa123",
        );
      }

      const ok = await verifyConnection();
      if (ok) {
        setConnected(true);
        await setDeviceUrl("http://192.168.4.1");
        setTimeout(() => router.replace("/(onboarding)/device-connected"), 800);
      } else {
        setError("Dispositivo não encontrado após conectar. Verifique se está ligado.");
      }
    } catch (e: any) {
      setError("Erro ao conectar: " + (e?.message || "tente novamente."));
    } finally {
      setConnecting(false);
    }
  };

  const handleManualConnect = async () => {
    if (!manualSSID.trim()) {
      setError("Preencha o nome da rede (SSID).");
      return;
    }
    await handleConnect(manualSSID.trim(), manualPassword.trim() || "kujikisa123");
  };

  const verifyConnection = async (): Promise<boolean> => {
    const baseUrl = "http://192.168.4.1";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${baseUrl}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleVerifyOnly = async () => {
    setError("");
    setConnecting(true);
    const ok = await verifyConnection();
    setConnecting(false);
    if (ok) {
      setConnected(true);
      await setDeviceUrl("http://192.168.4.1");
      setTimeout(() => router.replace("/(onboarding)/device-connected"), 800);
    } else {
      setError("Dispensador não encontrado. Certifique-se de estar conectado ao Wi-Fi do Kujikisa.");
    }
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
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 }}>
        <TouchableOpacity
          style={{ padding: 8, borderRadius: 50 }}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 6 }}>
          Conectar Dispensador
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 20, lineHeight: 20 }}>
          Conecte-se ao Wi-Fi do seu dispensador Kujikisa para continuar.
        </Text>

        {error ? (
          <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error }}>
            <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
          </View>
        ) : null}

        {!isIOS && networks.length > 0 && !showManual && (
          <>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 10 }}>
              Redes encontradas:
            </Text>
            <FlatList
              data={networks}
              keyExtractor={(item) => item.BSSID || item.SSID}
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
              renderItem={({ item }) => {
                const isKnown = ESP32_KNOWN_SSIDS.includes(item.SSID);
                return (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      borderRadius: radius.card,
                      backgroundColor: isKnown ? colors.primaryGlass : backgrounds.card,
                      borderWidth: 1,
                      borderColor: isKnown ? colors.primary : inputBorder,
                    }}
                    onPress={() => handleConnect(item.SSID)}
                    disabled={connecting}
                  >
                    <FontAwesome name="wifi" size={20} color={isKnown ? colors.primary : colors.textTertiary} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "500", color: colors.textPrimary }}>
                        {item.SSID}
                      </Text>
                      {item.level != null && (
                        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                          Sinal: {Math.max(-100, Math.min(-20, item.level!)) + 100}%
                        </Text>
                      )}
                    </View>
                    {isKnown && (
                      <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50 }}>
                        <Text style={{ fontSize: 11, color: "#FFF", fontWeight: "600" }}>RECOMENDADO</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={{ alignItems: "center", paddingVertical: 8, marginBottom: 8 }}
              onPress={() => setShowManual(true)}
            >
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500" }}>
                Conexão manual
              </Text>
            </TouchableOpacity>
          </>
        )}

        {scanning && (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, fontSize: 14, color: colors.textTertiary }}>
              Procurando redes...
            </Text>
          </View>
        )}

        {(!isIOS || showManual) && !scanning && (
          <View style={{ marginTop: isIOS ? 0 : 8 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 10 }}>
              {isIOS ? "Conectar manualmente" : "Ou conecte manualmente"}
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "500", color: colors.textTertiary, marginBottom: 4 }}>SSID (nome da rede)</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
                <FontAwesome name="wifi" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }}
                  placeholder='Kujikisa-Setup'
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  value={manualSSID}
                  onChangeText={setManualSSID}
                  editable={!connecting}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "500", color: colors.textTertiary, marginBottom: 4 }}>Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderRadius: radius.button, borderWidth: 1, borderColor: inputBorder, backgroundColor: inputBg, paddingHorizontal: 12 }}>
                <FontAwesome name="lock" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 }}
                  placeholder='kujikisa123'
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  value={manualPassword}
                  onChangeText={setManualPassword}
                  editable={!connecting}
                />
              </View>
              <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                Password padrão do Kujikisa: kujikisa123
              </Text>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: connecting ? colors.primaryTransparent : colors.primary,
                paddingVertical: 14,
                borderRadius: radius.button,
                marginBottom: 12,
              }}
              onPress={handleManualConnect}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <FontAwesome name="plug" size={16} color="#FFF" />
                  <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600" }}>Conectar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!isIOS && (
          <TouchableOpacity
            style={{ alignItems: "center", paddingVertical: 4 }}
            onPress={scanNetworks}
            disabled={scanning}
          >
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500" }}>
              {scanning ? "A procurar..." : "Procurar redes novamente"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ marginTop: "auto", paddingBottom: 20, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: "center" }}>
            Já ligado ao dispensador? Clique em "Verificar conexão".
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: colors.primary,
              paddingVertical: 12,
              borderRadius: radius.button,
              width: "100%",
              maxWidth: 320,
            }}
            onPress={handleVerifyOnly}
            disabled={connecting}
          >
            <FontAwesome name="search" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
              Verificar conexão
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}