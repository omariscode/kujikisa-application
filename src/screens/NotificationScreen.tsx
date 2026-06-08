import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { isIOS } from "@/src/theme/platform";

type NotifType = "reminder" | "missed" | "taken" | "device" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "1", type: "reminder", title: "Hora da medicação!", message: "Está na hora de tomar a Metformina 500mg (Slot 2).", time: "Agora", read: false },
  { id: "2", type: "missed", title: "Medicação não confirmada", message: "A Vitamina D das 13:00 não foi confirmada.", time: "Há 30 min", read: false },
  { id: "3", type: "taken", title: "Medicação registada", message: "Paracetamol das 08:00 confirmado com sucesso.", time: "Há 2h", read: true },
  { id: "4", type: "device", title: "Nível de água baixo", message: "O reservatório está abaixo de 20%. Recarrega em breve.", time: "Há 3h", read: true },
  { id: "5", type: "device", title: "Slot 3 vazio", message: "O compartimento 3 ficou sem comprimidos.", time: "Ontem", read: true },
  { id: "6", type: "system", title: "Dispositivo conectado", message: "MedDispenser Pro ligou-se à rede Wi-Fi com sucesso.", time: "Ontem", read: true },
  { id: "7", type: "reminder", title: "Hora da medicação!", message: "Está na hora de tomar a Aspirina 100mg (Slot 1).", time: "2 dias atrás", read: true },
];

const typeConfig = (colors: any): Record<NotifType, { icon: string; color: string; bg: string }> => ({
  reminder: { icon: "bell", color: colors.primary, bg: colors.primaryGlass },
  missed: { icon: "times-circle", color: colors.error, bg: colors.errorBg },
  taken: { icon: "check-circle", color: colors.success, bg: colors.successBg },
  device: { icon: "wifi", color: "#B8860B", bg: "#FFF8E1" },
  system: { icon: "info-circle", color: "#4A53AD", bg: "#EFEFFF" },
});

export default function NotificationsScreen() {
  const { colors, backgrounds, borders, shadows, radius } = useAppTheme();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const config = typeConfig(colors);

  return (
    <View style={{ flex: 1, backgroundColor: backgrounds.screen }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary }}>
              Marcar todas como lidas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <FontAwesome name="bell-slash" size={48} color={colors.textMuted} />
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textSecondary }}>
            Sem notificações
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            Quando houver alertas aparecem aqui
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notif) => {
            const c = config[notif.type];
            return (
              <TouchableOpacity
                key={notif.id}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  backgroundColor: !notif.read
                    ? (isIOS ? "rgba(0,94,164,0.06)" : "rgba(0,94,164,0.04)")
                    : backgrounds.card,
                  borderRadius: radius.cardSm,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: !notif.read
                    ? "rgba(0,94,164,0.25)"
                    : borders.card,
                  ...shadows.cardSm,
                  position: "relative",
                }}
                onPress={() => markRead(notif.id)}
                activeOpacity={0.8}
              >
                {!notif.read && (
                  <View
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 8,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: c.bg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    flexShrink: 0,
                  }}
                >
                  <FontAwesome name={c.icon as any} size={18} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: notif.read ? "500" : "700",
                        color: notif.read ? colors.textSecondary : colors.textPrimary,
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {notif.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {notif.time}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textTertiary, lineHeight: 18 }}>
                    {notif.message}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteNotif(notif.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ padding: 4, marginLeft: 4, marginTop: 2 }}
                >
                  <FontAwesome name="times" size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
