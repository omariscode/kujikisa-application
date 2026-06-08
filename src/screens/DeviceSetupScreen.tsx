import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS, RADIUS } from "@/src/theme/platform";
import { getHealth, syncTime } from "@/src/services/auth";
import { getApiError } from "@/src/services/client";

export default function DeviceSetupScreen() {
  const { colors, isDark } = useAppTheme();
  const [step, setStep] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<{ serial_number: string; firmware_version: string } | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineTop = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const handleScan = async () => {
    setLoading(true);
    setError("");
    try {
      const health = await getHealth();
      setDeviceInfo({ serial_number: health.serial_number, firmware_version: health.firmware_version });
      setScanned(true);
      await syncTime();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setStep(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1A1C1C" }}>
      <View style={{ height: 64, backgroundColor: isDark ? "rgba(0,0,0,0.8)" : (isIOS ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.95)"), alignItems: "center", justifyContent: "center", ...(isIOS ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 } : { elevation: 2 }) }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.primary }}>Kujikisa</Text>
      </View>

      <View style={{ flex: 1, backgroundColor: "#1A1C1C" }}>
        <View style={{ flex: 1, backgroundColor: "rgba(26, 28, 28, 0.85)", flexDirection: "column" }}>
          <View style={{ height: 20 }} />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 20 }}>
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 20, fontWeight: "600", color: "#FFFFFF" }}>Configurar Dispositivo</Text>
              <Text style={{ fontSize: 14, color: "#BFC7D2", textAlign: "center" }}>Posicione o QR Code dentro da moldura</Text>
            </View>

            <View style={{ width: 240, height: 240, position: "relative", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <View style={{ position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#006096", borderTopLeftRadius: 4 }} />
              <View style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: "#006096", borderTopRightRadius: 4 }} />
              <View style={{ position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: "#006096", borderBottomLeftRadius: 4 }} />
              <View style={{ position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#006096", borderBottomRightRadius: 4 }} />

              {!scanned && (
                <Animated.View style={{ position: "absolute", left: 0, right: 0, height: 2, backgroundColor: "#98F994", shadowColor: "#98F994", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4, zIndex: 20, top: scanLineTop }} />
              )}

              {loading ? (
                <ActivityIndicator size="large" color="#98F994" />
              ) : !scanned ? (
                <View style={{ alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                  <Text style={{ fontSize: 64, color: "#FFFFFF" }}>▦</Text>
                </View>
              ) : (
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 48 }}>✅</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#98F994", textAlign: "center" }}>Dispositivo encontrado!</Text>
                  {deviceInfo && (
                    <Text style={{ fontSize: 11, color: "#BFC7D2", textAlign: "center" }}>
                      {deviceInfo.serial_number} · {deviceInfo.firmware_version}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {error ? (
              <View style={{ backgroundColor: "rgba(186,26,26,0.2)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#BA1A1A" }}>
                <Text style={{ fontSize: 13, color: "#EF5350", fontWeight: "500", textAlign: "center" }}>{error}</Text>
              </View>
            ) : null}

            {!scanned && (
              <TouchableOpacity
                style={{ backgroundColor: loading ? "rgba(0, 96, 150, 0.4)" : "rgba(0, 96, 150, 0.7)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50, borderWidth: 1, borderColor: "#006096" }}
                onPress={handleScan}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>
                  {loading ? "A conectar..." : "📷 Procurar dispositivo"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ backgroundColor: isDark ? "rgba(30,30,35,0.95)" : (isIOS ? "rgba(255,255,255,0.8)" : "#FFFFFF"), borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 32, gap: 16, ...(isIOS ? { shadowColor: "#000", shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24 } : { elevation: 10 }) }}>
            <View style={{ width: 48, height: 4, backgroundColor: isDark ? "rgba(255,255,255,0.2)" : (isIOS ? "rgba(60,60,67,0.15)" : "#E2E2E2"), borderRadius: 50, alignSelf: "center", marginBottom: 8 }} />

            <View style={{ gap: 10 }}>
              {[
                { num: 1, text: "Ligue o seu dispositivo Kujikisa.", active: false },
                { num: 2, text: "Conecte-se ao WiFi Kujikisa-Setup.", active: !scanned },
                { num: 3, text: "Escaneie o QR Code para conectar.", active: true },
              ].map((s) => (
                <View key={s.num} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: s.active ? (isIOS ? "rgba(255,255,255,0.6)" : "#F9F9F9") : (isIOS ? "rgba(255,255,255,0.5)" : "#F9F9F9"), borderColor: s.active ? "rgba(0, 96, 150, 0.3)" : (isIOS ? "rgba(60,60,67,0.12)" : "#E2E2E2"), ...(s.active && isIOS ? { shadowColor: "#006096", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 } : {}), ...(s.active && !isIOS ? { elevation: 2 } : {}) }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: s.active ? "#006096" : "#CEE5FF", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: s.active ? "#FFFFFF" : "#004A75" }}>{s.num}</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: isDark ? "#E0E0E0" : "#1A1C1C", lineHeight: 20, flex: 1, paddingTop: 6 }}>{s.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={{ width: "100%", paddingVertical: 14, borderRadius: RADIUS.cardSm, borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.2)" : (isIOS ? "rgba(60,60,67,0.2)" : "#BFC7D2"), alignItems: "center", justifyContent: "center" }}
              onPress={handleCancel}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#E0E0E0" : "#1A1C1C" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
