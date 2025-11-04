import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person,
  CalendarToday,
  Home,
  LocalHospital,
  Phone,
  HealthAndSafety,
  Warning,
  Restaurant,
  Accessible,
  AccountBox,
} from '@mui/icons-material';

interface ResidentInfoProps {
  resident: any;
}

const ResidentInfo: React.FC<ResidentInfoProps> = ({ resident }) => {
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years old`;
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

  const infoRows = [
    { label: 'Full Name', value: `${resident.firstName} ${resident.lastName}`, icon: <Person /> },
    { label: 'Date of Birth', value: `${formatDate(resident.dob)} (${calculateAge(resident.dob)})`, icon: <CalendarToday /> },
    { label: 'Gender', value: resident.gender ? resident.gender.charAt(0).toUpperCase() + resident.gender.slice(1) : 'N/A', icon: <Person /> },
    { label: 'Room Number', value: resident.roomNumber || 'N/A', icon: <Home /> },
    { label: 'Status', value: resident.status, icon: <HealthAndSafety />, isStatus: true },
    { label: 'Admission Date', value: formatDate(resident.admissionDate), icon: <CalendarToday /> },
    { label: 'Discharge Date', value: formatDate(resident.dischargeDate), icon: <CalendarToday /> },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Resident Information
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Information - Only show fields not in sidebar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Basic Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                        <Box component="span" sx={{ mr: 1, verticalAlign: 'middle' }}><Person /></Box>
                        Full Name
                      </TableCell>
                      <TableCell>{resident.firstName} {resident.lastName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                        <Box component="span" sx={{ mr: 1, verticalAlign: 'middle' }}><CalendarToday /></Box>
                        Admission Date
                      </TableCell>
                      <TableCell>{formatDate(resident.admissionDate)}</TableCell>
                    </TableRow>
                    {resident.dischargeDate && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                          <Box component="span" sx={{ mr: 1, verticalAlign: 'middle' }}><CalendarToday /></Box>
                          Discharge Date
                        </TableCell>
                        <TableCell>{formatDate(resident.dischargeDate)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Information - Only show full details, sidebar shows summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospital /> Medical Information Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {resident.allergies ? (
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Warning sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Allergies
                      </Typography>
                    </Box>
                    <Typography variant="body2">{resident.allergies}</Typography>
                  </Paper>
                ) : (
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary">No allergies recorded</Typography>
                  </Paper>
                )}

                {resident.dietaryRestrictions ? (
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Restaurant sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Dietary Restrictions
                      </Typography>
                    </Box>
                    <Typography variant="body2">{resident.dietaryRestrictions}</Typography>
                  </Paper>
                ) : (
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary">No dietary restrictions recorded</Typography>
                  </Paper>
                )}

                {resident.diagnosis ? (
                  <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <HealthAndSafety sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Diagnosis
                      </Typography>
                    </Box>
                    <Typography variant="body2">{resident.diagnosis}</Typography>
                  </Paper>
                ) : (
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary">No diagnosis recorded</Typography>
                  </Paper>
                )}

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  {resident.mobilityLevel && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Mobility Level
                      </Typography>
                      <Chip
                        label={resident.mobilityLevel.replace('_', ' ').toUpperCase()}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                  {resident.careLevel && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Care Level
                      </Typography>
                      <Chip
                        label={resident.careLevel.replace('_', ' ').toUpperCase()}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        {(resident.emergencyContactName || resident.emergencyContactPhone) && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone /> Emergency Contact
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {resident.emergencyContactName && (
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                            Contact Name
                          </TableCell>
                          <TableCell>{resident.emergencyContactName}</TableCell>
                        </TableRow>
                      )}
                      {resident.emergencyContactPhone && (
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                            Phone Number
                          </TableCell>
                          <TableCell>{resident.emergencyContactPhone}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Insurance Information */}
        {(resident.insuranceProvider || resident.policyNumber) && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBox /> Insurance Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {resident.insuranceProvider && (
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                            Provider
                          </TableCell>
                          <TableCell>{resident.insuranceProvider}</TableCell>
                        </TableRow>
                      )}
                      {resident.policyNumber && (
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                            Policy Number
                          </TableCell>
                          <TableCell>{resident.policyNumber}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ResidentInfo;
