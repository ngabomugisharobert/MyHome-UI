import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Button,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  LocalHospital as DoctorIcon,
  Person as CaregiverIcon,
  SupervisorAccount as SupervisorIcon,
  Business as FacilityIcon,
  PersonAdd as Caregiver2Icon
} from '@mui/icons-material';

interface TestCredentialsProps {
  onFillCredentials?: (email: string, password: string) => void;
}

const TestCredentials: React.FC<TestCredentialsProps> = ({ onFillCredentials }) => {
  const credentials = [
    {
      role: 'Admin',
      email: 'admin@myhome.com',
      password: 'password123',
      icon: <AdminIcon />,
      color: 'error' as const,
      description: 'Full system access'
    },
    {
      role: 'Doctor',
      email: 'doctor@myhome.com',
      password: 'password123',
      icon: <DoctorIcon />,
      color: 'info' as const,
      description: 'Medical staff access'
    },
    {
      role: 'Caregiver',
      email: 'caregiver1@myhome.com',
      password: 'password123',
      icon: <CaregiverIcon />,
      color: 'success' as const,
      description: 'Patient care access'
    },
    {
      role: 'Supervisor',
      email: 'supervisor@myhome.com',
      password: 'password123',
      icon: <SupervisorIcon />,
      color: 'warning' as const,
      description: 'Team management access'
    },
    {
      role: 'Facility Owner',
      email: 'owner@greenvillehealthcare.com',
      password: 'facility123',
      icon: <FacilityIcon />,
      color: 'primary' as const,
      description: 'Facility-specific access'
    },
    {
      role: 'Caregiver 2',
      email: 'caregiver2@myhome.com',
      password: 'password123',
      icon: <Caregiver2Icon />,
      color: 'success' as const,
      description: 'Additional caregiver'
    }
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Test Credentials
          </Typography>
          <Chip 
            label="Development Only" 
            color="warning" 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click any credential below to test different user roles and permissions:
        </Typography>

        <Grid container spacing={2}>
          {credentials.map((cred, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
                onClick={() => onFillCredentials?.(cred.email, cred.password)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {cred.icon}
                  <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {cred.role}
                  </Typography>
                  <Chip 
                    label={cred.role} 
                    color={cred.color} 
                    size="small" 
                    sx={{ ml: 'auto' }} 
                  />
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  <strong>Email:</strong> {cred.email}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  <strong>Password:</strong> {cred.password}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="caption" color="text.secondary">
                  {cred.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.contrastText">
            <strong>Note:</strong> These are test credentials for development purposes only. 
            The Facility Owner role demonstrates RBAC with facility-specific data filtering.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestCredentials;

