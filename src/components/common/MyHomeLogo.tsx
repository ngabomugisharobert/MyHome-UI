import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Home, LocalHospital } from '@mui/icons-material';

interface MyHomeLogoProps {
  variant?: 'full' | 'compact';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const MyHomeLogo: React.FC<MyHomeLogoProps> = ({ 
  variant = 'full', 
  size = 'medium',
  color 
}) => {
  const theme = useTheme();
  const logoColor = color || theme.palette.primary.main;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 20, fontSize: '0.875rem' };
      case 'large':
        return { iconSize: 40, fontSize: '1.5rem' };
      default:
        return { iconSize: 28, fontSize: '1.125rem' };
    }
  };

  const { iconSize, fontSize } = getSizeStyles();

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize + 8,
            height: iconSize + 8,
            borderRadius: '50%',
            backgroundColor: logoColor,
            color: 'white',
          }}
        >
          <LocalHospital sx={{ fontSize: iconSize }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: logoColor,
            fontSize: fontSize,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize + 12,
          height: iconSize + 12,
          borderRadius: '12px',
          backgroundColor: logoColor,
          color: 'white',
          position: 'relative',
        }}
      >
        <LocalHospital sx={{ fontSize: iconSize }} />
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: theme.palette.secondary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Home sx={{ fontSize: 8, color: 'white' }} />
        </Box>
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: logoColor,
            fontSize: fontSize,
            lineHeight: 1,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          MyHome
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Healthcare
        </Typography>
      </Box>
    </Box>
  );
};

export default MyHomeLogo;
