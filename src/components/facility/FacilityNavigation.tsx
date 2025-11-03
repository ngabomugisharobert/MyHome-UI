import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

interface FacilityNavigationProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

const FacilityNavigation: React.FC<FacilityNavigationProps> = ({ onNavigate, currentPath }) => {
  const menuItems = [
    {
      text: 'Dashboard',
      path: '/facility/dashboard',
      icon: <DashboardIcon />,
      description: 'Overview of your facility'
    },
    {
      text: 'Users',
      path: '/facility/users',
      icon: <PeopleIcon />,
      description: 'Manage facility users'
    },
    {
      text: 'Residents',
      path: '/facility/residents',
      icon: <SecurityIcon />,
      description: 'Manage facility residents'
    },
    {
      text: 'Facility Info',
      path: '/facility/info',
      icon: <BusinessIcon />,
      description: 'View facility details'
    },
    {
      text: 'Reports',
      path: '/facility/reports',
      icon: <AssessmentIcon />,
      description: 'Facility reports and analytics'
    },
    {
      text: 'Settings',
      path: '/facility/settings',
      icon: <SettingsIcon />,
      description: 'Facility settings'
    }
  ];

  return (
    <Box>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          Facility Management
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Manage your facility data
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => onNavigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                secondary={item.description}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                    opacity: 0.8,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FacilityNavigation;

