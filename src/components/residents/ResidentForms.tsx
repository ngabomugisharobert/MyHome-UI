import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
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
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit,
  Delete,
  HowToReg,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ResidentFormsProps {
  residentId: string;
}

const ResidentForms: React.FC<ResidentFormsProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [formData, setFormData] = useState({
    formType: '',
    title: '',
    description: '',
    status: 'draft',
    expiryDate: '',
  });

  useEffect(() => {
    fetchForms();
  }, [residentId]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/resident-forms/resident/${residentId}`);
      if (response.data.success) {
        setForms(response.data.data.forms || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch forms:', error);
      showError('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (form?: any) => {
    if (form) {
      setSelectedForm(form);
      setFormData({
        formType: form.formType || '',
        title: form.title || '',
        description: form.description || '',
        status: form.status || 'draft',
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString().split('T')[0] : '',
      });
    } else {
      setSelectedForm(null);
      setFormData({
        formType: '',
        title: '',
        description: '',
        status: 'draft',
        expiryDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedForm(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        formData: {}, // Empty form data for now, can be expanded
      };

      if (selectedForm) {
        await api.put(`/resident-forms/${selectedForm.id}`, data);
        showSuccess('Form updated successfully');
      } else {
        await api.post(`/resident-forms/resident/${residentId}`, data);
        showSuccess('Form created successfully');
      }
      handleCloseDialog();
      fetchForms();
    } catch (error: any) {
      console.error('Failed to save form:', error);
      showError(error.response?.data?.message || 'Failed to save form');
    }
  };

  const handleSign = async (id: string) => {
    try {
      await api.post(`/resident-forms/${id}/sign`);
      showSuccess('Form signed successfully');
      fetchForms();
    } catch (error: any) {
      console.error('Failed to sign form:', error);
      showError('Failed to sign form');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      await api.delete(`/resident-forms/${id}`);
      showSuccess('Form deleted successfully');
      fetchForms();
    } catch (error: any) {
      console.error('Failed to delete form:', error);
      showError('Failed to delete form');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'success';
      case 'pending_signature':
        return 'warning';
      case 'expired':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Forms
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Form
          </Button>
        )}
      </Box>

      {forms.length === 0 ? (
        <Alert severity="info">No forms found for this resident.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Signed Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    {form.formType?.replace('_', ' ').toUpperCase()}
                  </TableCell>
                  <TableCell>{form.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={form.status?.toUpperCase()}
                      color={getStatusColor(form.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {form.signedDate ? new Date(form.signedDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(form)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {form.status === 'pending_signature' && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleSign(form.id)}
                        title="Sign Form"
                      >
                        <HowToReg fontSize="small" />
                      </IconButton>
                    )}
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(form.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedForm ? 'Edit Form' : 'Add Form'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Form Type"
                value={formData.formType}
                onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                required
              >
                <MenuItem value="admission">Admission</MenuItem>
                <MenuItem value="consent">Consent</MenuItem>
                <MenuItem value="authorization">Authorization</MenuItem>
                <MenuItem value="incident">Incident</MenuItem>
                <MenuItem value="medication">Medication</MenuItem>
                <MenuItem value="care_plan">Care Plan</MenuItem>
                <MenuItem value="discharge">Discharge</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending_signature">Pending Signature</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedForm ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentForms;


