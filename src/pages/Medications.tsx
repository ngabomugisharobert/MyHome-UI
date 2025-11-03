import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'other';
  route: 'oral' | 'intramuscular' | 'intravenous' | 'subcutaneous' | 'topical' | 'inhalation' | 'other';
  strength?: string;
  manufacturer?: string;
  ndcNumber?: string;
  status: 'active' | 'inactive' | 'discontinued';
  facility?: {
    id: string;
    name: string;
  };
}

const Medications: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    dosage: '',
    form: 'tablet' as Medication['form'],
    route: 'oral' as Medication['route'],
    strength: '',
    manufacturer: '',
    ndcNumber: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/medications');
      if (response.data.success) {
        setMedications(response.data.data.medications || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch medications');
      showError('Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (medication?: Medication) => {
    if (medication) {
      setEditingMedication(medication);
      setFormData({
        name: medication.name,
        genericName: medication.genericName || '',
        dosage: medication.dosage,
        form: medication.form,
        route: medication.route,
        strength: medication.strength || '',
        manufacturer: medication.manufacturer || '',
        ndcNumber: medication.ndcNumber || '',
      });
    } else {
      setEditingMedication(null);
      setFormData({
        name: '',
        genericName: '',
        dosage: '',
        form: 'tablet',
        route: 'oral',
        strength: '',
        manufacturer: '',
        ndcNumber: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedication(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingMedication) {
        await api.put(`/medications/${editingMedication.id}`, formData);
        showSuccess('Medication updated successfully');
      } else {
        await api.post('/medications', formData);
        showSuccess('Medication created successfully');
      }
      handleCloseDialog();
      fetchMedications();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save medication');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;

    try {
      await api.delete(`/medications/${id}`);
      showSuccess('Medication deleted successfully');
      fetchMedications();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete medication');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'discontinued':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <MedicationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Medications
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Medication
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Generic Name</TableCell>
              <TableCell>Dosage</TableCell>
              <TableCell>Form</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No medications found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              medications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell>{medication.name}</TableCell>
                  <TableCell>{medication.genericName || '-'}</TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell>{medication.form}</TableCell>
                  <TableCell>{medication.route}</TableCell>
                  <TableCell>
                    <Chip
                      label={medication.status}
                      color={getStatusColor(medication.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(medication)}
                        >
                          <EditIcon />
                        </IconButton>
                        {user?.role === 'admin' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(medication.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMedication ? 'Edit Medication' : 'Add New Medication'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Medication Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Generic Name"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Dosage"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              fullWidth
              required
              placeholder="e.g., 50mg, 1 tablet"
            />
            <TextField
              label="Form"
              select
              value={formData.form}
              onChange={(e) => setFormData({ ...formData, form: e.target.value as Medication['form'] })}
              fullWidth
              required
            >
              <MenuItem value="tablet">Tablet</MenuItem>
              <MenuItem value="capsule">Capsule</MenuItem>
              <MenuItem value="liquid">Liquid</MenuItem>
              <MenuItem value="injection">Injection</MenuItem>
              <MenuItem value="topical">Topical</MenuItem>
              <MenuItem value="inhaler">Inhaler</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Route"
              select
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value as Medication['route'] })}
              fullWidth
              required
            >
              <MenuItem value="oral">Oral</MenuItem>
              <MenuItem value="intramuscular">Intramuscular</MenuItem>
              <MenuItem value="intravenous">Intravenous</MenuItem>
              <MenuItem value="subcutaneous">Subcutaneous</MenuItem>
              <MenuItem value="topical">Topical</MenuItem>
              <MenuItem value="inhalation">Inhalation</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Strength"
              value={formData.strength}
              onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              fullWidth
              placeholder="e.g., 50mg/5ml"
            />
            <TextField
              label="Manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              fullWidth
            />
            <TextField
              label="NDC Number"
              value={formData.ndcNumber}
              onChange={(e) => setFormData({ ...formData, ndcNumber: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMedication ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Medications;



