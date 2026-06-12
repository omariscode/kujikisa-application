import type { ApiError } from "@/src/types";
import { getDeviceUrl, getToken, setDeviceUrl } from "./storage";

const TIMEOUT_MS = 6000;
const DISCOVERY_TIMEOUT_MS = 3000;

class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function discoverDevice(): Promise<string> {
  const candidates = ["http://kujikisa.local", "http://192.168.4.1", "http://192.168.1.100","http://192.168.0.195"];

  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT_MS);

      const res = await fetch(`${base}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          await setDeviceUrl(base);
          return base;
        }
      }
    } catch {}
  }

  throw new ApiClientError(502, "Dispensador não encontrado.");
}

async function getBaseUrl(): Promise<string> {
  const stored = await getDeviceUrl();
  if (stored) return stored;

  const discovered = await discoverDevice();
  return discovered;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = await getBaseUrl();
  const token = await getToken();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      let detail = `Erro ${res.status}`;
      if (contentType.includes("application/json")) {
        try {
          const errData: ApiError = await res.json();
          detail = errData.detail || detail;
        } catch {}
      }
      throw new ApiClientError(res.status, detail);
    }

    if (contentType.includes("application/json")) {
      const data: T = await res.json();
      return data;
    }

    return undefined as unknown as T;
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    if (err instanceof TypeError && err.message.includes("abort")) {
      throw new ApiClientError(408, "Tempo limite excedido.");
    }
    throw new ApiClientError(502, `Erro de conexão: ${err}`);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}

export function isApiError(err: unknown): err is ApiClientError {
  return err instanceof ApiClientError;
}

export function getApiError(err: unknown): string {
  if (isApiError(err)) return err.detail;
  if (err instanceof Error) return err.message;
  return "Erro desconhecido.";
}

export { ApiClientError };
