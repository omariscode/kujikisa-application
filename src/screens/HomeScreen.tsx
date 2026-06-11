import { isIOS, RADIUS } from "@/src/theme/platform";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";
import { usePrescriptions, useEvents, useDeviceStatus, useConfirmEvent, useManualDispense } from "@/src/hooks/useApi";
import { useMedicationAlarm } from "@/src/hooks/useMedicationAlarm";
import { router, useFocusEffect } from "expo-router";

type MedicationStatus = "taken" | "pending" | "upcoming";

interface Medication {
  id: string;
  name: string;
  dose: string;
  time: string;
  status: MedicationStatus;
  eventId?: number;
  slotNumber: number;
}

function isTimeAvailable(scheduledTime: string): boolean {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return now >= scheduled;
}

function MedicationCard({
  medication,
  onConfirm,
  confirmingId,
  colors,
  backgrounds,
  borders,
  shadows,
  radius,
}: {
  medication: Medication;
  onConfirm: (id: string) => void;
  confirmingId: string | null;
  colors: any;
  backgrounds: any;
  borders: any;
  shadows: any;
  radius: typeof RADIUS;
}) {
  const isTaken = medication.status === "taken";
  const isPending = medication.status === "pending";
  const isLoading = confirmingId === medication.id;
  const timeAvailable = isTimeAvailable(medication.time);
  const buttonDisabled = !timeAvailable || isLoading;

  const accentColor = isTaken ? colors.success : timeAvailable ? colors.primary : colors.textTertiary;
  const iconBg = isTaken ? colors.successBg : timeAvailable ? colors.primaryGlass : colors.border;
  const iconName = isTaken ? "check-circle" : timeAvailable ? "clock-o" : "lock";
  const iconColor = isTaken ? colors.success : timeAvailable ? colors.primary : colors.textSecondary;

  return (
    <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden", borderWidth: 1, borderColor: timeAvailable && !isTaken ? colors.primary : borders.card, ...shadows.card, ...(timeAvailable && !isTaken && isIOS ? { shadowColor: colors.primary, shadowOpacity: 0.1 } : {}) }}>
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, borderTopLeftRadius: radius.card, borderBottomLeftRadius: radius.card, backgroundColor: accentColor }} />
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginLeft: 8, backgroundColor: iconBg }}>
        <FontAwesome name={iconName} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary, opacity: isTaken ? 0.5 : 1 }}>{medication.name}</Text>
          <Text style={{ fontSize: 12, color: timeAvailable && !isTaken ? colors.primary : colors.textSecondary, ...(timeAvailable && !isTaken ? { fontWeight: "700", backgroundColor: colors.primaryGlass, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 } : {}), ...(isTaken ? { textDecorationLine: "line-through", opacity: 0.5 } : {}) }}>{medication.time}</Text>
        </View>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{medication.dose}</Text>
      </View>
      {!isTaken && (
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isLoading ? colors.primaryTransparent : buttonDisabled ? colors.primaryTransparent : colors.primary, alignItems: "center", justifyContent: "center", opacity: buttonDisabled ? 0.4 : 1, ...(isIOS && !buttonDisabled ? { shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 } : { elevation: buttonDisabled ? 0 : 3 }) }}
          onPress={() => onConfirm(medication.id)}
          disabled={buttonDisabled}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <FontAwesome name={timeAvailable ? "check" : "lock"} size={16} color={buttonDisabled ? colors.textSecondary : "#FFFFFF"} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { colors, backgrounds, borders, shadows, radius } = useAppTheme();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data: deviceStatus, isLoading: statusLoading, refetch: refetchStatus } = useDeviceStatus();
  const { data: eventsRes, isLoading: eventsLoading, refetch: refetchEvents } = useEvents();
  const { data: prescRes, isLoading: prescLoading, refetch: refetchPrescriptions } = usePrescriptions();
  const confirmMutation = useConfirmEvent();
  const dispenseMutation = useManualDispense();

  useFocusEffect(
    useCallback(() => {
      refetchStatus();
      refetchEvents();
      refetchPrescriptions();
    }, [refetchStatus, refetchEvents, refetchPrescriptions]),
  );

  const loading = statusLoading || eventsLoading || prescLoading;
  const prescriptions = prescRes?.results ?? [];
  const activePrescription = prescriptions.find((p) => p.is_active);

  const todayMeds = useMemo(() => {
    if (!activePrescription) return [];
    const allEvents = eventsRes?.results ?? [];
    const today = new Date().toISOString().split("T")[0];
    const todayEvents = allEvents.filter((e) => e.occurred_at?.startsWith(today));

    const result: Medication[] = [];

    for (const item of activePrescription.items) {
      const todayEvent = todayEvents.find(
        (e) => e.slot_number === item.slot_number && e.prescription_item_id === item.id,
      );

      if (todayEvent) {
        if (todayEvent.status === "taken" || todayEvent.status === "confirmed_app") continue;
        result.push({
          id: String(todayEvent.id),
          name: item.name,
          dose: item.dose_quantity || "",
          time: item.scheduled_time,
          status: "pending",
          eventId: todayEvent.id,
          slotNumber: item.slot_number,
        });
      } else {
        result.push({
          id: `item-${item.id || item.slot_number}`,
          name: item.name,
          dose: item.dose_quantity || "",
          time: item.scheduled_time,
          status: "upcoming",
          slotNumber: item.slot_number,
        });
      }
    }

    return result.sort((a, b) => a.time.localeCompare(b.time));
  }, [activePrescription, eventsRes]);

  const takenCount = useMemo(() => {
    if (!activePrescription) return 0;
    const allEvents = eventsRes?.results ?? [];
    const today = new Date().toISOString().split("T")[0];
    return allEvents.filter(
      (e) => e.occurred_at?.startsWith(today) && (e.status === "taken" || e.status === "confirmed_app"),
    ).length;
  }, [activePrescription, eventsRes]);

  const totalTodayItems = activePrescription?.items.length ?? 0;

  const handleConfirm = async (id: string) => {
    const med = todayMeds.find((m) => m.id === id);
    if (!med) return;
    setConfirmingId(id);
    try {
      if (med.eventId) {
        await confirmMutation.mutateAsync({ id: med.eventId, data: { status: "taken" } });
      } else {
        await dispenseMutation.mutateAsync(med.slotNumber);
      }
      refetchEvents();
    } catch {}
    setConfirmingId(null);
  };

  useMedicationAlarm(
    todayMeds.map((m) => ({ name: m.name, scheduledTime: m.time })),
  );

  const today = new Date().toLocaleDateString("pt-AO", { weekday: "short", day: "2-digit", month: "short" });

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
                {takenCount} de {totalTodayItems} medicamentos tomados hoje
              </Text>
              <View style={{ height: 8, backgroundColor: borders.subtle, borderRadius: 50, overflow: "hidden" }}>
                <View style={{ height: "100%", backgroundColor: colors.primary, borderRadius: 50, width: totalTodayItems > 0 ? `${(takenCount / totalTodayItems) * 100}%` : "0%" }} />
              </View>
            </View>

            {activePrescription ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/(app)/prescription-detail?id=${activePrescription.id}`)}
                style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, borderWidth: 1, borderColor: colors.primary, ...shadows.card }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>{activePrescription.name || `Prescrição #${activePrescription.id}`}</Text>
                  <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.success }}>Ativa</Text>
                  </View>
                </View>
                {activePrescription.start_date && (
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <Text style={{ fontSize: 12, color: colors.textTertiary }}>Início: {activePrescription.start_date}</Text>
                    {activePrescription.end_date && <Text style={{ fontSize: 12, color: colors.textTertiary }}>Fim: {activePrescription.end_date}</Text>}
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
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>{totalTodayItems}</Text>
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
              {todayMeds.length === 0 ? (
                <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 24, alignItems: "center", gap: 8, borderWidth: 1, borderColor: borders.card }}>
                  <FontAwesome name="calendar-check-o" size={32} color={colors.textTertiary} />
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Todos os medicamentos de hoje foram tomados</Text>
                </View>
              ) : (
                todayMeds.map((med) => (
                  <MedicationCard key={med.id} medication={med} onConfirm={handleConfirm} confirmingId={confirmingId} colors={colors} backgrounds={backgrounds} borders={borders} shadows={shadows} radius={radius} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
