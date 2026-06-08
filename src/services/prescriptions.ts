import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  Prescription,
  PrescriptionListResponse,
  CreatePrescriptionRequest,
} from "@/src/types";

export function getPrescriptions(): Promise<PrescriptionListResponse> {
  return apiGet<PrescriptionListResponse>("/api/medications/prescriptions/");
}

export function getPrescription(id: number): Promise<Prescription> {
  return apiGet<Prescription>(`/api/medications/prescriptions/${id}/`);
}

export function createPrescription(
  data: CreatePrescriptionRequest,
): Promise<{ id: number; detail: string }> {
  return apiPost<{ id: number; detail: string }>(
    "/api/medications/prescriptions/",
    data,
  );
}

export function updatePrescription(
  id: number,
  data: CreatePrescriptionRequest,
): Promise<{ detail: string }> {
  return apiPut<{ detail: string }>(
    `/api/medications/prescriptions/${id}/`,
    data,
  );
}

export function deletePrescription(
  id: number,
): Promise<{ detail: string }> {
  return apiDelete<{ detail: string }>(
    `/api/medications/prescriptions/${id}/`,
  );
}
