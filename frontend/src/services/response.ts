export type BackendResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function isBackendResponse<T = unknown>(value: unknown): value is BackendResponse<T> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "success" in value &&
      "message" in value,
  );
}

export function extractResponseData<T>(data: unknown): T {
  if (isBackendResponse<T>(data)) {
    return data.data as T;
  }

  return data as T;
}

export function extractResponseMessage(data: unknown, fallback = "Request completed") {
  if (isBackendResponse(data)) {
    return data.message || fallback;
  }

  return fallback;
}
