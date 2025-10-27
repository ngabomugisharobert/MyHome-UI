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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  Person,
  Room,
  Phone,
  Email,
  Warning,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Resident {
  id: string;
  name: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  room?: string;
  status: 'active' | 'inactive' | 'discharged';
  admissionDate?: string;
  dischargeDate?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const FacilityResidents: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    room: '',
    medicalConditions: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/residents');
      if (response.data.success) {
        setResidents(response.data.data.residents);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch residents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResident = () => {
    setSelectedResident(null);
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: '',
      room: '',
      medicalConditions: '',
      allergies: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({
      name: resident.name,
      dateOfBirth: resident.dateOfBirth || '',
      gender: resident.gender || '',
      room: resident.room || '',
      medicalConditions: resident.medicalConditions || '',
      allergies: resident.allergies || '',
      emergencyContact: resident.emergencyContact || '',
      emergencyPhone: resident.emergencyPhone || '',
      notes: resident.notes || '',
    });
    setOpenDialog(true);
  };

  const handleSaveResident = async () => {
    try {
      if (selectedResident) {
        await api.put(`/residents/${selectedResident.id}`, formData);
        showSuccess('Resident updated successfully');
      } else {
        await api.post('/residents', formData);
        showSuccess('Resident created successfully');
      }
      setOpenDialog(false);
      fetchResidents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save resident');
    }
  };

  const handleDeleteResident = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resident?')) {
      try {
        await api.delete(`/residents/${id}`);
        showSuccess('Resident deleted successfully');
        fetchResidents();
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to delete resident');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discharged': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'inactive': return <Warning />;
      case 'discharged': return <Cancel />;
      default: return <Person />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Residents Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage facility residents and their information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateResident}
        >
          Add Resident
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Residents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Admission Date</TableCell>
              <TableCell>Emergency Contact</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{resident.name}</Typography>
                      {resident.dateOfBirth && (
                        <Typography variant="caption" color="text.secondary">
                          DOB: {new Date(resident.dateOfBirth).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {resident.room && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ mr: 1, fontSize: 16 }} />
                      {resident.room}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(resident.status)}
                    label={resident.status.toUpperCase()}
                    color={getStatusColor(resident.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {resident.admissionDate && new Date(resident.admissionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {resident.emergencyContact && (
                    <Box>
                      <Typography variant="body2">{resident.emergencyContact}</Typography>
                      {resident.emergencyPhone && (
                        <Typography variant="caption" color="text.secondary">
                          {resident.emergencyPhone}
                        </Typography>
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Resident">
                    <IconButton onClick={() => handleEditResident(resident)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Resident">
                    <IconButton onClick={() => handleDeleteResident(resident.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Resident Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedResident ? 'Edit Resident' : 'Add New Resident'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Conditions"
                  multiline
                  rows={3}
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies"
                  multiline
                  rows={2}
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Phone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveResident}>
            {selectedResident ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityResidents;
