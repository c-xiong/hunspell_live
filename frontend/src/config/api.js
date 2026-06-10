var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
// Plain fetch wrapper: base URL + JSON. No auth, no token refresh.
// In production the frontend is served by the API itself (same origin),
// so the base URL is empty; in dev it points at the uvicorn server.
export const API_BASE_URL = (import.meta.env.VITE_MODE === 'production'
    ? (_a = import.meta.env.VITE_API_URL_PROD) !== null && _a !== void 0 ? _a : ''
    : (_b = import.meta.env.VITE_API_URL_DEV) !== null && _b !== void 0 ? _b : 'http://localhost:8080').replace(/\/+$/, '');
export const apiRequest = (endpoint_1, ...args_1) => __awaiter(void 0, [endpoint_1, ...args_1], void 0, function* (endpoint, options = {}) {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Don't set a JSON content type for FormData — the browser adds the
    // correct multipart boundary itself.
    const headers = options.body instanceof FormData
        ? Object.assign({}, options.headers) : Object.assign({ 'Content-Type': 'application/json' }, options.headers);
    return fetch(`${API_BASE_URL}${normalizedEndpoint}`, Object.assign(Object.assign({}, options), { headers }));
});
