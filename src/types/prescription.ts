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
