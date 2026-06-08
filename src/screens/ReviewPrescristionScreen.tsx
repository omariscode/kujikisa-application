import React, { useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";
import { useLocalSearchParams, router } from "expo-router";
import { createPrescription } from "@/src/services/prescriptions";
import { getApiError } from "@/src/services/client";
import type { CreatePrescriptionRequest } from "@/src/types";

const Frequencies = [
  { label: "1x ao dia", value: 1 },
  { label: "2x ao dia", value: 2 },
  { label: "3x ao dia", value: 3 },
  { label: "4x ao dia", value: 4 },
];

function generateTimes(frequency: number): string[] {
  const base = [8, 12, 16, 20];
  return base.slice(0, frequency).map((h) => `${String(h).padStart(2, "0")}:00`);
}

export default function ReviewPrescriptionScreen() {
  const { colors, backgrounds, borders, shadows, radius, isDark } = useAppTheme();
  const params = useLocalSearchParams<{ data?: string }>();

  let initialData: CreatePrescriptionRequest | null = null;
  try {
    if (params.data) initialData = JSON.parse(params.data);
  } catch {}

  const [medName, setMedName] = useState(initialData?.items?.[0]?.name || "Amoxicilina");
  const [dosage, setDosage] = useState(initialData?.items?.[0]?.dose_quantity || "500mg");
  const [frequency, setFrequency] = useState(initialData?.items?.length || 2);
  const [times, setTimes] = useState<string[]>(initialData?.items?.map((i) => i.scheduled_time) || ["08:00", "20:00"]);
  const [duration, setDuration] = useState("7");
  const [selectedSlot, setSelectedSlot] = useState(initialData?.items?.[0]?.slot_number || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFrequencyChange = (value: number) => {
    setFrequency(value);
    setTimes(generateTimes(value));
  };

  const handleTimeChange = (index: number, delta: number) => {
    const newTimes = [...times];
    const [h, m] = newTimes[index].split(":").map(Number);
    newTimes[index] = `${String((h + delta + 24) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setTimes(newTimes);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + parseInt(duration) * 86400000).toISOString().split("T")[0];
      const payload: CreatePrescriptionRequest = {
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        notes: `Duração: ${duration} dias`,
        items: times.map((t) => ({
          name: medName,
          dose_quantity: dosage,
          scheduled_time: t,
          slot_number: selectedSlot,
        })),
      };
      await createPrescription(payload);
      router.back();
      router.back();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = isIOS ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.15)") : "rgba(0,94,164,0.2)";
  const timeBg = isIOS ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(60,60,67,0.06)") : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,94,164,0.04)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Confira os dados extraídos da receita.</Text>

        <View style={{ backgroundColor: "#FEF08A", borderRadius: radius.input, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderColor: "#FCD34D" }}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <Text style={{ flex: 1, fontSize: 14, color: "#713F12", lineHeight: 20 }}>Verifique se os dados estão corretos antes de salvar.</Text>
        </View>

        {error ? (
          <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, borderWidth: 1, borderColor: colors.error }}>
            <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, gap: 16, borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Nome do medicamento</Text>
            <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 14, color: colors.textPrimary }} value={medName} onChangeText={setMedName} autoCapitalize="words" />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Dosagem</Text>
            <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 14, color: colors.textPrimary }} value={dosage} onChangeText={setDosage} placeholder="ex: 500mg" placeholderTextColor={colors.textTertiary} />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Frequência</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {Frequencies.map((f) => (
                <TouchableOpacity key={f.value} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1, borderColor: frequency === f.value ? colors.primary : inputBorder, backgroundColor: frequency === f.value ? colors.primary : backgrounds.elevated }} onPress={() => handleFrequencyChange(f.value)} activeOpacity={0.7}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: frequency === f.value ? "#FFFFFF" : colors.textSecondary }}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Horários</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {times.map((time, index) => (
                <View key={index} style={{ alignItems: "center", backgroundColor: timeBg, borderRadius: radius.input, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: inputBorder, gap: 2 }}>
                  <TouchableOpacity onPress={() => handleTimeChange(index, 1)} style={{ padding: 2 }}>
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "700" }}>▲</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>{time}</Text>
                  <TouchableOpacity onPress={() => handleTimeChange(index, -1)} style={{ padding: 2 }}>
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "700" }}>▼</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Duração do tratamento (dias)</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.primaryTransparent }} onPress={() => setDuration((prev) => String(Math.max(1, parseInt(prev) - 1)))}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary, lineHeight: 26 }}>−</Text>
              </TouchableOpacity>
              <TextInput style={{ flex: 1, height: 48, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 20, fontWeight: "700", color: colors.textPrimary, textAlign: "center" }} value={duration} onChangeText={(v) => setDuration(v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" textAlign="center" />
              <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.primaryTransparent }} onPress={() => setDuration((prev) => String(parseInt(prev) + 1))}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary, lineHeight: 26 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 6, paddingTop: 16, borderTopWidth: 1, borderTopColor: borders.subtle }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Slot do Dispenser</Text>
            <View style={{ gap: 8 }}>
              {[0, 4].map((rowOffset) => (
                <View key={rowOffset} style={{ flexDirection: "row", gap: 10 }}>
                  {[1, 2, 3, 4].map((col) => {
                    const slot = rowOffset + col;
                    return (
                      <TouchableOpacity key={slot} style={{ flex: 1, height: 56, borderRadius: radius.input, borderWidth: selectedSlot === slot ? 2 : 1, borderColor: selectedSlot === slot ? colors.primary : inputBorder, backgroundColor: selectedSlot === slot ? colors.primaryGlass : backgrounds.elevated, alignItems: "center", justifyContent: "center" }} onPress={() => setSelectedSlot(slot)} activeOpacity={0.7}>
                        <Text style={{ fontSize: 18, fontWeight: selectedSlot === slot ? "700" : "600", color: selectedSlot === slot ? colors.primary : colors.textSecondary }}>{slot}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.OS === "ios" ? 28 : 16, backgroundColor: backgrounds.header, borderTopWidth: 1, borderTopColor: borders.subtle, ...(isIOS ? { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 } : { elevation: 10 }) }}>
        <TouchableOpacity style={{ width: "100%", backgroundColor: loading ? colors.primaryTransparent : colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", ...(loading ? {} : shadows.button) }} onPress={handleSave} activeOpacity={0.85} disabled={loading}>
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>  Salvando...</Text>
            </View>
          ) : (
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>💾  Salvar Receita</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
