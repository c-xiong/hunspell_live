// config.js

const API_URLS = {
  prod: 'https://your-production-api.com',
  dev: 'http://localhost:8000'
};

export const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_BASE_URL_PROD || API_URLS.prod)
  : (import.meta.env.VITE_BASE_URL_DEV || API_URLS.dev);

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Add caching
const cache = new Map();
export const cachedApiRequest = async (endpoint, options = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await apiRequest(endpoint, options);
  cache.set(cacheKey, response);
  return response;
};