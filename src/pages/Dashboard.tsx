import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  People,
  Business,
  LocalHospital,
  Assignment,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import FeatureCards from '../components/features/FeatureCards';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import SupervisorDashboard from '../components/dashboards/SupervisorDashboard';
import DoctorDashboard from '../components/dashboards/DoctorDashboard';
import CaregiverDashboard from '../components/dashboards/CaregiverDashboard';
import TestCredentials from '../components/common/TestCredentials';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Show role-specific dashboards
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'supervisor') {
    return <SupervisorDashboard />;
  }

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  if (user?.role === 'caregiver') {
    return <CaregiverDashboard />;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'doctor':
        return 'primary';
      case 'supervisor':
        return 'warning';
      case 'caregiver':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Assignment />;
      case 'doctor':
        return <LocalHospital />;
      case 'supervisor':
        return <TrendingUp />;
      case 'caregiver':
        return <People />;
      default:
        return <People />;
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: '24',
      icon: <People />,
      color: 'primary',
    },
    {
      title: 'Active Facilities',
      value: '3',
      icon: <Business />,
      color: 'success',
    },
    {
      title: 'Today\'s Appointments',
      value: '12',
      icon: <Schedule />,
      color: 'info',
    },
    {
      title: 'Pending Tasks',
      value: '8',
      icon: <Assignment />,
      color: 'warning',
    },
  ];

  const recentActivities = [
    { text: 'New user registered: Dr. Sarah Johnson', time: '2 hours ago' },
    { text: 'Facility updated: Greenville Healthcare Center', time: '4 hours ago' },
    { text: 'Password reset requested: caregiver1@myhome.com', time: '6 hours ago' },
    { text: 'System backup completed successfully', time: '1 day ago' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
      
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}.light`,
                      color: `${stat.color}.contrastText`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} divider={index < recentActivities.length - 1}>
                  <ListItemText
                    primary={activity.text}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <People />
                </ListItemIcon>
                <ListItemText primary="Manage Users" secondary="Add or edit user accounts" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Business />
                </ListItemIcon>
                <ListItemText primary="Facility Management" secondary="Update facility information" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalHospital />
                </ListItemIcon>
                <ListItemText primary="Medical Records" secondary="View patient information" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="Reports" secondary="Generate system reports" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Test Credentials for Development */}
      <TestCredentials />

      {/* Feature Cards */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          System Features
        </Typography>
        <FeatureCards />
      </Box>
    </Box>
  );
};

export default Dashboard;
