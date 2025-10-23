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
} from '@mui/material';
import {
  Add,
  Edit,
  Business,
  LocationOn,
  Phone,
  Email,
  People,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Facility, FacilityListResponse } from '../types';
import api from '../services/api';

const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
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
    setOpenDialog(true);
  };

  // const handleDeleteFacility = (facility: Facility) => {
  //   // Implement delete functionality
  //   console.log('Delete facility:', facility);
  // };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFacility(null);
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
          onClick={() => setOpenDialog(true)}
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
                    <Chip
                      label={facility.isActive ? 'Active' : 'Inactive'}
                      color={facility.isActive ? 'success' : 'error'}
                      size="small"
                    />
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    License: {facility.licenseNumber}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <People sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {facility.userCount || 0} users
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
              defaultValue={selectedFacility?.name || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              defaultValue={selectedFacility?.address || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              defaultValue={selectedFacility?.phone || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue={selectedFacility?.email || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="License Number"
              defaultValue={selectedFacility?.licenseNumber || ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained">
            {selectedFacility ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Facilities;
