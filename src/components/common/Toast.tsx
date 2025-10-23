import React from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';
import { CheckCircle, Error, Info } from '@mui/icons-material';

interface ToastProps {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

// Slide transition for smooth toast animations
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

const Toast: React.FC<ToastProps> = ({ open, message, type, onClose, duration = 5000 }) => {
  const getSeverity = (type: 'success' | 'error' | 'info'): AlertColor => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'info':
        return <Info />;
      default:
        return <Info />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbar-root': {
          top: 24,
          right: 24,
        },
      }}
    >
      <Alert 
        onClose={onClose} 
        severity={getSeverity(type)}
        variant="filled"
        icon={getIcon(type)}
        sx={{ 
          width: '100%',
          minWidth: '300px',
          '& .MuiAlert-message': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiAlert-icon': {
            fontSize: '1.25rem',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
