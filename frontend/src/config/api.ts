export const API_BASE_URL = import.meta.env.VITE_MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV;

// TokenManager 类定义
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private tokenUpdateCallback: ((token: string | null) => void) | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }
    if (this.tokenUpdateCallback) {
      this.tokenUpdateCallback(token);
    }
  }

  getToken(): string | null {
    return this.accessToken || sessionStorage.getItem('accessToken');
  }

  setUpdateCallback(callback: (token: string | null) => void) {
    this.tokenUpdateCallback = callback;
  }
}

// 导出 tokenManager 实例
export const tokenManager = TokenManager.getInstance();

// 修改 refreshAccessToken 函数
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      tokenManager.setToken(data.access);
      return data.access;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// 修改 apiRequest 函数
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const executeRequest = async (token?: string) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  };

  try {
    let response = await executeRequest(tokenManager.getToken());
    const data = await response.json();

    if (response.status === 401 && endpoint !== '/auth/login/') {
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        tokenManager.setToken(newAccessToken);
        response = await executeRequest(newAccessToken);
        
        if (response.ok) {
          return response;
        }
      }

      tokenManager.setToken(null);
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: data,
        json: () => Promise.resolve(data)
      };
    }
    
    return {
      ok: true,
      status: response.status,
      data: data,
      json: () => Promise.resolve(data)
    };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 保持缓存相关代码不变
const cache = new Map();
export const cachedApiRequest = async (endpoint: string, options = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await apiRequest(endpoint, options);
  cache.set(cacheKey, response);
  return response;
};