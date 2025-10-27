import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon,
  LocalHospital as DoctorIcon,
  Accessibility as CaregiverIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface FacilityData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  capacity: number;
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FacilityStats {
  totalStaff: number;
  activeStaff: number;
  capacity: number;
  utilizationRate: number;
  staffByRole: Record<string, number>;
}

interface FacilityOverview {
  facility: FacilityData;
  statistics: FacilityStats;
}

const FacilityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [overview, setOverview] = useState<FacilityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [editData, setEditData] = useState<Partial<FacilityData>>({});
  const [assignData, setAssignData] = useState({ ownerId: '' });

  useEffect(() => {
    if (user?.facilityId) {
      fetchFacilityOverview();
    }
  }, [user?.facilityId]);

  const fetchFacilityOverview = async () => {
    try {
      setLoading(true);
      
      // Only admin and supervisor can access facility overview
      if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        setError('Access denied: Admin or Supervisor role required');
        return;
      }
      
      const response = await api.get(`/facilities/${user?.facilityId}/overview`);
      if (response.data.success) {
        setOverview(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch facility overview');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFacility = () => {
    if (overview) {
      setEditData({
        name: overview.facility.name,
        address: overview.facility.address,
        phone: overview.facility.phone,
        email: overview.facility.email,
        licenseNumber: overview.facility.licenseNumber,
        capacity: overview.facility.capacity,
      });
      setOpenEditDialog(true);
    }
  };

  const handleSaveFacility = async () => {
    try {
      await api.put(`/facilities/${user?.facilityId}`, editData);
      showSuccess('Facility updated successfully');
      setOpenEditDialog(false);
      fetchFacilityOverview();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update facility');
    }
  };

  const handleAssignOwner = async () => {
    try {
      await api.put(`/facilities/${user?.facilityId}/assign-owner`, assignData);
      showSuccess('Owner assigned successfully');
      setOpenAssignDialog(false);
      fetchFacilityOverview();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to assign owner');
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
      case 'admin': return <SecurityIcon />;
      case 'supervisor': return <SupervisorIcon />;
      case 'doctor': return <DoctorIcon />;
      case 'caregiver': return <CaregiverIcon />;
      default: return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!overview) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No facility data available
      </Alert>
    );
  }

  const { facility, statistics } = overview;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {facility.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                label={facility.status.toUpperCase()}
                color={getStatusColor(facility.status) as any}
                size="small"
              />
              {facility.owner && (
                <Chip
                  icon={<PersonIcon />}
                  label={`Owner: ${facility.owner.name}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box>
          <IconButton onClick={handleEditFacility} color="primary">
            <EditIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{statistics.totalStaff}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Staff
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
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{statistics.activeStaff}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Staff
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{facility.capacity}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Capacity
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
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{statistics.utilizationRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Utilization
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Facility Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Facility Information
              </Typography>
              <List>
                {facility.address && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={facility.address}
                    />
                  </ListItem>
                )}
                {facility.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={facility.phone}
                    />
                  </ListItem>
                )}
                {facility.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={facility.email}
                    />
                  </ListItem>
                )}
                {facility.licenseNumber && (
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="License Number"
                      secondary={facility.licenseNumber}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staff by Role
              </Typography>
              {Object.entries(statistics.staffByRole).map(([role, count]) => (
                <Box key={role} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getRoleIcon(role)}
                    <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {role.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 'auto' }}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / statistics.totalStaff) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Facility Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Facility</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Facility Name"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={editData.capacity || 0}
                onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={editData.address || ''}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="License Number"
                value={editData.licenseNumber || ''}
                onChange={(e) => setEditData({ ...editData, licenseNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFacility} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Owner Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
        <DialogTitle>Assign Owner</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Owner ID"
            value={assignData.ownerId}
            onChange={(e) => setAssignData({ ownerId: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignOwner} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityDashboard;
