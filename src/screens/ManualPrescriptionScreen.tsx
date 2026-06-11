import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";
import { usePrescriptions, useCreatePrescription } from "@/src/hooks/useApi";
import { getApiError } from "@/src/services/client";
import type { CreatePrescriptionRequest } from "@/src/types";

const Frequencies = ["1x ao dia", "2x ao dia", "3x ao dia"];

const FreqTimes: Record<string, string[]> = {
  "1x ao dia": ["08:00"],
  "2x ao dia": ["08:00", "20:00"],
  "3x ao dia": ["08:00", "13:00", "18:00"],
};

interface MedicationItem {
  id: string;
  name: string;
  frequency: string;
  times: string[];
  slot: number | null;
  notes: string;
  doseQuantity: string;
}

const createEmptyMedication = (): MedicationItem => ({
  id: Date.now().toString() + Math.random(),
  name: "",
  frequency: "1x ao dia",
  times: ["08:00"],
  slot: null,
  notes: "",
  doseQuantity: "1 comprimido",
});

const TabBarPadding = isIOS ? 120 : 100;

function TimePicker({ value, onChange, colors, backgrounds, borders, radius, inputBorder }: {
  value: string;
  onChange: (v: string) => void;
  colors: any;
  backgrounds: any;
  borders: any;
  radius: any;
  inputBorder: string;
}) {
  const [h, m] = value.split(":").map(Number);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: backgrounds.elevated, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, paddingVertical: 8, paddingHorizontal: 14 }}>
      <View style={{ alignItems: "center", gap: 4 }}>
        <TouchableOpacity onPress={() => onChange(`${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`)} style={{ padding: 4 }}>
          <Ionicons name="chevron-up" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textPrimary, minWidth: 36, textAlign: "center" }}>{String(h).padStart(2, "0")}</Text>
        <TouchableOpacity onPress={() => onChange(`${String((h - 1 + 24) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`)} style={{ padding: 4 }}>
          <Ionicons name="chevron-down" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textTertiary, marginHorizontal: 4 }}>:</Text>
      <View style={{ alignItems: "center", gap: 4 }}>
        <TouchableOpacity onPress={() => onChange(`${String(h).padStart(2, "0")}:${String((m + 1) % 60).padStart(2, "0")}`)} style={{ padding: 4 }}>
          <Ionicons name="chevron-up" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textPrimary, minWidth: 36, textAlign: "center" }}>{String(m).padStart(2, "0")}</Text>
        <TouchableOpacity onPress={() => onChange(`${String(h).padStart(2, "0")}:${String((m - 1 + 60) % 60).padStart(2, "0")}`)} style={{ padding: 4 }}>
          <Ionicons name="chevron-down" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ManualPrescriptionScreen() {
  const { colors, backgrounds, borders, shadows, radius, isDark } = useAppTheme();
  const [medications, setMedications] = useState<MedicationItem[]>([createEmptyMedication()]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [openFreqIndex, setOpenFreqIndex] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const [prescriptionName, setPrescriptionName] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);
  const { data: prescRes, isLoading: prescLoading } = usePrescriptions();
  const activePrescription = (prescRes?.results ?? []).find((p) => p.is_active) ?? null;
  const loadingActiveCheck = prescLoading;
  const createMutation = useCreatePrescription();

  const updateMedication = (index: number, field: keyof MedicationItem, value: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "frequency") {
      updated[index].times = FreqTimes[value] || ["08:00"];
    }
    setMedications(updated);
  };

  const addMedication = () => {
    if (medications.length < 3) setMedications([...medications, createEmptyMedication()]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) setMedications(medications.filter((_, i) => i !== index));
  };

  const updateTime = (medIndex: number, timeIndex: number, newValue: string) => {
    const updated = [...medications];
    updated[medIndex].times[timeIndex] = newValue;
    setMedications(updated);
  };

  const datesValid = startDate && endDate && endDate >= startDate;
  const canSave = !activePrescription && datesValid && medications.every((med) => med.name.trim() !== "" && med.slot !== null);

  const handleSave = async () => {
    if (!canSave) return;
    const allNotes = medications.map((m) => m.notes).filter(Boolean).join(" | ");

    const payload: CreatePrescriptionRequest = {
      name: prescriptionName.trim() || undefined,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
      notes: allNotes || undefined,
      items: medications.flatMap((med) =>
        med.times.map((time) => ({
          name: med.name,
          dose_quantity: med.doseQuantity || "1 comprimido",
          scheduled_time: time,
          slot_number: med.slot!,
        })),
      ),
    };

    setLoadingSave(true);
    setSaveError("");
    try {
      await createMutation.mutateAsync(payload);
      router.back();
    } catch (err) {
      setSaveError(getApiError(err));
    } finally {
      setLoadingSave(false);
    }
  };

  const occupiedSlots = medications
    .map((m) => m.slot)
    .filter((s): s is number => s !== null);

  const inputBorder = isIOS ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.15)") : "rgba(0,94,164,0.2)";

  const renderMedicationCard = (med: MedicationItem, idx: number) => {
    const isFreqOpen = openFreqIndex === idx;
    return (
      <View key={med.id} style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, gap: 16, borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: borders.subtle, paddingBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>Medicamento {idx + 1}</Text>
          {medications.length > 1 && (
            <TouchableOpacity onPress={() => removeMedication(idx)} style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, backgroundColor: colors.errorBg, flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="trash" size={14} color={colors.error} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.error }}> Remover</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Nome do medicamento</Text>
          <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 16, color: colors.textPrimary }} placeholder="Ex: Losartana" placeholderTextColor={colors.textMuted} value={med.name} onChangeText={(text) => updateMedication(idx, "name", text)} autoCapitalize="words" />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Dosagem</Text>
          <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 16, color: colors.textPrimary }} placeholder="Ex: 1 comprimido" placeholderTextColor={colors.textMuted} value={med.doseQuantity} onChangeText={(text) => updateMedication(idx, "doseQuantity", text)} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Frequência</Text>
          <TouchableOpacity style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }} onPress={() => setOpenFreqIndex(isFreqOpen ? null : idx)}>
            <Text style={{ fontSize: 16, color: colors.textPrimary }}>{med.frequency}</Text>
            <Ionicons name={isFreqOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          {isFreqOpen && (
            <View style={{ backgroundColor: backgrounds.elevated, borderRadius: radius.input, borderWidth: 1, borderColor: borders.card, overflow: "hidden", ...shadows.card }}>
              {Frequencies.map((f) => (
                <TouchableOpacity key={f} style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borders.subtle, backgroundColor: med.frequency === f ? colors.primaryGlass : "transparent" }} onPress={() => { updateMedication(idx, "frequency", f); setOpenFreqIndex(null); }}>
                  <Text style={{ fontSize: 14, color: med.frequency === f ? colors.primary : colors.textSecondary, fontWeight: med.frequency === f ? "600" : "400" }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Horários</Text>
          <View style={{ gap: 10 }}>
            {med.times.map((time, tIndex) => (
              <View key={tIndex} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TimePicker value={time} onChange={(v) => updateTime(idx, tIndex, v)} colors={colors} backgrounds={backgrounds} borders={borders} radius={radius} inputBorder={inputBorder} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Slot do Dispenser</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[1, 2, 3].map((slot) => {
              const isSelected = med.slot === slot;
              const isLocked = occupiedSlots.includes(slot) && !isSelected;
              return (
                <TouchableOpacity
                  key={slot}
                  style={{ flex: 1, aspectRatio: 1.2, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? colors.primary : (isIOS ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(60,60,67,0.2)") : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,94,164,0.25)")), backgroundColor: isSelected ? colors.primaryLight : backgrounds.elevated, alignItems: "center", justifyContent: "center", opacity: isLocked ? 0.5 : 1, ...(isSelected ? shadows.button : {}) }}
                  onPress={() => !isLocked && updateMedication(idx, "slot", slot)}
                  disabled={isLocked}
                >
                  {isLocked && !isSelected ? (
                    <Ionicons name="lock-closed" size={22} color={colors.textTertiary} />
                  ) : (
                    <Text style={{ fontSize: 24, fontWeight: isSelected ? "700" : "600", color: isSelected ? "#FFFFFF" : colors.textSecondary }}>{slot}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Observações</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "400" }}>Opcional</Text>
          </View>
          <TextInput style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 14, color: colors.textPrimary, minHeight: 80 }} placeholder="Tomar após as refeições..." placeholderTextColor={colors.textMuted} value={med.notes} onChangeText={(text) => updateMedication(idx, "notes", text)} multiline numberOfLines={3} textAlignVertical="top" />
        </View>
      </View>
    );
  };

  function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textTertiary }}>{label}</Text>
        <TextInput
          style={{ height: 48, paddingHorizontal: 14, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 15, color: colors.textPrimary, textAlign: "center" }}
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: TabBarPadding, gap: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: "700", color: colors.textPrimary }}>Nova Prescrição</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Defina as informações globais e os medicamentos</Text>
        </View>

        {loadingActiveCheck ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : activePrescription ? (
          <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.card, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.error }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="alert-circle" size={22} color={colors.error} />
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.error, flex: 1 }}>Prescrição ativa em curso</Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
              Já existe uma prescrição ativa. Só é possível criar uma nova quando a atual terminar ou for desativada.
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              {activePrescription.items.slice(0, 3).map((item) => (
                <View key={item.id} style={{ backgroundColor: colors.errorBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: colors.error }}>
                  <Text style={{ fontSize: 12, color: colors.error, fontWeight: "600" }}>{item.name}</Text>
                </View>
              ))}
            </View>
            {activePrescription.end_date && (
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>Termina em: {activePrescription.end_date}</Text>
            )}
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, gap: 16, borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>Informações Globais</Text>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Nome da Prescrição</Text>
                <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 16, color: colors.textPrimary }} placeholder="Ex: Tratamento de 30 dias" placeholderTextColor={colors.textMuted} value={prescriptionName} onChangeText={setPrescriptionName} autoCapitalize="sentences" />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <DateInput label="Data de início" value={startDate} onChange={setStartDate} />
                <DateInput label="Data de fim" value={endDate} onChange={setEndDate} />
              </View>
              {startDate && endDate && endDate < startDate && (
                <Text style={{ fontSize: 12, color: colors.error }}>A data de fim deve ser posterior à data de início</Text>
              )}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[7, 14, 30].map((days) => (
                  <TouchableOpacity key={days} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated }} onPress={() => setEndDate(new Date(Date.now() + days * 86400000).toISOString().split("T")[0])}>
                    <Text style={{ fontSize: 12, fontWeight: "500", color: colors.textSecondary }}>{days} dias</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {medications.map((med, idx) => renderMedicationCard(med, idx))}

            {medications.length < 3 && (
              <TouchableOpacity style={{ backgroundColor: backgrounds.card, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed", borderRadius: 50, paddingVertical: 12, alignItems: "center", marginTop: 4 }} onPress={addMedication}>
                <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>+ Adicionar Medicamento</Text>
              </TouchableOpacity>
            )}

            {saveError ? (
              <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, borderWidth: 1, borderColor: colors.error }}>
                <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{saveError}</Text>
              </View>
            ) : null}

            <View style={{ gap: 12, marginTop: 8, marginBottom: 20 }}>
              <TouchableOpacity
                style={{ width: "100%", backgroundColor: (!canSave || loadingSave) ? colors.primaryTransparent : colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", ...((!canSave || loadingSave) ? {} : shadows.button) }}
                onPress={handleSave}
                disabled={!canSave || loadingSave}
              >
                {loadingSave ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>Salvar Receita</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}