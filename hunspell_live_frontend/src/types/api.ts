export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  json?: () => Promise<T>;
}

export interface LanguageOption {
  id: string;
  name: string;
  code: string;
} 