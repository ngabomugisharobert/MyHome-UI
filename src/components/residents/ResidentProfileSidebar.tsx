import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Home,
  LocalHospital,
  Phone,
  Email,
  Warning,
  Restaurant,
  HealthAndSafety,
  AccountBox,
} from '@mui/icons-material';

interface ResidentProfileSidebarProps {
  resident: any;
}

const ResidentProfileSidebar: React.FC<ResidentProfileSidebarProps> = ({ resident }) => {
  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} y.o.`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'discharged':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'background.paper', position: 'relative' }}>
      {/* Profile Header */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Avatar
          src={resident.photoUrl}
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 2,
            border: 3,
            borderColor: 'white',
          }}
        >
          {resident.firstName?.[0]}{resident.lastName?.[0]}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {resident.firstName} {resident.lastName}
        </Typography>
        <Chip
          label={resident.status?.toUpperCase()}
          color={getStatusColor(resident.status)}
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Demographics */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
          DEMOGRAPHICS
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CalendarToday fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Date of Birth"
              secondary={resident.dob ? `${formatDate(resident.dob)} (${calculateAge(resident.dob)})` : 'N/A'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Gender"
              secondary={resident.gender ? resident.gender.charAt(0).toUpperCase() + resident.gender.slice(1) : 'N/A'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Home fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Room Number"
              secondary={resident.roomNumber || 'N/A'}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Medical Information */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
          MEDICAL INFORMATION
        </Typography>

        {resident.allergies && (
          <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Warning fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Allergies
              </Typography>
            </Box>
            <Typography variant="body2">
              {resident.allergies.length > 100
                ? `${resident.allergies.substring(0, 100)}...`
                : resident.allergies}
            </Typography>
          </Paper>
        )}

        {resident.dietaryRestrictions && (
          <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Restaurant fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Dietary Restrictions
              </Typography>
            </Box>
            <Typography variant="body2">
              {resident.dietaryRestrictions.length > 100
                ? `${resident.dietaryRestrictions.substring(0, 100)}...`
                : resident.dietaryRestrictions}
            </Typography>
          </Paper>
        )}

        {resident.diagnosis && (
          <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <HealthAndSafety fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Diagnosis
              </Typography>
            </Box>
            <Typography variant="body2">
              {resident.diagnosis.length > 100
                ? `${resident.diagnosis.substring(0, 100)}...`
                : resident.diagnosis}
            </Typography>
          </Paper>
        )}

        {resident.mobilityLevel && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Mobility Level
            </Typography>
            <Chip
              label={resident.mobilityLevel.replace('_', ' ').toUpperCase()}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {resident.careLevel && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Care Level
            </Typography>
            <Chip
              label={resident.careLevel.replace('_', ' ').toUpperCase()}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Dates */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
          DATES
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CalendarToday fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Admission Date"
              secondary={formatDate(resident.admissionDate)}
            />
          </ListItem>
          {resident.dischargeDate && (
            <ListItem>
              <ListItemIcon>
                <CalendarToday fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Discharge Date"
                secondary={formatDate(resident.dischargeDate)}
              />
            </ListItem>
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Emergency Contact */}
        {resident.emergencyContactName && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
              EMERGENCY CONTACT
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={resident.emergencyContactName}
                  secondary={resident.emergencyContactPhone || 'No phone number'}
                />
              </ListItem>
            </List>
          </>
        )}

        {/* Insurance */}
        {(resident.insuranceProvider || resident.policyNumber) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
              INSURANCE
            </Typography>
            <List dense>
              {resident.insuranceProvider && (
                <ListItem>
                  <ListItemIcon>
                    <AccountBox fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Provider"
                    secondary={resident.insuranceProvider}
                  />
                </ListItem>
              )}
              {resident.policyNumber && (
                <ListItem>
                  <ListItemIcon>
                    <AccountBox fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Policy Number"
                    secondary={resident.policyNumber}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResidentProfileSidebar;

