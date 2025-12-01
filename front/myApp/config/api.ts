export const connection_urls = {
    BACKEND_URL: 'http://192.168.3.105:5000'
}

const BASE_URL = connection_urls.BACKEND_URL // <- update me

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore JSON parse error for empty bodies
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
