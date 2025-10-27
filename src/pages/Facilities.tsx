import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add,
  Edit,
  Business,
  LocationOn,
  Phone,
  Email,
  People,
  Person,
  Security,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Facility, FacilityListResponse } from '../types';
import api from '../services/api';

const Facilities: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    licenseNumber: '',
    capacity: 0,
    ownerId: '',
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      
      // Only admin and supervisor can access all facilities
      if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        setError('Access denied: Admin or Supervisor role required');
        return;
      }
      
      const response = await api.get<FacilityListResponse>('/facilities');
      if (response.data.success) {
        setFacilities(response.data.data.facilities);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setFormData({
      name: facility.name,
      address: facility.address || '',
      phone: facility.phone || '',
      email: facility.email || '',
      licenseNumber: facility.licenseNumber || '',
      capacity: facility.capacity,
      ownerId: facility.ownerId || '',
    });
    setOpenDialog(true);
  };

  const handleCreateFacility = () => {
    setSelectedFacility(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      licenseNumber: '',
      capacity: 0,
      ownerId: '',
    });
    setOpenDialog(true);
  };

  const handleSaveFacility = async () => {
    try {
      if (selectedFacility) {
        // Update existing facility
        await api.put(`/facilities/${selectedFacility.id}`, formData);
        showSuccess('Facility updated successfully');
      } else {
        // Create new facility
        await api.post('/facilities', formData);
        showSuccess('Facility created successfully');
      }
      setOpenDialog(false);
      fetchFacilities();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save facility');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFacility(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Facilities</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateFacility}
        >
          Add Facility
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {facilities.map((facility) => (
          <Grid item xs={12} md={6} lg={4} key={facility.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Business />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {facility.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={facility.status.toUpperCase()}
                        color={getStatusColor(facility.status) as any}
                        size="small"
                      />
                      {facility.owner && (
                        <Chip
                          icon={<Person />}
                          label={`Owner: ${facility.owner.name}`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton onClick={() => handleEditFacility(facility)}>
                    <Edit />
                  </IconButton>
                </Box>

                {facility.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {facility.address}
                    </Typography>
                  </Box>
                )}

                {facility.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {facility.phone}
                    </Typography>
                  </Box>
                )}

                {facility.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {facility.email}
                    </Typography>
                  </Box>
                )}

                {facility.licenseNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Security sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      License: {facility.licenseNumber}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {facility.capacity}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <People sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {facility.userCount || 0} staff members
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Facility Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFacility ? 'Edit Facility' : 'Add New Facility'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Facility Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="License Number"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Owner ID (Optional)"
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              helperText="Enter the user ID of the facility owner"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFacility}>
            {selectedFacility ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Facilities;
