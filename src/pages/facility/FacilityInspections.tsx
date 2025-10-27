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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Assignment,
  Person,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  LocalHospital,
  Security,
  Business,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Inspection {
  id: string;
  inspectionDate: string;
  inspector: string;
  inspectorTitle?: string;
  type: 'routine' | 'compliance' | 'safety' | 'medical' | 'audit';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed';
  score?: number;
  findings?: string;
  violations?: string[];
  recommendations?: string;
  correctiveActions?: string;
  followUpDate?: string;
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const FacilityInspections: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [formData, setFormData] = useState({
    inspectionDate: '',
    inspector: '',
    inspectorTitle: '',
    type: 'routine',
    status: 'scheduled',
    score: '',
    findings: '',
    violations: '',
    recommendations: '',
    correctiveActions: '',
    followUpDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      
      // Only admin and supervisor can access all inspections
      if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        setError('Access denied: Admin or Supervisor role required');
        return;
      }
      
      const response = await api.get('/inspections');
      if (response.data.success) {
        setInspections(response.data.data.inspections);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInspection = () => {
    setSelectedInspection(null);
    setFormData({
      inspectionDate: '',
      inspector: '',
      inspectorTitle: '',
      type: 'routine',
      status: 'scheduled',
      score: '',
      findings: '',
      violations: '',
      recommendations: '',
      correctiveActions: '',
      followUpDate: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setFormData({
      inspectionDate: inspection.inspectionDate,
      inspector: inspection.inspector,
      inspectorTitle: inspection.inspectorTitle || '',
      type: inspection.type,
      status: inspection.status,
      score: inspection.score?.toString() || '',
      findings: inspection.findings || '',
      violations: inspection.violations?.join(', ') || '',
      recommendations: inspection.recommendations || '',
      correctiveActions: inspection.correctiveActions || '',
      followUpDate: inspection.followUpDate || '',
      notes: inspection.notes || '',
    });
    setOpenDialog(true);
  };

  const handleSaveInspection = async () => {
    try {
      const dataToSend = {
        ...formData,
        score: formData.score ? parseInt(formData.score) : undefined,
        violations: formData.violations ? formData.violations.split(',').map(v => v.trim()) : [],
        photos: [], // For now, empty array
      };

      if (selectedInspection) {
        await api.put(`/inspections/${selectedInspection.id}`, dataToSend);
        showSuccess('Inspection updated successfully');
      } else {
        await api.post('/inspections', dataToSend);
        showSuccess('Inspection created successfully');
      }
      setOpenDialog(false);
      fetchInspections();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save inspection');
    }
  };

  const handleDeleteInspection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        await api.delete(`/inspections/${id}`);
        showSuccess('Inspection deleted successfully');
        fetchInspections();
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to delete inspection');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'routine': return <Schedule />;
      case 'compliance': return <Security />;
      case 'safety': return <Warning />;
      case 'medical': return <LocalHospital />;
      case 'audit': return <Assessment />;
      default: return <Assignment />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'primary';
      case 'compliance': return 'success';
      case 'safety': return 'warning';
      case 'medical': return 'error';
      case 'audit': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in_progress': return <Schedule />;
      case 'failed': return <Cancel />;
      case 'passed': return <TrendingUp />;
      default: return <Assignment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'failed': return 'error';
      case 'passed': return 'success';
      default: return 'warning';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'error';
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
            Inspections Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage facility inspections and compliance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateInspection}
        >
          Add Inspection
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Inspections Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Inspector</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Findings</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{inspection.inspector}</Typography>
                    {inspection.inspectorTitle && (
                      <Typography variant="caption" color="text.secondary">
                        {inspection.inspectorTitle}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(inspection.type)}
                    label={inspection.type.toUpperCase()}
                    color={getTypeColor(inspection.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(inspection.inspectionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(inspection.status)}
                    label={inspection.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(inspection.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {inspection.score ? (
                    <Chip
                      label={`${inspection.score}%`}
                      color={getScoreColor(inspection.score) as any}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {inspection.findings ? (
                    <Typography variant="body2">
                      {inspection.findings.length > 50 
                        ? `${inspection.findings.substring(0, 50)}...` 
                        : inspection.findings}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No findings</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Inspection">
                    <IconButton onClick={() => handleEditInspection(inspection)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Inspection">
                    <IconButton onClick={() => handleDeleteInspection(inspection.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Inspection Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedInspection ? 'Edit Inspection' : 'Add New Inspection'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspection Date"
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspector"
                  value={formData.inspector}
                  onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspector Title"
                  value={formData.inspectorTitle}
                  onChange={(e) => setFormData({ ...formData, inspectorTitle: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="routine">Routine</MenuItem>
                    <MenuItem value="compliance">Compliance</MenuItem>
                    <MenuItem value="safety">Safety</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="audit">Audit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="passed">Passed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Score (%)"
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Findings"
                  multiline
                  rows={3}
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Violations (comma-separated)"
                  multiline
                  rows={2}
                  value={formData.violations}
                  onChange={(e) => setFormData({ ...formData, violations: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recommendations"
                  multiline
                  rows={2}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Corrective Actions"
                  multiline
                  rows={2}
                  value={formData.correctiveActions}
                  onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Follow-up Date"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
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
          <Button variant="contained" onClick={handleSaveInspection}>
            {selectedInspection ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityInspections;
