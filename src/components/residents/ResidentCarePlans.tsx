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
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ResidentCarePlansProps {
  residentId: string;
}

const ResidentCarePlans: React.FC<ResidentCarePlansProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCarePlan, setSelectedCarePlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    diagnosis: '',
    startDate: '',
    endDate: '',
    reviewDate: '',
    priority: 'medium',
    category: 'medical',
    status: 'active',
  });

  useEffect(() => {
    fetchCarePlans();
  }, [residentId]);

  const fetchCarePlans = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/care-plans?residentId=${residentId}`);
      if (response.data.success) {
        setCarePlans(response.data.data.carePlans || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch care plans:', error);
      showError('Failed to load care plans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (carePlan?: any) => {
    if (carePlan) {
      setSelectedCarePlan(carePlan);
      setFormData({
        title: carePlan.title || '',
        description: carePlan.description || '',
        diagnosis: carePlan.diagnosis || '',
        startDate: carePlan.startDate ? new Date(carePlan.startDate).toISOString().split('T')[0] : '',
        endDate: carePlan.endDate ? new Date(carePlan.endDate).toISOString().split('T')[0] : '',
        reviewDate: carePlan.reviewDate ? new Date(carePlan.reviewDate).toISOString().split('T')[0] : '',
        priority: carePlan.priority || 'medium',
        category: carePlan.category || 'medical',
        status: carePlan.status || 'active',
      });
    } else {
      setSelectedCarePlan(null);
      setFormData({
        title: '',
        description: '',
        diagnosis: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        reviewDate: '',
        priority: 'medium',
        category: 'medical',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCarePlan(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        residentId,
      };

      if (selectedCarePlan) {
        await api.put(`/care-plans/${selectedCarePlan.id}`, data);
        showSuccess('Care plan updated successfully');
      } else {
        await api.post('/care-plans', data);
        showSuccess('Care plan created successfully');
      }
      handleCloseDialog();
      fetchCarePlans();
    } catch (error: any) {
      console.error('Failed to save care plan:', error);
      showError(error.response?.data?.message || 'Failed to save care plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this care plan?')) return;

    try {
      await api.delete(`/care-plans/${id}`);
      showSuccess('Care plan deleted successfully');
      fetchCarePlans();
    } catch (error: any) {
      console.error('Failed to delete care plan:', error);
      showError('Failed to delete care plan');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'discontinued':
        return 'error';
      case 'on_hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
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
          Care Plans
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Care Plan
          </Button>
        )}
      </Box>

      {carePlans.length === 0 ? (
        <Alert severity="info">No care plans found for this resident.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {carePlans.map((carePlan) => (
                <TableRow key={carePlan.id}>
                  <TableCell>{carePlan.title}</TableCell>
                  <TableCell>
                    <Chip label={carePlan.category?.toUpperCase()} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={carePlan.priority?.toUpperCase()}
                      color={getPriorityColor(carePlan.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(carePlan.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={carePlan.status?.toUpperCase()}
                      color={getStatusColor(carePlan.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(carePlan)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(carePlan.id)}
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
          {selectedCarePlan ? 'Edit Care Plan' : 'Add Care Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="nursing">Nursing</MenuItem>
                <MenuItem value="therapy">Therapy</MenuItem>
                <MenuItem value="nutrition">Nutrition</MenuItem>
                <MenuItem value="behavioral">Behavioral</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Review Date"
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="discontinued">Discontinued</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCarePlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentCarePlans;
