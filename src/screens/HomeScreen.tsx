import { isIOS, RADIUS } from "@/src/theme/platform";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";
import { getStatus } from "@/src/services/auth";
import { getEvents, confirmEvent } from "@/src/services/events";
import { getPrescriptions } from "@/src/services/prescriptions";
import type { DeviceStatus, MedicationEvent, Prescription } from "@/src/types";
import { getApiError } from "@/src/services/client";
import { router } from "expo-router";

type MedicationStatus = "taken" | "pending" | "upcoming";

interface Medication {
  id: string;
  name: string;
  dose: string;
  time: string;
  status: MedicationStatus;
  eventId?: number;
}

function MedicationCard({
  medication,
  onConfirm,
  colors,
  backgrounds,
  borders,
  shadows,
  radius,
}: {
  medication: Medication;
  onConfirm: (id: string) => void;
  colors: any;
  backgrounds: any;
  borders: any;
  shadows: any;
  radius: typeof RADIUS;
}) {
  const isTaken = medication.status === "taken";
  const isPending = medication.status === "pending";
  const accentColor = isTaken ? colors.success : isPending ? colors.primary : colors.textTertiary;
  const iconBg = isTaken ? colors.successBg : isPending ? colors.primaryGlass : colors.border;
  const iconName = isTaken ? "check-circle" : "clock-o";
  const iconColor = isTaken ? colors.success : isPending ? colors.primary : colors.textSecondary;

  return (
    <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden", borderWidth: 1, borderColor: isPending ? colors.primary : borders.card, ...shadows.card, ...(isPending && isIOS ? { shadowColor: colors.primary, shadowOpacity: 0.1 } : {}) }}>
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, borderTopLeftRadius: radius.card, borderBottomLeftRadius: radius.card, backgroundColor: accentColor }} />
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginLeft: 8, backgroundColor: iconBg }}>
        <FontAwesome name={iconName} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary, opacity: isTaken ? 0.5 : 1 }}>{medication.name}</Text>
          <Text style={{ fontSize: 12, color: isPending ? colors.primary : colors.textSecondary, ...(isPending ? { fontWeight: "700", backgroundColor: colors.primaryGlass, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 } : {}), ...(isTaken ? { textDecorationLine: "line-through", opacity: 0.5 } : {}) }}>{medication.time}</Text>
        </View>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{medication.dose}</Text>
      </View>
      {isPending && medication.eventId && (
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...(isIOS ? { shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 } : { elevation: 3 }) }}
          onPress={() => onConfirm(medication.id)}
          activeOpacity={0.8}
        >
          <FontAwesome name="check" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { colors, backgrounds, borders, shadows, radius } = useAppTheme();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [status, eventsRes, prescRes] = await Promise.all([
        getStatus(),
        getEvents(),
        getPrescriptions(),
      ]);
      setDeviceStatus(status);

      if (prescRes.results) {
        setPrescriptions(prescRes.results);
      }

      if (eventsRes.results) {
        const today = new Date().toISOString().split("T")[0];
        const todayEvents = eventsRes.results.filter((e) => e.occurred_at?.startsWith(today));

        const medList: Medication[] = todayEvents.map((e: MedicationEvent) => {
          const item = prescRes.results
            ?.flatMap((p) => p.items)
            .find((i) => i.id === e.prescription_item_id);
          return {
            id: String(e.id),
            name: item?.name || `Slot ${e.slot_number}`,
            dose: item?.dose_quantity || "",
            time: e.occurred_at?.split("T")[1]?.slice(0, 5) || "",
            status: e.status === "taken" || e.status === "confirmed_app" ? "taken" : "pending",
            eventId: e.id,
          };
        });
        setMeds(medList);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirm = async (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med?.eventId) return;
    setConfirmingId(id);
    try {
      await confirmEvent(med.eventId, { status: "taken" });
      setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, status: "taken" as MedicationStatus } : m)));
    } catch {}
    setConfirmingId(null);
  };

  const activePrescription = useMemo(() => prescriptions.find((p) => p.is_active), [prescriptions]);

  const today = new Date().toLocaleDateString("pt-AO", { weekday: "short", day: "2-digit", month: "short" });
  const takenCount = meds.filter((m) => m.status === "taken").length;
  const totalPrescriptionItems = prescriptions.flatMap((p) => p.items).length;

  const waterLevel = deviceStatus?.water_level_pct ?? 0;
  const batteryLevel = deviceStatus?.battery_level_pct ?? 0;
  const isConnected = !!deviceStatus;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <StatusBar />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isConnected ? colors.successBg : colors.errorBg, alignItems: "center", justifyContent: "center" }}>
                  <FontAwesome name="wifi" size={22} color={isConnected ? colors.success : colors.error} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Kujikisa Dispenser</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isConnected ? colors.success : colors.error }} />
                    <Text style={{ fontSize: 13, color: isConnected ? colors.success : colors.error, fontWeight: "500" }}>
                      {isConnected ? "Conectado" : "Desconectado"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome name={batteryLevel > 50 ? "battery-3" : batteryLevel > 20 ? "battery-2" : "battery-1"} size={16} color={colors.textPrimary} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}> {batteryLevel}%</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Bateria</Text>
              </View>
            </View>

            <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 10, fontWeight: "500" }}>
                {takenCount} de {meds.length} medicamentos tomados hoje
              </Text>
              <View style={{ height: 8, backgroundColor: borders.subtle, borderRadius: 50, overflow: "hidden" }}>
                <View style={{ height: "100%", backgroundColor: colors.primary, borderRadius: 50, width: meds.length > 0 ? `${(takenCount / meds.length) * 100}%` : "0%" }} />
              </View>
            </View>

            {activePrescription ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(app)/(tabs)/history")}
                style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, borderWidth: 1, borderColor: colors.primary, ...shadows.card }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>Prescrição Ativa</Text>
                  <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.success }}>Ativa</Text>
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  {activePrescription.items.map((item) => (
                    <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>{item.slot_number}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{item.dose_quantity} · {item.scheduled_time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                {activePrescription.start_date && (
                  <View style={{ flexDirection: "row", gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: borders.subtle }}>
                    <Text style={{ fontSize: 11, color: colors.textTertiary }}>Início: {activePrescription.start_date}</Text>
                    {activePrescription.end_date && <Text style={{ fontSize: 11, color: colors.textTertiary }}>Fim: {activePrescription.end_date}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 14, borderWidth: 1, borderColor: borders.card, ...shadows.cardSm }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 12 }}>Dispensador</Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
                      <FontAwesome name="plus-square" size={16} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>{totalPrescriptionItems}</Text>
                    <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: "500", textAlign: "center" }}>Medicamentos</Text>
                  </View>
                  <View style={{ width: 1, height: 32, backgroundColor: borders.subtle, alignSelf: "center" }} />
                  <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.successBg, alignItems: "center", justifyContent: "center" }}>
                      <FontAwesome name="tint" size={16} color={colors.success} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>{waterLevel}%</Text>
                    <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: "500", textAlign: "center" }}>Água</Text>
                  </View>
                  <View style={{ width: 1, height: 32, backgroundColor: borders.subtle, alignSelf: "center" }} />
                  <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
                      <FontAwesome name="wifi" size={16} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>{isConnected ? "ON" : "OFF"}</Text>
                    <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: "500", textAlign: "center" }}>Dispensador</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
                <Text style={{ fontSize: 20, fontWeight: "600", color: colors.textPrimary }}>Agenda de Hoje</Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: colors.primary }}>{today}</Text>
              </View>
              {meds.length === 0 ? (
                <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 24, alignItems: "center", gap: 8, borderWidth: 1, borderColor: borders.card }}>
                  <FontAwesome name="calendar" size={32} color={colors.textTertiary} />
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Nenhum evento de medicação hoje</Text>
                </View>
              ) : (
                meds.map((med) => (
                  <MedicationCard key={med.id} medication={med} onConfirm={handleConfirm} colors={colors} backgrounds={backgrounds} borders={borders} shadows={shadows} radius={radius} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
