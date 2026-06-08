import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import { ActivityIndicator, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";
import { isIOS, RADIUS } from "../theme/platform";
import { useAuth } from "@/src/contexts/AuthContext";
import { getApiError } from "@/src/services/client";
import { updateProfile, changePassword } from "@/src/services/auth";

function EditFieldModal({
  visible,
  title,
  currentLabel,
  newLabel,
  confirmLabel,
  currentValue,
  onSave,
  onClose,
  colors,
  backgrounds,
  borders,
  radius,
}: {
  visible: boolean;
  title: string;
  currentLabel: string;
  newLabel: string;
  confirmLabel: string;
  currentValue: string;
  onSave: (current: string, newVal: string, confirm: string) => Promise<void>;
  onClose: () => void;
  colors: any;
  backgrounds: any;
  borders: any;
  radius: typeof RADIUS;
}) {
  const [current, setCurrent] = useState("");
  const [newVal, setNewVal] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isValid = current && newVal && confirm && newVal === confirm;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError("");
    try {
      await onSave(current, newVal, confirm);
      setCurrent("");
      setNewVal("");
      setConfirm("");
      onClose();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: backgrounds.screen, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 40, gap: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: "center", justifyContent: "center" }}>
              <FontAwesome name="times" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={{ backgroundColor: colors.errorBg, borderRadius: radius.input, padding: 12, borderWidth: 1, borderColor: colors.error }}>
              <Text style={{ fontSize: 13, color: colors.error, fontWeight: "500", textAlign: "center" }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textTertiary }}>{currentLabel}</Text>
            <TextInput
              style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: borders.card, backgroundColor: backgrounds.elevated, fontSize: 15, color: colors.textPrimary }}
              placeholder={currentValue}
              placeholderTextColor={colors.textMuted}
              value={current}
              onChangeText={setCurrent}
              autoCapitalize="none"
              editable={!saving}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textTertiary }}>{newLabel}</Text>
            <TextInput
              style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: borders.card, backgroundColor: backgrounds.elevated, fontSize: 15, color: colors.textPrimary }}
              placeholder=""
              placeholderTextColor={colors.textMuted}
              value={newVal}
              onChangeText={setNewVal}
              autoCapitalize="none"
              editable={!saving}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textTertiary }}>{confirmLabel}</Text>
            <TextInput
              style={{ height: 48, paddingHorizontal: 16, borderRadius: radius.input, borderWidth: 1, borderColor: borders.card, backgroundColor: backgrounds.elevated, fontSize: 15, color: colors.textPrimary }}
              placeholder=""
              placeholderTextColor={colors.textMuted}
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="none"
              editable={!saving}
            />
          </View>

          <TouchableOpacity
            style={{ width: "100%", backgroundColor: isValid && !saving ? colors.primary : colors.primaryTransparent, paddingVertical: 16, borderRadius: radius.button, alignItems: "center", justifyContent: "center", opacity: isValid && !saving ? 1 : 0.5 }}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function InfoItem({ icon, label, value, onPress, colors, backgrounds, borders, shadows, radius }: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
  colors: any;
  backgrounds: any;
  borders: any;
  shadows: any;
  radius: typeof RADIUS;
}) {
  return (
    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: backgrounds.card, borderRadius: radius.cardSm, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: borders.card, ...shadows.cardSm }} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryGlass, alignItems: "center", justifyContent: "center" }}>
          <FontAwesome name={icon as any} size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>{label}</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>{value}</Text>
        </View>
      </View>
      <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function PersonalInfoScreen() {
  const { colors, backgrounds, borders, shadows, radius } = useAppTheme();
  const { user, refreshProfile } = useAuth();
  const [modal, setModal] = useState<"email" | "phone" | "password" | null>(null);

  const fields = [
    { key: "email" as const, icon: "envelope", label: "E-mail", value: user?.email || "" },
    { key: "phone" as const, icon: "phone", label: "Telefone", value: user?.phone || "Não definido" },
    { key: "password" as const, icon: "lock", label: "Senha", value: "••••••••" },
  ];

  const handleSave = async (key: string, current: string, newVal: string, confirm: string) => {
    if (key === "password") {
      await changePassword({ current_password: current, new_password: newVal });
    } else {
      const data: Record<string, string> = {};
      if (key === "email") data.email = newVal;
      if (key === "phone") data.phone = newVal;
      await updateProfile(data);
      await refreshProfile();
    }
  };

  const modalProps = (key: "email" | "phone" | "password") => {
    const labels = {
      email: { title: "Alterar E-mail", current: "E-mail actual", new: "Novo e-mail", confirm: "Confirmar e-mail" },
      phone: { title: "Alterar Telefone", current: "Telefone actual", new: "Novo telefone", confirm: "Confirmar telefone" },
      password: { title: "Alterar Senha", current: "Senha actual", new: "Nova senha", confirm: "Confirmar nova senha" },
    };
    const l = labels[key];
    return {
      visible: modal === key,
      title: l.title,
      currentLabel: l.current,
      newLabel: l.new,
      confirmLabel: l.confirm,
      currentValue: fields.find((f) => f.key === key)?.value ?? "",
      onSave: (c: string, n: string, cf: string) => handleSave(key, c, n, cf),
      onClose: () => setModal(null),
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 28 }}>Dados Pessoais</Text>
        {fields.map((field) => (
          <InfoItem key={field.key} icon={field.icon} label={field.label} value={field.value} onPress={() => setModal(field.key)} colors={colors} backgrounds={backgrounds} borders={borders} shadows={shadows} radius={radius} />
        ))}
      </ScrollView>
      <EditFieldModal {...modalProps("email")} colors={colors} backgrounds={backgrounds} borders={borders} radius={radius} />
      <EditFieldModal {...modalProps("phone")} colors={colors} backgrounds={backgrounds} borders={borders} radius={radius} />
      <EditFieldModal {...modalProps("password")} colors={colors} backgrounds={backgrounds} borders={borders} radius={radius} />
    </SafeAreaView>
  );
}
