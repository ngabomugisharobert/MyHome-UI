import axios from 'axios';

// Ensure we have a proper API URL
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

// Fix common URL issues
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = 'http://' + API_BASE_URL;
}

// Ensure it ends with /api if it doesn't already
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

// Ensure the URL is properly formatted
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  console.error('Invalid API_BASE_URL:', API_BASE_URL);
}

// Debug logging
console.log('🔧 API Configuration Debug:');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test the URL construction
console.log('Testing URL construction...');
const testUrl = API_BASE_URL + '/auth/login';
console.log('Full login URL:', testUrl);

// Validate URL format
try {
  new URL(testUrl);
  console.log('✅ URL is valid');
} catch (error) {
  console.error('❌ Invalid URL format:', error);
}

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
authApi.interceptors.request.use(
  (config) => {
    console.log('🚀 Auth API Request:', (config.baseURL || '') + (config.url || ''));
    console.log('Request details:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Auth API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
authApi.interceptors.response.use(
  (response) => {
    console.log('✅ Auth API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Auth API Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
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
    // Try to get tokens from session first (new system)
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed.tokens && parsed.tokens.accessToken) {
          config.headers.Authorization = `Bearer ${parsed.tokens.accessToken}`;
          return config;
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
    
    // Fallback to old tokens storage (for backward compatibility)
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      try {
        const parsedTokens = JSON.parse(tokens);
        if (parsedTokens.accessToken) {
          config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing tokens:', error);
      }
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
