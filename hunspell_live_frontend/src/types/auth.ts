export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse {
  ok: boolean;
  status: number;
  data?: any;
  json?: () => Promise<any>;
}

export interface LoginResponse {
  token: string;
  user: any;
} 