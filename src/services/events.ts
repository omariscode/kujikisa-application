import { apiGet, apiPost } from "./client";
import type {
  EventListResponse,
  MedicationEvent,
  ConfirmEventRequest,
} from "@/src/types";

export function getEvents(): Promise<EventListResponse> {
  return apiGet<EventListResponse>("/api/medications/events/");
}

export function getEvent(id: number): Promise<MedicationEvent> {
  return apiGet<MedicationEvent>(`/api/medications/events/${id}/`);
}

export function confirmEvent(
  id: number,
  data: ConfirmEventRequest,
): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>(
    `/api/medications/events/${id}/confirm/`,
    data,
  );
}
