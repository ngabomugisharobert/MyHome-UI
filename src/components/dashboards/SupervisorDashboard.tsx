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
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FolderOpen as EmptyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import FacilitySelector from '../common/FacilitySelector';
import api from '../../services/api';

interface SupervisorStats {
  teamMembers: number;
  activeTeamMembers: number;
  facilitiesManaged: number;
  pendingApprovals: number;
  completedTasks: number;
  teamPerformance: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  performance: number;
}

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SupervisorStats>({
    teamMembers: 0,
    activeTeamMembers: 0,
    facilitiesManaged: 0,
    pendingApprovals: 0,
    completedTasks: 0,
    teamPerformance: 85,
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users data (only if admin)
      let users = [];
      if (user?.role === 'admin') {
        const usersResponse = await api.get('/users');
        users = usersResponse.data.data?.users || [];
      }
      
      // Fetch facilities data (supervisor only)
      let facilities = [];
      if (user?.role === 'supervisor') {
        const facilitiesResponse = await api.get('/facilities');
        facilities = facilitiesResponse.data?.facilities || [];
      }
      
      // Calculate stats
      const activeUsers = users.filter((u: any) => u.isActive).length;
      const activeFacilities = facilities.filter((f: any) => f.isActive).length;
      
      setStats({
        teamMembers: users.length,
        activeTeamMembers: activeUsers,
        facilitiesManaged: facilities.length,
        pendingApprovals: Math.floor(Math.random() * 5) + 2,
        completedTasks: Math.floor(Math.random() * 30) + 15,
        teamPerformance: 85,
      });

      // Mock team members data
      setTeamMembers([
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          role: 'Doctor',
          status: 'active',
          lastActivity: '2 hours ago',
          performance: 95,
        },
        {
          id: '2',
          name: 'Nurse Mike Chen',
          role: 'Caregiver',
          status: 'active',
          lastActivity: '1 hour ago',
          performance: 88,
        },
        {
          id: '3',
          name: 'Dr. Emily Davis',
          role: 'Doctor',
          status: 'active',
          lastActivity: '30 minutes ago',
          performance: 92,
        },
        {
          id: '4',
          name: 'Caregiver Alex Smith',
          role: 'Caregiver',
          status: 'pending',
          lastActivity: '1 day ago',
          performance: 75,
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <AssignmentIcon />;
      case 'caregiver': return <PeopleIcon />;
      case 'supervisor': return <TrendingUpIcon />;
      default: return <PeopleIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading dashboard data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1">
                Supervisor Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Team management and oversight
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mr: 1 }}
              >
                Add Team Member
              </Button>
              <IconButton onClick={fetchDashboardData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Facility Information */}
          <FacilitySelector 
            onFacilityChange={(facilityId) => {
              console.log('Supervisor facility context:', facilityId);
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
                      <Typography variant="h4">{stats.teamMembers}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team Members
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        {stats.activeTeamMembers} active
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
                      <Typography variant="h4">{stats.facilitiesManaged}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Facilities Managed
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
                      <Typography variant="h4">{stats.pendingApprovals}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Approvals
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
                      <Typography variant="h4">{stats.teamPerformance}%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team Performance
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats.teamPerformance}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Team Members */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Team Members
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => console.log('Add team member')}
                  >
                    Add Member
                  </Button>
                </Box>
                
                {teamMembers.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    py: 6,
                    textAlign: 'center'
                  }}>
                    <EmptyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Team Members Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                      Start building your team by adding members to your facilities. You can assign roles and manage their access.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => console.log('Add first team member')}
                    >
                      Add Your First Team Member
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {teamMembers.map((member) => (
                      <ListItem key={member.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getRoleIcon(member.role)}
                        </ListItemIcon>
                        <ListItemText
                          primary={member.name}
                          secondary={`${member.role} • Last active: ${member.lastActivity}`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={member.status}
                            color={getStatusColor(member.status) as any}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {member.performance}% performance
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
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
                    <ListItemText primary="Manage Team" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText primary="View Facilities" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Assign Tasks" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Schedule Review" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SupervisorDashboard;
