import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
authApi.interceptors.request.use(
  (config) => {
    console.log('Auth API Request:', (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    console.error('Auth API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
authApi.interceptors.response.use(
  (response) => {
    console.log('Auth API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Auth API Response Error:', error.message, error.response?.status);
    return Promise.reject(error);
  }
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      const parsedTokens = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('tokens');
        if (tokens) {
          const parsedTokens = JSON.parse(tokens);
          const response = await authApi.post('/auth/refresh-token', {
            refreshToken: parsedTokens.refreshToken
          });

          if (response.data.success) {
            const newTokens = {
              ...parsedTokens,
              accessToken: response.data.data.accessToken
            };
            
            localStorage.setItem('tokens', JSON.stringify(newTokens));
            api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
            
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('tokens');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
