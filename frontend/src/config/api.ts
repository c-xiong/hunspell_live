// Plain fetch wrapper: base URL + JSON. No auth, no token refresh.
// In production the frontend is served by the API itself (same origin),
// so the base URL is empty; in dev it points at the uvicorn server.
export const API_BASE_URL = (
  import.meta.env.VITE_MODE === 'production'
    ? import.meta.env.VITE_API_URL_PROD ?? ''
    : import.meta.env.VITE_API_URL_DEV ?? 'http://localhost:8080'
).replace(/\/+$/, '');

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Don't set a JSON content type for FormData — the browser adds the
  // correct multipart boundary itself.
  const headers: HeadersInit =
    options.body instanceof FormData
      ? { ...options.headers }
      : { 'Content-Type': 'application/json', ...options.headers };
  return fetch(`${API_BASE_URL}${normalizedEndpoint}`, { ...options, headers });
};
