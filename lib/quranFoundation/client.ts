/**
 * Quran Foundation **content** CDN client (QDC).
 * Docs / product context: https://api-docs.quran.foundation
 *
 * Base URL is configurable; default matches hackathon brief.
 */
const DEFAULT_CONTENT_BASE = "https://api.qurancdn.com/api/qdc";

export function getQfContentBaseUrl(): string {
  return (process.env.QF_API_BASE_URL ?? DEFAULT_CONTENT_BASE).replace(/\/+$/, "");
}

export function getQfUserApiBaseUrl(): string {
  const base = process.env.QF_USER_API_BASE_URL ?? "https://api.quran.foundation";
  return base.replace(/\/+$/, "");
}

export function getQfApiKey(): string | undefined {
  const key = process.env.QF_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

export type QfJson = Record<string, unknown>;

export async function qfContentGet(pathWithLeadingSlash: string, init?: RequestInit): Promise<Response> {
  const base = getQfContentBaseUrl();
  const url = `${base}${pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function qfUserPost(pathWithLeadingSlash: string, body: unknown, bearerToken: string): Promise<Response> {
  const base = getQfUserApiBaseUrl();
  const url = `${base}${pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearerToken}`,
  };
  const apiKey = getQfApiKey();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

export async function qfUserGet(pathWithLeadingSlash: string, bearerToken: string): Promise<Response> {
  const base = getQfUserApiBaseUrl();
  const url = `${base}${pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${bearerToken}`,
  };
  const apiKey = getQfApiKey();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  return fetch(url, { method: "GET", headers });
}
