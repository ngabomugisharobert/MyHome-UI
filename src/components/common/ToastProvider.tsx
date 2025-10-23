import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import Toast from './Toast';

const ToastDisplay: React.FC = () => {
  const { toastState, closeToast } = useToast();

  return (
    <Toast
      open={toastState.open}
      message={toastState.message}
      type={toastState.type}
      onClose={closeToast}
      duration={toastState.duration}
    />
  );
};

export default ToastDisplay;
