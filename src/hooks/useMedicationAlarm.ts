import { useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface MedicationAlarmItem {
  name: string;
  scheduledTime: string;
}

const ALARMED_IDS_KEY = "alarmed-meds";

export function useMedicationAlarm(medications: MedicationAlarmItem[]) {
  const alarmedRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("medication-alarm", {
        name: "Medication Alarm",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "alarm.wav",
        vibrationPattern: [0, 300, 200, 300],
        lightColor: "#007AFF",
      });
    }
  }, []);

  const checkAndAlarm = useCallback(() => {
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const currentMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;

    for (const med of medications) {
      const [h, m] = med.scheduledTime.split(":").map(Number);
      const scheduledMs = h * 3600000 + m * 60000;

      if (currentMs < scheduledMs || currentMs - scheduledMs > 180000) continue;
      if (alarmedRef.current.has(currentHHMM + med.name)) continue;

      alarmedRef.current.add(currentHHMM + med.name);

      Notifications.scheduleNotificationAsync({
        content: {
          title: "Hora do Medicamento!",
          body: `${med.name} — ${med.scheduledTime}`,
          sound: "alarm.wav",
          data: { medName: med.name },
        },
        trigger: null,
      });
    }
  }, [medications]);

  useEffect(() => {
    alarmedRef.current.clear();
  }, [medications]);

  useEffect(() => {
    intervalRef.current = setInterval(checkAndAlarm, 15000);
    checkAndAlarm();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkAndAlarm]);

  return null;
}
