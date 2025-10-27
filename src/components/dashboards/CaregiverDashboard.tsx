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
  Button,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import FacilitySelector from '../common/FacilitySelector';
import api from '../../services/api';

interface CaregiverStats {
  assignedResidents: number;
  activeResidents: number;
  todayTasks: number;
  completedTasks: number;
  pendingTasks: number;
  careQuality: number;
}

interface Resident {
  id: string;
  name: string;
  age: number;
  room: string;
  condition: string;
  status: 'stable' | 'needs_attention' | 'critical';
  lastCheck: string;
  nextMedication: string;
}

interface Task {
  id: string;
  residentName: string;
  task: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const CaregiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CaregiverStats>({
    assignedResidents: 0,
    activeResidents: 0,
    todayTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    careQuality: 88,
  });
  const [residents, setResidents] = useState<Resident[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for caregiver dashboard
      setStats({
        assignedResidents: 12,
        activeResidents: 10,
        todayTasks: 15,
        completedTasks: 8,
        pendingTasks: 7,
        careQuality: 88,
      });

      // Mock residents data
      setResidents([
        {
          id: '1',
          name: 'Alice Johnson',
          age: 78,
          room: 'Room 101',
          condition: 'Dementia',
          status: 'stable',
          lastCheck: '2 hours ago',
          nextMedication: '8:00 PM',
        },
        {
          id: '2',
          name: 'Bob Smith',
          age: 82,
          room: 'Room 102',
          condition: 'Mobility Issues',
          status: 'needs_attention',
          lastCheck: '1 hour ago',
          nextMedication: '6:00 PM',
        },
        {
          id: '3',
          name: 'Carol Davis',
          age: 75,
          room: 'Room 103',
          condition: 'Diabetes',
          status: 'stable',
          lastCheck: '30 minutes ago',
          nextMedication: '7:00 PM',
        },
      ]);

      // Mock tasks data
      setTasks([
        {
          id: '1',
          residentName: 'Alice Johnson',
          task: 'Morning medication',
          time: '8:00 AM',
          status: 'completed',
          priority: 'high',
        },
        {
          id: '2',
          residentName: 'Bob Smith',
          task: 'Physical therapy assistance',
          time: '10:00 AM',
          status: 'in_progress',
          priority: 'medium',
        },
        {
          id: '3',
          residentName: 'Carol Davis',
          task: 'Blood sugar check',
          time: '2:00 PM',
          status: 'pending',
          priority: 'high',
        },
        {
          id: '4',
          residentName: 'Alice Johnson',
          task: 'Evening meal assistance',
          time: '6:00 PM',
          status: 'pending',
          priority: 'medium',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'success';
      case 'needs_attention': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Caregiver Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Resident care and daily tasks
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            Log Activity
          </Button>
          <IconButton onClick={fetchDashboardData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Facility Information */}
      <FacilitySelector 
        onFacilityChange={(facilityId) => {
          console.log('Caregiver facility context:', facilityId);
          // Refresh data when facility context changes
          fetchDashboardData();
        }}
        showCurrentSelection={true}
      />

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
                  <Typography variant="h4">{stats.assignedResidents}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Residents
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.activeResidents} active
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
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.todayTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Tasks
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
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.pendingTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.careQuality}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Care Quality Score
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.careQuality}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Tasks and Residents */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Tasks
            </Typography>
            <List>
              {tasks.map((task) => (
                <ListItem key={task.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${task.time} - ${task.task}`}
                    secondary={`${task.residentName} • Priority: ${task.priority}`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={task.status}
                      color={getTaskStatusColor(task.status) as any}
                      size="small"
                    />
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority) as any}
                      size="small"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Assigned Residents
            </Typography>
            <List>
              {residents.map((resident) => (
                <ListItem key={resident.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AccessibilityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${resident.name} (${resident.age})`}
                    secondary={`${resident.room} • ${resident.condition} • Last check: ${resident.lastCheck}`}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip
                      label={resident.status}
                      color={getStatusColor(resident.status) as any}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Next med: {resident.nextMedication}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                >
                  View All Residents
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                >
                  Check Schedule
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                >
                  Log Activity
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaregiverDashboard;
