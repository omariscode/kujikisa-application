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
