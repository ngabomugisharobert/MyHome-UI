import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Phone,
  Email,
  People,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';

interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
}

interface FacilitySelectorProps {
  onFacilityChange?: (facilityId: string | null) => void;
  showCurrentSelection?: boolean;
}

const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  onFacilityChange,
  showCurrentSelection = true,
}) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFacilities = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/facility-access/user/${user.id}/facilities`);
      
      if (response.data.success) {
        setFacilities(response.data.data.facilities);
        
        // If user is a doctor and has a selected facility, set it
        if (user.role === 'doctor' && user.facilityId) {
          setSelectedFacilityId(user.facilityId);
        }
      } else {
        throw new Error(response.data.message || 'Failed to load facilities');
      }
    } catch (error: any) {
      console.error('Error loading facilities:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load facilities');
      showError('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    if (user) {
      loadFacilities();
      // Set current facility if user has one
      if (user.facilityId) {
        setSelectedFacilityId(user.facilityId);
      }
    }
  }, [user, loadFacilities]);

  const handleFacilityChange = async (facilityId: string) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      if (user.role === 'doctor') {
        // For doctors, update their selected facility
        const response = await api.put(`/facility-access/doctor/${user.id}/facility`, {
          facilityId: facilityId || null
        });

        if (response.data.success) {
          setSelectedFacilityId(facilityId);
          showSuccess('Facility selection updated successfully');
          onFacilityChange?.(facilityId);
        } else {
          throw new Error(response.data.message || 'Failed to update facility selection');
        }
      } else {
        // For other roles, just update the local state
        setSelectedFacilityId(facilityId);
        onFacilityChange?.(facilityId);
      }
    } catch (error: any) {
      console.error('Error updating facility selection:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update facility selection');
      showError('Failed to update facility selection');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleSpecificMessage = () => {
    switch (user?.role) {
      case 'doctor':
        return 'Select a facility to view its data';
      case 'supervisor':
        return 'Your owned facilities';
      case 'caregiver':
        return 'Your assigned facility';
      case 'admin':
        return 'All facilities';
      default:
        return 'Available facilities';
    }
  };

  const getSelectedFacility = () => {
    return facilities.find(f => f.id === selectedFacilityId);
  };

  if (!user) {
    return null;
  }

  // For caregivers and supervisors with single facility, show info instead of selector
  if ((user.role === 'caregiver' || user.role === 'supervisor') && facilities.length === 1) {
    const facility = facilities[0];
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Business sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="div">
              {user.role === 'caregiver' ? 'Your Assigned Facility' : 'Your Facility'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {facility.name}
            </Typography>
            <Chip 
              label={`${facility.capacity} capacity`} 
              size="small" 
              sx={{ ml: 1 }}
              color="primary"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {facility.address}
            </Typography>
          </Box>
          
          {facility.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Phone sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {facility.phone}
              </Typography>
            </Box>
          )}
          
          {facility.email && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {facility.email}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Business sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Facility Selection
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {getRoleSpecificMessage()}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth disabled={isLoading}>
          <InputLabel>Select Facility</InputLabel>
          <Select
            value={selectedFacilityId}
            onChange={(e) => handleFacilityChange(e.target.value)}
            label="Select Facility"
          >
            {user.role === 'doctor' && (
              <MenuItem value="">
                <em>All Facilities (No Filter)</em>
              </MenuItem>
            )}
            {facilities.map((facility) => (
              <MenuItem key={facility.id} value={facility.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {facility.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {facility.address}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${facility.capacity}`} 
                    size="small" 
                    color="primary"
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {showCurrentSelection && getSelectedFacility() && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
              Currently Selected:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="body2">
                {getSelectedFacility()?.name}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FacilitySelector;
