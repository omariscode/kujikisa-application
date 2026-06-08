export interface HealthStatus {
  ok: boolean;
  serial_number: string;
  firmware_version: string;
}

export interface DeviceStatus {
  serial_number: string;
  firmware_version: string;
  ap_ip: string;
  station_ip: string;
  station_connected: boolean;
  water_level_pct: number;
  battery_level_pct: number;
  time: string;
  active_slot: number;
  storage_ready: boolean;
  users_count: number;
}

export interface DeviceConfig {
  serial_number: string;
  firmware_version: string;
  ap_ssid: string;
  station_connected: boolean;
  station_ip: string;
  time: string;
}

export interface Device {
  id: number;
  serial_number: string;
  name: string;
  firmware_version: string;
  status: string;
  water_level_pct: number;
  battery_level_pct: number;
  owner: number;
  last_seen?: string;
}

export interface PairDeviceRequest {
  serial_number: string;
}

export interface RenameDeviceRequest {
  name: string;
}

export interface LocalSchedule {
  schema_version: number;
  device_serial: string;
  items: LocalScheduleItem[];
}

export interface LocalScheduleItem {
  id: number;
  prescription_id: number;
  name: string;
  dose_quantity: string;
  slot_number: number;
  scheduled_time: string;
  start_date: string;
  end_date: string;
  active: boolean;
}
