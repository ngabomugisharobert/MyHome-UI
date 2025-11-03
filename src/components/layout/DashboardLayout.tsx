import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  Settings,
  Logout,
  Notifications,
  AccountCircle,
  ChevronLeft,
  ChevronRight,
  Security,
  Assignment,
  Schedule,
  Person,
  Contacts,
  Description,
  Task,
  Assessment,
  Medication,
  LocalHospital,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MyHomeLogo from '../common/MyHomeLogo';
import ThemeToggle from '../common/ThemeToggle';
import SessionIndicator from '../common/SessionIndicator';
import FacilityNavigation from '../facility/FacilityNavigation';

const drawerWidth = 200;
const collapsedDrawerWidth = 60;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get menu items based on user type
  const getMenuItems = () => {
    // Facility owners get facility-specific navigation
    if (user?.facilityId) {
      return [
        {
          text: 'Dashboard',
          icon: <Dashboard />,
          path: '/dashboard',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Residents',
          icon: <Person />,
          path: '/facility/residents',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Contacts',
          icon: <Contacts />,
          path: '/facility/contacts',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Documents',
          icon: <Description />,
          path: '/facility/documents',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Tasks',
          icon: <Task />,
          path: '/facility/tasks',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Inspections',
          icon: <Assessment />,
          path: '/facility/inspections',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Facility Users',
          icon: <People />,
          path: '/facility/users',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Medications',
          icon: <Medication />,
          path: '/medications',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Care Plans',
          icon: <LocalHospital />,
          path: '/care-plans',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
        {
          text: 'Schedules',
          icon: <CalendarToday />,
          path: '/schedules',
          roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
        },
      ];
    }

    // Role-specific navigation
    const baseItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
        roles: ['admin', 'caregiver', 'doctor', 'supervisor'],
      },
    ];

    // Admin-specific items
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          text: 'Users',
          icon: <People />,
          path: '/users',
          roles: ['admin'],
        },
        {
          text: 'Facilities',
          icon: <Business />,
          path: '/facilities',
          roles: ['admin'],
        },
        {
          text: 'Team Management',
          icon: <People />,
          path: '/team-management',
          roles: ['admin'],
        },
        {
          text: 'Role Management',
          icon: <Assignment />,
          path: '/role-management',
          roles: ['admin'],
        },
        {
          text: 'Access Management',
          icon: <Security />,
          path: '/access-management',
          roles: ['admin'],
        },
        {
          text: 'Medications',
          icon: <Medication />,
          path: '/medications',
          roles: ['admin'],
        },
        {
          text: 'Care Plans',
          icon: <LocalHospital />,
          path: '/care-plans',
          roles: ['admin'],
        },
        {
          text: 'Schedules',
          icon: <CalendarToday />,
          path: '/schedules',
          roles: ['admin'],
        },
      ];
    }

    // Supervisor-specific items
    if (user?.role === 'supervisor') {
      return [
        ...baseItems,
        {
          text: 'Users',
          icon: <People />,
          path: '/users',
          roles: ['supervisor'],
        },
        {
          text: 'Facilities',
          icon: <Business />,
          path: '/facilities',
          roles: ['supervisor'],
        },
        {
          text: 'Team Management',
          icon: <People />,
          path: '/team-management',
          roles: ['supervisor'],
        },
        {
          text: 'Access Management',
          icon: <Security />,
          path: '/access-management',
          roles: ['supervisor'],
        },
        {
          text: 'Medications',
          icon: <Medication />,
          path: '/medications',
          roles: ['supervisor'],
        },
        {
          text: 'Care Plans',
          icon: <LocalHospital />,
          path: '/care-plans',
          roles: ['supervisor'],
        },
        {
          text: 'Schedules',
          icon: <CalendarToday />,
          path: '/schedules',
          roles: ['supervisor'],
        },
      ];
    }

    // Doctor-specific items
    if (user?.role === 'doctor') {
      return [
        ...baseItems,
        {
          text: 'Patients',
          icon: <People />,
          path: '/patients',
          roles: ['doctor'],
        },
        {
          text: 'Appointments',
          icon: <Schedule />,
          path: '/appointments',
          roles: ['doctor'],
        },
        {
          text: 'Medical Records',
          icon: <Assignment />,
          path: '/medical-records',
          roles: ['doctor'],
        },
        {
          text: 'Medications',
          icon: <Medication />,
          path: '/medications',
          roles: ['doctor'],
        },
        {
          text: 'Care Plans',
          icon: <LocalHospital />,
          path: '/care-plans',
          roles: ['doctor'],
        },
        {
          text: 'Schedules',
          icon: <CalendarToday />,
          path: '/schedules',
          roles: ['doctor'],
        },
      ];
    }

    // Caregiver-specific items
    if (user?.role === 'caregiver') {
      return [
        ...baseItems,
        {
          text: 'Residents',
          icon: <People />,
          path: '/residents',
          roles: ['caregiver'],
        },
        {
          text: 'Tasks',
          icon: <Assignment />,
          path: '/tasks',
          roles: ['caregiver'],
        },
        {
          text: 'Schedule',
          icon: <Schedule />,
          path: '/schedule',
          roles: ['caregiver'],
        },
        {
          text: 'Medications',
          icon: <Medication />,
          path: '/medications',
          roles: ['caregiver'],
        },
        {
          text: 'Care Plans',
          icon: <LocalHospital />,
          path: '/care-plans',
          roles: ['caregiver'],
        },
        {
          text: 'Schedules',
          icon: <CalendarToday />,
          path: '/schedules',
          roles: ['caregiver'],
        },
      ];
    }

    // Default fallback
    return baseItems;
  };

  const menuItems = getMenuItems();

  const filteredMenuItems = menuItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        minHeight: 56,
        px: 1
      }}>
        {desktopOpen ? (
          <MyHomeLogo variant="full" size="small" />
        ) : (
          <MyHomeLogo variant="compact" size="small" />
        )}
        <IconButton 
          onClick={handleDesktopDrawerToggle} 
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            p: 0.5,
            minWidth: 'auto'
          }}
        >
          {desktopOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'flex-start',
        py: 0
      }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ flex: '0 0 auto' }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                minHeight: 44,
                maxHeight: 44,
                justifyContent: desktopOpen ? 'initial' : 'center',
                px: desktopOpen ? 2 : 1.5,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: desktopOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {desktopOpen && (
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: `${desktopOpen ? drawerWidth : collapsedDrawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <MyHomeLogo variant="compact" size="small" />
            <Typography variant="h6" noWrap component="div" sx={{ ml: 2, color: 'inherit' }}>
              Healthcare Management System
            </Typography>
          </Box>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <SessionIndicator />
          <ThemeToggle />
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: desktopOpen ? drawerWidth : collapsedDrawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
              transition: 'width 0.3s ease',
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
          open={desktopOpen}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          transition: 'width 0.3s ease',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
