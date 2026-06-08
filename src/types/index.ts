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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  is_staff: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface PrescriptionItem {
  id?: number;
  name: string;
  dose_quantity?: string;
  scheduled_time: string;
  slot_number: number;
}

export interface Prescription {
  id: number;
  user_id: number;
  device_id: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  items: PrescriptionItem[];
}

export interface CreatePrescriptionRequest {
  start_date: string;
  end_date?: string;
  is_active?: boolean;
  notes?: string;
  items: Omit<PrescriptionItem, "id">[];
}

export interface PrescriptionListResponse {
  results: Prescription[];
}

export interface MedicationEvent {
  id: number;
  prescription_item_id: number;
  user_id: number;
  status: "taken" | "missed" | "confirmed_app" | "manual" | "pending";
  slot_number: number;
  occurred_at: string;
  taken_at: string;
  confirmed_by_device: boolean;
  confirmed_by_app: boolean;
}

export interface EventListResponse {
  results: MedicationEvent[];
}

export interface ConfirmEventRequest {
  status: "taken" | "confirmed_app";
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

export interface ApiError {
  detail: string;
}
