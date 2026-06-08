import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  Device,
  PairDeviceRequest,
  RenameDeviceRequest,
  LocalSchedule,
  DeviceStatus,
} from "@/src/types";

export function getDevices(): Promise<Device[]> {
  return apiGet<Device[]>("/api/devices/");
}

export function getDevice(id: number): Promise<Device> {
  return apiGet<Device>(`/api/devices/${id}/`);
}

export function pairDevice(
  data: PairDeviceRequest,
): Promise<Device> {
  return apiPost<Device>("/api/devices/pair/", data);
}

export function unpairDevice(
  id: number,
): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>(`/api/devices/${id}/unpair/`);
}

export function renameDevice(
  id: number,
  data: RenameDeviceRequest,
): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    `/api/devices/${id}/rename/`,
    data,
  );
}

export function getDeviceLogs(
  id: number,
): Promise<{ results: any[] }> {
  return apiGet<{ results: any[] }>(`/api/devices/${id}/logs/`);
}

export function getLocalSchedule(
  id: number,
): Promise<LocalSchedule> {
  return apiGet<LocalSchedule>(
    `/api/devices/${id}/local-schedule/`,
  );
}

export function getConfig(): Promise<{
  serial_number: string;
  firmware_version: string;
  ap_ssid: string;
  station_connected: boolean;
  station_ip: string;
  time: string;
}> {
  return apiGet("/api/config");
}

export function getHistory(): Promise<{ results: any[] }> {
  return apiGet<{ results: any[] }>("/api/history");
}

export function clearHistory(): Promise<{ detail: string }> {
  return apiDelete<{ detail: string }>("/api/history");
}

export function manualDispense(
  slot_number: number,
): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>("/api/dispense", { slot_number });
}
