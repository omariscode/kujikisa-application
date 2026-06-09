import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as prescriptionsService from "@/src/services/prescriptions";
import * as eventsService from "@/src/services/events";
import * as devicesService from "@/src/services/devices";
import * as authService from "@/src/services/auth";
import type {
  CreatePrescriptionRequest,
  ConfirmEventRequest,
} from "@/src/types";

// ─── Prescriptions ──────────────────────────────────────────────────────────

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  detail: (id: number) => ["prescriptions", id] as const,
};

export function usePrescriptions() {
  return useQuery({
    queryKey: prescriptionKeys.all,
    queryFn: () => prescriptionsService.getPrescriptions(),
  });
}

export function usePrescription(id: number) {
  return useQuery({
    queryKey: prescriptionKeys.detail(id),
    queryFn: () => prescriptionsService.getPrescription(id),
    enabled: !!id,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePrescriptionRequest) =>
      prescriptionsService.createPrescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreatePrescriptionRequest }) =>
      prescriptionsService.updatePrescription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => prescriptionsService.deletePrescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });
    },
  });
}

// ─── Events ─────────────────────────────────────────────────────────────────

export const eventKeys = {
  all: ["events"] as const,
  detail: (id: number) => ["events", id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.all,
    queryFn: () => eventsService.getEvents(),
  });
}

export function useConfirmEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmEventRequest }) =>
      eventsService.confirmEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

// ─── Devices ────────────────────────────────────────────────────────────────

export const deviceKeys = {
  all: ["devices"] as const,
  detail: (id: number) => ["devices", id] as const,
  status: ["deviceStatus"] as const,
  config: ["deviceConfig"] as const,
  schedule: (id: number) => ["devices", id, "schedule"] as const,
};

export function useDevices() {
  return useQuery({
    queryKey: deviceKeys.all,
    queryFn: () => devicesService.getDevices(),
  });
}

export function useDeviceStatus() {
  return useQuery({
    queryKey: deviceKeys.status,
    queryFn: () => authService.getStatus(),
  });
}

export function useDeviceConfig() {
  return useQuery({
    queryKey: deviceKeys.config,
    queryFn: () => devicesService.getConfig(),
  });
}

export function useLocalSchedule(deviceId: number) {
  return useQuery({
    queryKey: deviceKeys.schedule(deviceId),
    queryFn: () => devicesService.getLocalSchedule(deviceId),
    enabled: !!deviceId,
  });
}

export function usePairDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serial: string) =>
      devicesService.pairDevice({ serial_number: serial }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}
