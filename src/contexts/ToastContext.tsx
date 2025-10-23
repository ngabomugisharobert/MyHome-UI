import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
  duration?: number;
}

interface ToastContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  closeToast: () => void;
  toastState: ToastState;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: '',
    type: 'info',
    id: ''
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info', duration?: number) => {
    const id = Date.now().toString();
    setToastState({
      open: true,
      message,
      type,
      id,
      duration
    });
  }, []);

  const showSuccess = useCallback((message: string, duration = 5000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration = 7000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const closeToast = useCallback(() => {
    setToastState(prev => ({ ...prev, open: false }));
  }, []);

  const value = {
    showSuccess,
    showError,
    showInfo,
    closeToast,
    toastState
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
