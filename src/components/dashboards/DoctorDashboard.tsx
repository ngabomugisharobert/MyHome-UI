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
  LocalHospital as HospitalIcon,
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
import api from '../../services/api';
import FacilitySelector from '../common/FacilitySelector';

interface DoctorStats {
  totalPatients: number;
  activePatients: number;
  todayAppointments: number;
  pendingReports: number;
  completedTasks: number;
  patientSatisfaction: number;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'stable' | 'critical' | 'improving';
  lastVisit: string;
  nextAppointment: string;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 0,
    activePatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    completedTasks: 0,
    patientSatisfaction: 92,
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for doctor dashboard
      setStats({
        totalPatients: 45,
        activePatients: 38,
        todayAppointments: 8,
        pendingReports: 3,
        completedTasks: 12,
        patientSatisfaction: 92,
      });

      // Mock patients data
      setPatients([
        {
          id: '1',
          name: 'John Smith',
          age: 65,
          condition: 'Hypertension',
          status: 'stable',
          lastVisit: '2 days ago',
          nextAppointment: 'Tomorrow 10:00 AM',
        },
        {
          id: '2',
          name: 'Mary Johnson',
          age: 72,
          condition: 'Diabetes',
          status: 'improving',
          lastVisit: '1 week ago',
          nextAppointment: 'Next Monday 2:00 PM',
        },
        {
          id: '3',
          name: 'Robert Davis',
          age: 58,
          condition: 'Heart Condition',
          status: 'critical',
          lastVisit: 'Yesterday',
          nextAppointment: 'Today 3:00 PM',
        },
      ]);

      // Mock appointments data
      setAppointments([
        {
          id: '1',
          patientName: 'John Smith',
          time: '10:00 AM',
          type: 'Follow-up',
          status: 'scheduled',
        },
        {
          id: '2',
          patientName: 'Sarah Wilson',
          time: '11:30 AM',
          type: 'Consultation',
          status: 'scheduled',
        },
        {
          id: '3',
          patientName: 'Mike Brown',
          time: '2:00 PM',
          type: 'Check-up',
          status: 'completed',
        },
        {
          id: '4',
          patientName: 'Lisa Garcia',
          time: '3:30 PM',
          type: 'Follow-up',
          status: 'scheduled',
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
      case 'critical': return 'error';
      case 'improving': return 'info';
      default: return 'default';
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Doctor Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Patient care and medical management
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            New Patient
          </Button>
          <IconButton onClick={fetchDashboardData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Facility Selection */}
      <FacilitySelector 
        onFacilityChange={(facilityId) => {
          console.log('Doctor selected facility:', facilityId);
          // Refresh data when facility changes
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
                  <Typography variant="h4">{stats.totalPatients}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Patients
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.activePatients} active
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
                  <Typography variant="h4">{stats.todayAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Appointments
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
                  <Typography variant="h4">{stats.pendingReports}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reports
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
                  <Typography variant="h4">{stats.patientSatisfaction}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient Satisfaction
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.patientSatisfaction}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Schedule and Patients */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            <List>
              {appointments.map((appointment) => (
                <ListItem key={appointment.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${appointment.time} - ${appointment.patientName}`}
                    secondary={`${appointment.type} • ${appointment.status}`}
                  />
                  <Chip
                    label={appointment.status}
                    color={getAppointmentStatusColor(appointment.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Patients
            </Typography>
            <List>
              {patients.map((patient) => (
                <ListItem key={patient.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <HospitalIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${patient.name} (${patient.age})`}
                    secondary={`${patient.condition} • Last visit: ${patient.lastVisit}`}
                  />
                  <Chip
                    label={patient.status}
                    color={getStatusColor(patient.status) as any}
                    size="small"
                  />
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
                  View All Patients
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                >
                  Schedule Appointment
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                >
                  Write Report
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                >
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
