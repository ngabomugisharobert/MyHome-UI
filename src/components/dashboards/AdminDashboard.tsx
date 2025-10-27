import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalFacilities: number;
  activeFacilities: number;
  pendingTasks: number;
  completedTasks: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalFacilities: 0,
    activeFacilities: 0,
    pendingTasks: 0,
    completedTasks: 0,
    systemHealth: 95,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users data (admin only)
      let users = [];
      if (user?.role === 'admin') {
        const usersResponse = await api.get('/users');
        users = usersResponse.data.data?.users || [];
      }
      
      // Fetch facilities data (admin only)
      let facilities = [];
      if (user?.role === 'admin') {
        const facilitiesResponse = await api.get('/facilities');
        facilities = facilitiesResponse.data?.facilities || [];
      }
      
      // Calculate stats
      const activeUsers = users.filter((u: any) => u.isActive).length;
      const activeFacilities = facilities.filter((f: any) => f.isActive).length;
      
      setStats({
        totalUsers: users.length,
        activeUsers,
        totalFacilities: facilities.length,
        activeFacilities,
        pendingTasks: Math.floor(Math.random() * 10) + 5,
        completedTasks: Math.floor(Math.random() * 50) + 20,
        systemHealth: 95,
      });

      // Mock recent activities
      setRecentActivities([
        {
          id: '1',
          type: 'user',
          message: 'New user registered: John Doe',
          timestamp: '2 minutes ago',
          severity: 'info',
        },
        {
          id: '2',
          type: 'facility',
          message: 'Facility "Sunset Healthcare" was updated',
          timestamp: '15 minutes ago',
          severity: 'info',
        },
        {
          id: '3',
          type: 'system',
          message: 'System backup completed successfully',
          timestamp: '1 hour ago',
          severity: 'success',
        },
        {
          id: '4',
          type: 'security',
          message: 'Failed login attempt detected',
          timestamp: '2 hours ago',
          severity: 'warning',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <WarningIcon />;
      default: return <AssignmentIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System overview and management
          </Typography>
        </Box>
        <IconButton onClick={fetchDashboardData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.activeUsers} active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalFacilities}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Facilities
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.activeFacilities} active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.pendingTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.completedTasks} completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.systemHealth}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Health
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.systemHealth}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent System Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getSeverityIcon(activity.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.timestamp}
                  />
                  <Chip
                    label={activity.severity}
                    color={getSeverityColor(activity.severity) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Facilities" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="System Settings" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="View Reports" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
