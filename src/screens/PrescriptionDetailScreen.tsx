import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";
import { usePrescription, useUpdatePrescription, useDeletePrescription } from "@/src/hooks/useApi";
import { getApiError } from "@/src/services/client";

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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: backgrounds.elevated, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, paddingVertical: 6, paddingHorizontal: 12 }}>
      <View style={{ alignItems: "center", gap: 2 }}>
        <TouchableOpacity onPress={() => onChange(`${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`)} style={{ padding: 2 }}>
          <Ionicons name="chevron-up" size={14} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary, minWidth: 28, textAlign: "center" }}>{String(h).padStart(2, "0")}</Text>
        <TouchableOpacity onPress={() => onChange(`${String((h - 1 + 24) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`)} style={{ padding: 2 }}>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textTertiary, marginHorizontal: 2 }}>:</Text>
      <View style={{ alignItems: "center", gap: 2 }}>
        <TouchableOpacity onPress={() => onChange(`${String(h).padStart(2, "0")}:${String((m + 1) % 60).padStart(2, "0")}`)} style={{ padding: 2 }}>
          <Ionicons name="chevron-up" size={14} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary, minWidth: 28, textAlign: "center" }}>{String(m).padStart(2, "0")}</Text>
        <TouchableOpacity onPress={() => onChange(`${String(h).padStart(2, "0")}:${String((m - 1 + 60) % 60).padStart(2, "0")}`)} style={{ padding: 2 }}>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DateInput({ label, value, onChange, colors, backgrounds, radius, inputBorder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
  backgrounds: any;
  radius: any;
  inputBorder: string;
}) {
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

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const presId = parseInt(id || "0", 10);
  const { colors, backgrounds, borders, shadows, radius, isDark } = useAppTheme();

  const { data: prescription, isLoading, refetch } = usePrescription(presId);
  const updateMutation = useUpdatePrescription();
  const deleteMutation = useDeletePrescription();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ name: string; dose_quantity: string; scheduled_time: string; slot_number: number }[]>([]);

  useMemo(() => {
    if (prescription) {
      setStartDate(prescription.start_date || "");
      setEndDate(prescription.end_date || "");
      setNotes(prescription.notes || "");
      setItems(
        prescription.items.map((i) => ({
          name: i.name,
          dose_quantity: i.dose_quantity || "",
          scheduled_time: i.scheduled_time,
          slot_number: i.slot_number,
        })),
      );
    }
  }, [prescription]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const addItem = () => {
    if (items.length < 3) {
      setItems([...items, { name: "", dose_quantity: "1 comprimido", scheduled_time: "08:00", slot_number: 1 }]);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateTime = (itemIndex: number, newValue: string) => {
    updateItem(itemIndex, "scheduled_time", newValue);
  };

  const datesValid = startDate && (!endDate || endDate >= startDate);
  const canSave = datesValid && items.every((item) => item.name.trim() !== "");

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateMutation.mutateAsync({
        id: presId,
        data: {
          start_date: startDate,
          end_date: endDate || undefined,
          is_active: prescription?.is_active,
          notes: notes || undefined,
          items: items.map((item) => ({
            name: item.name,
            dose_quantity: item.dose_quantity || "1 comprimido",
            scheduled_time: item.scheduled_time,
            slot_number: item.slot_number,
          })),
        },
      });
      setEditing(false);
      refetch();
    } catch (err) {
      setSaveError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Prescrição",
      "Tens a certeza que desejas eliminar esta prescrição? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(presId);
              router.back();
            } catch (err) {
              setSaveError(getApiError(err));
            }
          },
        },
      ],
    );
  };

  const inputBorder = isIOS ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.15)") : "rgba(0,94,164,0.2)";

  if (isLoading || !prescription) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: TabBarPadding, gap: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: colors.textPrimary }}>Prescrição #{prescription.id}</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Início: {prescription.start_date}</Text>
              {prescription.end_date && <Text style={{ fontSize: 14, color: colors.textSecondary }}>Fim: {prescription.end_date}</Text>}
            </View>
          </View>
          <View style={{ backgroundColor: prescription.is_active ? colors.successBg : colors.border, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 50 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: prescription.is_active ? colors.success : colors.textTertiary }}>
              {prescription.is_active ? "Ativa" : "Concluída"}
            </Text>
          </View>
        </View>

        {saveError ? (
          <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, borderWidth: 1, borderColor: colors.error }}>
            <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{saveError}</Text>
          </View>
        ) : null}

        {!editing && !saveError && prescription.notes ? (
          <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 14, borderWidth: 1, borderColor: borders.card, ...shadows.cardSm }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textTertiary, marginBottom: 4 }}>Observações</Text>
            <Text style={{ fontSize: 14, color: colors.textPrimary }}>{prescription.notes}</Text>
          </View>
        ) : null}

        {editing && (
          <View style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, gap: 16, borderWidth: 1, borderColor: borders.card, ...shadows.card }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>Período do Tratamento</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <DateInput label="Data de início" value={startDate} onChange={setStartDate} colors={colors} backgrounds={backgrounds} radius={radius} inputBorder={inputBorder} />
              <DateInput label="Data de fim" value={endDate} onChange={setEndDate} colors={colors} backgrounds={backgrounds} radius={radius} inputBorder={inputBorder} />
            </View>
            {startDate && endDate && endDate < startDate && (
              <Text style={{ fontSize: 12, color: colors.error }}>A data de fim deve ser posterior à data de início</Text>
            )}

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textTertiary }}>Observações</Text>
              <TextInput
                style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 14, color: colors.textPrimary, minHeight: 80 }}
                placeholder="Tomar após as refeições..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {items.map((item, idx) => (
          <View key={idx} style={{ backgroundColor: backgrounds.card, borderRadius: radius.card, padding: 16, gap: 16, borderWidth: 1, borderColor: editing ? colors.primary : borders.card, ...shadows.card }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: borders.subtle, paddingBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>Medicamento {idx + 1}</Text>
              {editing && items.length > 1 && (
                <TouchableOpacity onPress={() => removeItem(idx)} style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, backgroundColor: colors.errorBg, flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="trash" size={14} color={colors.error} />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.error }}> Remover</Text>
                </TouchableOpacity>
              )}
            </View>

            {!editing ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>{item.slot_number}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>{item.name}</Text>
                    <Text style={{ fontSize: 13, color: colors.textTertiary }}>{item.dose_quantity} · {item.scheduled_time}</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Nome do medicamento</Text>
                  <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 16, color: colors.textPrimary }} placeholder="Ex: Losartana" placeholderTextColor={colors.textMuted} value={item.name} onChangeText={(text) => updateItem(idx, "name", text)} autoCapitalize="words" />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Dosagem</Text>
                  <TextInput style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: inputBorder, backgroundColor: backgrounds.elevated, fontSize: 16, color: colors.textPrimary }} placeholder="Ex: 1 comprimido" placeholderTextColor={colors.textMuted} value={item.dose_quantity} onChangeText={(text) => updateItem(idx, "dose_quantity", text)} />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Horário</Text>
                  <TimePicker value={item.scheduled_time} onChange={(v) => updateTime(idx, v)} colors={colors} backgrounds={backgrounds} borders={borders} radius={radius} inputBorder={inputBorder} />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>Slot do Dispenser</Text>
                  <View style={{ gap: 10 }}>
                    {[0, 4].map((rowOffset) => (
                      <View key={rowOffset} style={{ flexDirection: "row", gap: 10 }}>
                        {[1, 2, 3, 4].map((col) => {
                          const slot = rowOffset + col;
                          const isSelected = item.slot_number === slot;
                          const occupiedByOthers = items.some((other, oi) => oi !== idx && other.slot_number === slot);
                          const isLocked = occupiedByOthers && !isSelected;
                          return (
                            <TouchableOpacity
                              key={slot}
                              style={{ flex: 1, aspectRatio: 1, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? colors.primary : (isIOS ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(60,60,67,0.2)") : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,94,164,0.25)")), backgroundColor: isSelected ? colors.primaryLight : backgrounds.elevated, alignItems: "center", justifyContent: "center", opacity: isLocked ? 0.5 : 1, ...(isSelected ? shadows.button : {}) }}
                              onPress={() => !isLocked && updateItem(idx, "slot_number", slot)}
                              disabled={isLocked}
                            >
                              {isLocked && !isSelected ? (
                                <Ionicons name="lock-closed" size={20} color={colors.textTertiary} />
                              ) : (
                                <Text style={{ fontSize: 20, fontWeight: isSelected ? "700" : "600", color: isSelected ? "#FFFFFF" : colors.textSecondary }}>{slot}</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        ))}

        {editing && items.length < 3 && (
          <TouchableOpacity style={{ backgroundColor: backgrounds.card, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed", borderRadius: 50, paddingVertical: 12, alignItems: "center", marginTop: 4 }} onPress={addItem}>
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>+ Adicionar Medicamento</Text>
          </TouchableOpacity>
        )}

        <View style={{ gap: 12, marginTop: 8 }}>
          {editing ? (
            <>
              <TouchableOpacity
                style={{ width: "100%", backgroundColor: (!canSave || saving) ? colors.primaryTransparent : colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", ...((!canSave || saving) ? {} : shadows.button) }}
                onPress={handleSave}
                disabled={!canSave || saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>Guardar Alterações</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: "100%", paddingVertical: 14, borderRadius: radius.button, borderWidth: 1, borderColor: borders.card, alignItems: "center", justifyContent: "center" }}
                onPress={() => { setEditing(false); setSaveError(""); refetch(); }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={{ width: "100%", backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", ...shadows.button }}
                onPress={() => setEditing(true)}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>Editar Prescrição</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: "100%", paddingVertical: 14, borderRadius: radius.button, borderWidth: 1, borderColor: colors.errorBg, backgroundColor: colors.errorBg, alignItems: "center", justifyContent: "center" }}
                onPress={handleDelete}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.error }}>Eliminar Prescrição</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
