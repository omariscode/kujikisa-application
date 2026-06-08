import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";
import { getEvents } from "@/src/services/events";
import { getPrescriptions } from "@/src/services/prescriptions";
import type { MedicationEvent, Prescription } from "@/src/types";

function PrescriptionCard({ prescription, colors, backgrounds, borders, shadows, radius }: { prescription: Prescription; colors: any; backgrounds: any; borders: any; shadows: any; radius: any }) {
  const isActive = prescription.is_active;
  return (
    <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, gap: 10, borderWidth: 1, borderColor: isActive ? colors.primary : borders.card, ...shadows.card }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>Prescrição #{prescription.id}</Text>
        <View style={{ backgroundColor: isActive ? colors.successBg : colors.border, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: isActive ? colors.success : colors.textTertiary }}>{isActive ? "Ativa" : "Concluída"}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>Início: {prescription.start_date}</Text>
        {prescription.end_date && <Text style={{ fontSize: 12, color: colors.textTertiary }}>Fim: {prescription.end_date}</Text>}
      </View>
      {prescription.items.map((item) => (
        <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary }}>{item.slot_number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>{item.dose_quantity} · {item.scheduled_time}</Text>
          </View>
        </View>
      ))}
      {prescription.notes ? <Text style={{ fontSize: 12, color: colors.textTertiary, fontStyle: "italic" }}>{prescription.notes}</Text> : null}
    </View>
  );
}

interface HistoryGroup {
  label: string;
  events: MedicationEvent[];
}

function HistoryCard({ event, colors, backgrounds, borders, shadows, radius }: { event: MedicationEvent; colors: any; backgrounds: any; borders: any; shadows: any; radius: any }) {
  const isTaken = event.status === "taken" || event.status === "confirmed_app";
  const time = event.occurred_at?.split("T")[1]?.slice(0, 5) || "--:--";
  const date = event.occurred_at?.split("T")[0] || "";
  return (
    <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 14, flexDirection: "row", alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: borders.card, ...shadows.cardSm }}>
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: isTaken ? colors.successBg : colors.error }} />
      <View style={{ width: 52, paddingLeft: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>{time}</Text>
        <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{date}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 8, gap: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>Slot {event.slot_number}</Text>
        <Text style={{ fontSize: 12, color: isTaken ? colors.textTertiary : colors.error, fontWeight: isTaken ? "400" : "500" }}>
          {event.status === "taken" || event.status === "confirmed_app" ? "Tomado" : event.status === "missed" ? "Perdido" : event.status === "manual" ? "Manual" : "Pendente"}
        </Text>
      </View>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isTaken ? colors.successBg : colors.errorBg, alignItems: "center", justifyContent: "center", marginLeft: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: isTaken ? colors.success : colors.error }}>{isTaken ? "✓" : "✕"}</Text>
      </View>
    </View>
  );
}

function groupEvents(events: MedicationEvent[]): HistoryGroup[] {
  const groups: Record<string, MedicationEvent[]> = {};
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  for (const event of events) {
    const date = event.occurred_at?.split("T")[0] || "unknown";
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, evts]) => {
      let label = date;
      if (date === today) label = "Hoje";
      else if (date === yesterday) label = "Ontem";
      else {
        const d = new Date(date + "T12:00:00");
        label = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" });
      }
      return { label, events: evts };
    });
}

export default function HistoryScreen() {
  const { colors, backgrounds, borders, shadows, radius } = useAppTheme();
  const [events, setEvents] = useState<MedicationEvent[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [eventsRes, prescRes] = await Promise.all([getEvents(), getPrescriptions()]);
      if (eventsRes.results) setEvents(eventsRes.results);
      if (prescRes.results) setPrescriptions(prescRes.results);
    } catch {} finally {
      setLoading(false);
    }
  }

  const groups = useMemo(() => groupEvents(events), [events]);
  const pastPrescriptions = useMemo(() => prescriptions.filter((p) => !p.is_active), [prescriptions]);

  const s = useMemo(() => ({
    scroll: { backgroundColor: backgrounds.screen },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120, gap: 24 },
  }), [backgrounds.screen]);

  const theme = { colors, backgrounds, borders, shadows, radius };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.textPrimary }}>Histórico</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Prescrições anteriores e registos de medicação.</Text>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {pastPrescriptions.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>Prescrições Anteriores</Text>
              {pastPrescriptions.map((pres) => (
                <PrescriptionCard key={pres.id} prescription={pres} {...theme} />
              ))}
            </View>
          )}

          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>Registo de Medicação</Text>
            {groups.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: colors.textTertiary }}>Nenhum evento encontrado.</Text>
              </View>
            ) : (
              groups.map((group) => (
                <View key={group.label} style={{ gap: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: -20 }}>{group.label}</Text>
                  <View style={{ gap: 12 }}>
                    {group.events.map((event) => (
                      <HistoryCard key={event.id} event={event} {...theme} />
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}