import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  LinearProgress,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccessTime,
  Refresh,
  Logout,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const SessionIndicator: React.FC = () => {
  const { sessionExpiry, isSessionExpired, refreshToken, logout } = useAuth();
  const { showInfo } = useToast();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!sessionExpiry) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(sessionExpiry);
      const remaining = Math.max(0, expiry.getTime() - now.getTime());
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry]);

  const formatTimeRemaining = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Expired';
    }
  };

  const getSessionStatus = () => {
    if (isSessionExpired) {
      return { color: 'error' as const, label: 'Session Expired', icon: <Warning /> };
    }
    
    const totalSessionTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const remainingPercentage = (timeRemaining / totalSessionTime) * 100;
    
    if (remainingPercentage > 50) {
      return { color: 'success' as const, label: 'Active', icon: <AccessTime /> };
    } else if (remainingPercentage > 20) {
      return { color: 'warning' as const, label: 'Expiring Soon', icon: <AccessTime /> };
    } else {
      return { color: 'error' as const, label: 'Expiring Soon', icon: <Warning /> };
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshToken();
      showInfo('Session refreshed successfully');
      setAnchorEl(null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  const status = getSessionStatus();

  if (!sessionExpiry) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={`Session expires in ${formatTimeRemaining(timeRemaining)}`}>
        <Chip
          icon={status.icon}
          label={`${formatTimeRemaining(timeRemaining)}`}
          color={status.color}
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ cursor: 'pointer' }}
        />
      </Tooltip>
      
      {timeRemaining > 0 && (
        <Box sx={{ width: 60, display: 'flex', alignItems: 'center' }}>
          <LinearProgress
            variant="determinate"
            value={(timeRemaining / (24 * 60 * 60 * 1000)) * 100}
            color={status.color}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleRefreshSession}>
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh Session</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SessionIndicator;
