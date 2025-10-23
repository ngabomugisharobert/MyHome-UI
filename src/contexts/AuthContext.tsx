import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError, showInfo } = useToast();

  const isAuthenticated = !!user && !!tokens;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('tokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          
          // Set default auth header
          authApi.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.accessToken}`;
          
          // Get user profile
          const response = await authApi.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.data.user);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('tokens');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user: userData, tokens: tokenData } = response.data.data;
        
        setUser(userData);
        setTokens(tokenData);
        localStorage.setItem('tokens', JSON.stringify(tokenData));
        
        // Set default auth header
        authApi.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;
        
        // Show welcome message
        setTimeout(() => {
          showSuccess(`Welcome back, ${userData.name}! You have successfully logged in to MyHome Healthcare Management System.`);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showError(error.response?.data?.message || 'Login failed. Please check your credentials.');
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
    setUser(null);
    setTokens(null);
    localStorage.removeItem('tokens');
    delete authApi.defaults.headers.common['Authorization'];
    
    showInfo('You have been logged out successfully.');
    }
  };

  const refreshToken = async () => {
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
        
        setTokens(newTokens);
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        authApi.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
