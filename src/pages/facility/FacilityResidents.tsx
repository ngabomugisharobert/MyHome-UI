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
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  photoUrl?: string;
  admissionDate?: string;
  dischargeDate?: string;
  roomNumber?: string;
  facilityId: string;
  primaryPhysician?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  diagnosis?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  mobilityLevel?: 'independent' | 'assisted' | 'wheelchair' | 'bedridden';
  careLevel?: 'independent' | 'assisted_living' | 'memory_care' | 'skilled_nursing' | 'hospice';
  insuranceProvider?: string;
  policyNumber?: string;
  status: 'active' | 'inactive' | 'discharged';
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    photoUrl: '',
    admissionDate: '',
    dischargeDate: '',
    roomNumber: '',
    primaryPhysician: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    diagnosis: '',
    allergies: '',
    dietaryRestrictions: '',
    mobilityLevel: '',
    careLevel: '',
    insuranceProvider: '',
    policyNumber: '',
    status: 'active',
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
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      photoUrl: '',
      admissionDate: '',
      dischargeDate: '',
      roomNumber: '',
      primaryPhysician: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      diagnosis: '',
      allergies: '',
      dietaryRestrictions: '',
      mobilityLevel: '',
      careLevel: '',
      insuranceProvider: '',
      policyNumber: '',
      status: 'active',
    });
    setOpenDialog(true);
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({
      firstName: resident.firstName || '',
      lastName: resident.lastName || '',
      dob: resident.dob || '',
      gender: resident.gender || '',
      photoUrl: resident.photoUrl || '',
      admissionDate: resident.admissionDate || '',
      dischargeDate: resident.dischargeDate || '',
      roomNumber: resident.roomNumber || '',
      primaryPhysician: resident.primaryPhysician || '',
      emergencyContactName: resident.emergencyContactName || '',
      emergencyContactPhone: resident.emergencyContactPhone || '',
      diagnosis: resident.diagnosis || '',
      allergies: resident.allergies || '',
      dietaryRestrictions: resident.dietaryRestrictions || '',
      mobilityLevel: resident.mobilityLevel || '',
      careLevel: resident.careLevel || '',
      insuranceProvider: resident.insuranceProvider || '',
      policyNumber: resident.policyNumber || '',
      status: resident.status || 'active',
    });
    setOpenDialog(true);
  };

  const handleSaveResident = async () => {
    try {
      if (selectedResident) {
        await api.put(`/residents/${selectedResident.id}`, formData);
        showSuccess('Resident updated successfully');
      } else {
        // Include facilityId when creating a new resident
        const residentData = {
          ...formData,
          ...(user?.facilityId && { facilityId: user.facilityId })
        };
        await api.post('/residents', residentData);
        showSuccess('Resident created successfully');
      }
      setOpenDialog(false);
      fetchResidents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save resident');
    }
  };

  const handleDeleteClick = (resident: Resident) => {
    // Only admins can delete
    if (user?.role !== 'admin') {
      showError('You do not have permission to delete residents. Only administrators can delete residents.');
      return;
    }
    setResidentToDelete(resident);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!residentToDelete) return;
    
    try {
      await api.delete(`/residents/${residentToDelete.id}`);
      showSuccess('Resident deleted successfully (soft delete - can be restored)');
      setOpenDeleteDialog(false);
      setResidentToDelete(null);
      fetchResidents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete resident');
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setResidentToDelete(null);
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
                      {resident.photoUrl ? (
                        <img src={resident.photoUrl} alt={`${resident.firstName} ${resident.lastName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Person />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{resident.firstName} {resident.lastName}</Typography>
                      {resident.dob && (
                        <Typography variant="caption" color="text.secondary">
                          DOB: {new Date(resident.dob).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {resident.roomNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ mr: 1, fontSize: 16 }} />
                      {resident.roomNumber}
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
                  {resident.emergencyContactName && (
                    <Box>
                      <Typography variant="body2">{resident.emergencyContactName}</Typography>
                      {resident.emergencyContactPhone && (
                        <Typography variant="caption" color="text.secondary">
                          {resident.emergencyContactPhone}
                        </Typography>
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
                    <Tooltip title="Edit Resident">
                      <IconButton onClick={() => handleEditResident(resident)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}
                  {user?.role === 'admin' && (
                    <Tooltip title="Delete Resident">
                      <IconButton onClick={() => handleDeleteClick(resident)} color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
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
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Photo URL"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admission Date"
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discharge Date"
                  type="date"
                  value={formData.dischargeDate}
                  onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="discharged">Discharged</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Physician (User ID)"
                  value={formData.primaryPhysician}
                  onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Diagnosis"
                  multiline
                  rows={3}
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dietary Restrictions"
                  multiline
                  rows={2}
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Mobility Level</InputLabel>
                  <Select
                    value={formData.mobilityLevel}
                    onChange={(e) => setFormData({ ...formData, mobilityLevel: e.target.value })}
                  >
                    <MenuItem value="independent">Independent</MenuItem>
                    <MenuItem value="assisted">Assisted</MenuItem>
                    <MenuItem value="wheelchair">Wheelchair</MenuItem>
                    <MenuItem value="bedridden">Bedridden</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Care Level</InputLabel>
                  <Select
                    value={formData.careLevel}
                    onChange={(e) => setFormData({ ...formData, careLevel: e.target.value })}
                  >
                    <MenuItem value="independent">Independent</MenuItem>
                    <MenuItem value="assisted_living">Assisted Living</MenuItem>
                    <MenuItem value="memory_care">Memory Care</MenuItem>
                    <MenuItem value="skilled_nursing">Skilled Nursing</MenuItem>
                    <MenuItem value="hospice">Hospice</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Resident</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>
              {residentToDelete?.firstName} {residentToDelete?.lastName}
            </strong>?
            <br />
            <br />
            This will mark the resident as deleted (soft delete). The record will be hidden but can be restored later.
            <br />
            <br />
            <Typography variant="caption" color="text.secondary">
              Note: Only admins can delete residents.
            </Typography>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityResidents;



