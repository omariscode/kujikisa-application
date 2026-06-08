import { apiGet, apiPost, apiPut } from "./client";
import type {
  HealthStatus,
  DeviceStatus,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/src/types";

export function getHealth(): Promise<HealthStatus> {
  return apiGet<HealthStatus>("/api/health");
}

export function getStatus(): Promise<DeviceStatus> {
  return apiGet<DeviceStatus>("/api/status");
}

export function syncTime(): Promise<{ detail: string }> {
  const epoch = Math.floor(Date.now() / 1000);
  return apiPost<{ detail: string }>("/api/time", { epoch });
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/users/login/", data);
}

export function register(data: RegisterRequest): Promise<{ id: number; email: string; full_name: string }> {
  return apiPost<{ id: number; email: string; full_name: string }>(
    "/api/users/register/",
    data,
  );
}

export function getProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>("/api/users/profile/");
}

export function updateProfile(data: UpdateProfileRequest): Promise<{ detail: string }> {
  return apiPut<{ detail: string }>("/api/users/profile/", data);
}

export function changePassword(data: ChangePasswordRequest): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>("/api/users/change-password/", data);
}

export function logout(): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>("/api/users/logout/");
}
