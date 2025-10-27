import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Contacts as ContactsIcon,
  Description as DescriptionIcon,
  Task as TaskIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface FacilityData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  isActive: boolean;
}

interface FacilityStats {
  totalUsers: number;
  totalResidents: number;
  activeUsers: number;
}

const FacilityOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [stats, setStats] = useState<FacilityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilityData = async () => {
      if (!user) return; // Add null check
      
      try {
        setLoading(true);
        
        // Fetch facility information using the new facility access API
        const facilityResponse = await api.get(`/facility-access/user/${user.id}/facilities`);
        if (facilityResponse.data.success && facilityResponse.data.data.facilities.length > 0) {
          const facilityData = facilityResponse.data.data.facilities[0];
          setFacility(facilityData);
          
          // Fetch facility statistics - use facility-specific users endpoint
          const usersResponse = await api.get(`/users/facility/${facilityData.id}`);
          if (usersResponse.data.success) {
            const users = usersResponse.data.data.users;
            setStats({
              totalUsers: users.length,
              activeUsers: users.filter((u: any) => u.isActive).length,
              totalResidents: 0 // This would come from a residents endpoint
            });
          }
        }

      } catch (err: any) {
        console.error('Error fetching facility data:', err);
        setError('Failed to load facility data');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityData();
  }, [user]); // Add user as dependency

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Message */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Facility Owner Dashboard - {facility?.name}
        </Typography>
      </Box>

      {/* Facility Information Card */}
      {facility && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="h2">
                Facility Information
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Facility Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {facility.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  License Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {facility.licenseNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {facility.address}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Contact
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {facility.phone} | {facility.email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Status:
                  </Typography>
                  <Chip
                    label={facility.isActive ? 'Active' : 'Inactive'}
                    color={facility.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.totalResidents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Residents
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Quick Access Cards */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, mt: 4 }}>
        Facility Management
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Residents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage facility residents and their information
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ContactsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Contacts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage emergency contacts and facility contacts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <DescriptionIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage facility documents and files
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TaskIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage facility tasks and assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Inspections
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage facility inspections and compliance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Facility Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage facility staff and users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RBAC Notice */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Data Isolation:</strong> As a facility owner, you can only view and manage data 
          for your assigned facility. This ensures proper data security and privacy.
        </Typography>
      </Alert>
    </Box>
  );
};

export default FacilityOwnerDashboard;
