import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Info,
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
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [physicians, setPhysicians] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loadingPhysicians, setLoadingPhysicians] = useState(false);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string; address?: string }>>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    photoUrl: '',
    admissionDate: '',
    dischargeDate: '',
    roomNumber: '',
    facilityId: '',
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
    fetchPhysicians();
  }, []);

  const fetchPhysicians = async () => {
    if (!user) return;
    
    setLoadingPhysicians(true);
    try {
      const response = await api.get('/residents/physicians');
      if (response.data.success) {
        setPhysicians(response.data.data.physicians || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch physicians:', err);
      // Don't show error to user - it's optional
    } finally {
      setLoadingPhysicians(false);
    }
  };

  const fetchFacilities = async () => {
    if (!user) return;
    
    setLoadingFacilities(true);
    try {
      const response = await api.get(`/facility-access/user/${user.id}/facilities`);
      if (response.data.success) {
        const facilitiesList = response.data.data.facilities || [];
        setFacilities(facilitiesList);
        
        // Auto-select facility if user has only one facility or has a current facilityId
        if (facilitiesList.length === 1) {
          setFormData(prev => ({ ...prev, facilityId: facilitiesList[0].id }));
        } else if (user.facilityId && facilitiesList.some((f: { id: string }) => f.id === user.facilityId)) {
          setFormData(prev => ({ ...prev, facilityId: user.facilityId || '' }));
        }
      }
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      showError('Failed to load facilities');
    } finally {
      setLoadingFacilities(false);
    }
  };

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
      facilityId: '',
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
    fetchPhysicians();
    fetchFacilities();
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({
      firstName: resident.firstName || '',
      lastName: resident.lastName || '',
      dob: resident.dob ? resident.dob.split('T')[0] : '',
      gender: resident.gender || '',
      photoUrl: resident.photoUrl || '',
      admissionDate: resident.admissionDate ? resident.admissionDate.split('T')[0] : '',
      dischargeDate: resident.dischargeDate ? resident.dischargeDate.split('T')[0] : '',
      roomNumber: resident.roomNumber || '',
      facilityId: resident.facilityId || '',
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
    fetchPhysicians();
    fetchFacilities();
  };

  const handleSaveResident = async () => {
    try {
      // Validate required fields
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        showError('First name and last name are required');
        return;
      }

      // Primary physician is now selected from dropdown, so validation is not needed
      // Empty value is allowed (can be added later)

      // Validate facilityId for new residents - use the selected facility ID directly
      if (!selectedResident && !formData.facilityId) {
        showError('Please select a facility');
        return;
      }

      setSaving(true);

      if (selectedResident) {
        // For updates, use the facilityId from form if provided
        const updateData = {
          ...formData,
          dob: formData.dob || null,
          gender: formData.gender || null,
          photoUrl: formData.photoUrl || null,
          admissionDate: formData.admissionDate || null,
          dischargeDate: formData.dischargeDate || null,
          roomNumber: formData.roomNumber || null,
          facilityId: formData.facilityId || undefined, // Use selected facility ID, or undefined to keep existing
          primaryPhysician: formData.primaryPhysician && formData.primaryPhysician.trim() 
            ? formData.primaryPhysician.trim() 
            : null,
          emergencyContactName: formData.emergencyContactName || null,
          emergencyContactPhone: formData.emergencyContactPhone || null,
          diagnosis: formData.diagnosis || null,
          allergies: formData.allergies || null,
          dietaryRestrictions: formData.dietaryRestrictions || null,
          mobilityLevel: formData.mobilityLevel || null,
          careLevel: formData.careLevel || null,
          insuranceProvider: formData.insuranceProvider || null,
          policyNumber: formData.policyNumber || null,
        };
        await api.put(`/residents/${selectedResident.id}`, updateData);
        showSuccess('Resident updated successfully');
      } else {
        // For new residents, use the selected facility ID directly from the form
        const residentData = {
          ...formData,
          // Remove empty strings for optional fields, send null instead
          dob: formData.dob || null,
          gender: formData.gender || null,
          photoUrl: formData.photoUrl || null,
          admissionDate: formData.admissionDate || null,
          dischargeDate: formData.dischargeDate || null,
          roomNumber: formData.roomNumber || null,
          facilityId: formData.facilityId, // Use the selected facility ID directly (foreign key)
          primaryPhysician: formData.primaryPhysician && formData.primaryPhysician.trim() 
            ? formData.primaryPhysician.trim() 
            : null,
          emergencyContactName: formData.emergencyContactName || null,
          emergencyContactPhone: formData.emergencyContactPhone || null,
          diagnosis: formData.diagnosis || null,
          allergies: formData.allergies || null,
          dietaryRestrictions: formData.dietaryRestrictions || null,
          mobilityLevel: formData.mobilityLevel || null,
          careLevel: formData.careLevel || null,
          insuranceProvider: formData.insuranceProvider || null,
          policyNumber: formData.policyNumber || null,
        };
        console.log('📤 Sending resident data:', residentData);
        await api.post('/residents', residentData);
        showSuccess('Resident created successfully');
      }
      setOpenDialog(false);
      fetchResidents();
    } catch (err: any) {
      console.error('❌ Save resident error:', err);
      showError(err.response?.data?.message || 'Failed to save resident');
    } finally {
      setSaving(false);
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
      setDeleting(true);
      await api.delete(`/residents/${residentToDelete.id}`);
      showSuccess('Resident deleted successfully (soft delete - can be restored)');
      setOpenDeleteDialog(false);
      setResidentToDelete(null);
      fetchResidents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete resident');
    } finally {
      setDeleting(false);
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
            {residents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Person sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                      No residents found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                      {error 
                        ? 'Failed to load residents. Please try again or contact support if the problem persists.'
                        : 'Get started by adding your first resident to the facility.'}
                    </Typography>
                    {!error && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateResident}
                        sx={{ mt: 2 }}
                      >
                        Add First Resident
                      </Button>
                    )}
                    {error && (
                      <Button
                        variant="outlined"
                        onClick={fetchResidents}
                        sx={{ mt: 2 }}
                      >
                        Retry
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
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
                  <Tooltip title="View Details (Documents, Contacts, Medications, Care Plans)">
                    <IconButton 
                      onClick={() => navigate(`/residents/${resident.id}`)}
                      color="primary"
                    >
                      <Info />
                    </IconButton>
                  </Tooltip>
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
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Resident Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !saving && setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
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
                <FormControl fullWidth required={!selectedResident}>
                  <InputLabel>Facility</InputLabel>
                  <Select
                    value={formData.facilityId || ''}
                    onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                    label="Facility"
                    disabled={loadingFacilities || (!user || (user.role !== 'admin' && user.role !== 'doctor' && facilities.length === 1))}
                  >
                    {facilities.map((facility) => (
                      <MenuItem key={facility.id} value={facility.id}>
                        {facility.name} {facility.address ? `(${facility.address})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingFacilities && (
                    <CircularProgress size={20} sx={{ position: 'absolute', right: 24, top: 40 }} />
                  )}
                  {facilities.length === 0 && !loadingFacilities && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 1.5, display: 'block' }}>
                      No facilities available. Please contact an administrator.
                    </Typography>
                  )}
                </FormControl>
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
                <FormControl fullWidth>
                  <InputLabel>Primary Physician</InputLabel>
                  <Select
                    value={formData.primaryPhysician || ''}
                    onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value || '' })}
                    label="Primary Physician"
                    disabled={loadingPhysicians}
                  >
                    <MenuItem value="">
                      <em>None (Can be added later)</em>
                    </MenuItem>
                    {physicians.map((physician) => (
                      <MenuItem key={physician.id} value={physician.id}>
                        {physician.name} ({physician.email})
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingPhysicians && (
                    <CircularProgress size={20} sx={{ position: 'absolute', right: 24, top: 40 }} />
                  )}
                  {physicians.length === 0 && !loadingPhysicians && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 1.5, display: 'block' }}>
                      No physicians available. Can be added later.
                    </Typography>
                  )}
                </FormControl>
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
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveResident}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? (selectedResident ? 'Updating...' : 'Creating...') : (selectedResident ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => !deleting && handleDeleteCancel()}
      >
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
          <Button onClick={handleDeleteCancel} variant="outlined" disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityResidents;



