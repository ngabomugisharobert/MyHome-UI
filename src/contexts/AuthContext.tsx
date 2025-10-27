import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '../types';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  isSessionExpired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError, showInfo } = useToast();

  const isAuthenticated = !!user && !!tokens;
  const isSessionExpired = sessionExpiry ? new Date() > sessionExpiry : false;

  // Session management functions
  const saveSession = (tokens: AuthTokens, userData: User) => {
    const sessionData = {
      tokens,
      user: userData,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    localStorage.setItem('session', JSON.stringify(sessionData));
    setSessionExpiry(new Date(sessionData.expiry));
    
    // Update React state
    setUser(userData);
    setTokens(tokens);
    
    // Set auth header
    authApi.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  };

  const loadSession = useCallback(() => {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        const expiry = new Date(parsed.expiry);
        
        if (new Date() < expiry) {
          setTokens(parsed.tokens);
          setUser(parsed.user);
          setSessionExpiry(expiry);
          authApi.defaults.headers.common['Authorization'] = `Bearer ${parsed.tokens.accessToken}`;
          return true;
        } else {
          // Session expired
          localStorage.removeItem('session');
          localStorage.removeItem('tokens');
          setUser(null);
          setTokens(null);
          setSessionExpiry(null);
          delete authApi.defaults.headers.common['Authorization'];
          return false;
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      localStorage.removeItem('session');
      localStorage.removeItem('tokens');
      setUser(null);
      setTokens(null);
      setSessionExpiry(null);
      delete authApi.defaults.headers.common['Authorization'];
    }
    return false;
  }, []);

  const clearSession = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    setUser(null);
    setTokens(null);
    setSessionExpiry(null);
    delete authApi.defaults.headers.common['Authorization'];
  };

  const refreshToken = useCallback(async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token', {
        refreshToken: tokens.refreshToken
      });

      if (response.data.success && response.data.data) {
        const newTokens = {
          ...tokens,
          accessToken: response.data.data.accessToken
        };
        
        // Update session with new tokens
        if (user) {
          saveSession(newTokens, user);
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearSession();
    }
  }, [tokens, user]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (sessionExpiry && !isSessionExpired) {
      const timeUntilExpiry = sessionExpiry.getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry
      
      const timeoutId = setTimeout(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          clearSession();
        }
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    }
  }, [sessionExpiry, isSessionExpired, refreshToken]);

  // Check for session expiry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionExpiry && new Date() > sessionExpiry) {
        showInfo('Your session has expired. Please log in again.');
        clearSession();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionExpiry, showInfo]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to load existing session
        const sessionLoaded = loadSession();
        
        if (sessionLoaded) {
          // Verify session with backend
          try {
            const response = await authApi.get('/auth/profile');
            if (response.data.success) {
              setUser(response.data.data.user);
            } else {
              throw new Error('Session verification failed');
            }
          } catch (error) {
            console.error('Session verification error:', error);
            clearSession();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [loadSession]);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Login attempt with credentials:', credentials);
      console.log('AuthApi baseURL:', authApi.defaults.baseURL);
      console.log('Full login URL:', authApi.defaults.baseURL + '/auth/login');
      
      const response = await authApi.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user: userData, tokens: tokenData } = response.data.data;
        
        // Save session with expiry
        saveSession(tokenData, userData);
        
        // Show welcome message
        setTimeout(() => {
          showSuccess(`Welcome back, ${userData.name}! You have successfully logged in to MyHome Healthcare Management System.`);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific protocol errors
      if (error.message && error.message.includes('Unsupported protocol')) {
        showError('API configuration error. Please check the server connection.');
        console.error('API URL issue:', authApi.defaults.baseURL);
      } else if (error.code === 'ERR_NETWORK') {
        showError('Network error. Please check if the backend server is running.');
      } else {
        showError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const response = await authApi.post<ApiResponse<{ user: User }>>('/auth/register', data);
      
      if (response.data.success && response.data.data) {
        // Registration successful, but user needs to login
        showSuccess('Registration successful! Please login with your credentials.');
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      showError(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await authApi.post('/auth/logout', { refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      showInfo('You have been logged out successfully.');
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated,
    sessionExpiry,
    isSessionExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
