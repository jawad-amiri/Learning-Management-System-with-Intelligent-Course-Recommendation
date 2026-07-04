import { API_ORIGIN } from "@/services/api";

// UPDATED: central media resolver for backend-served uploads in dev and production.
export function resolveMediaUrl(value?: string | null) {
  if (!value) return "";

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const explicitMediaOrigin = import.meta.env.VITE_MEDIA_URL || "";
  const apiOrigin = API_ORIGIN || "";
  const origin = explicitMediaOrigin || (/^https?:\/\//i.test(apiOrigin) ? apiOrigin.replace(/\/api\/?$/, "") : "");
  const path = value.startsWith("/") ? value : `/${value}`;

  return `${origin}${path}`;
}
