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
  Visibility,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ResidentAssessmentsProps {
  residentId: string;
}

const ResidentAssessments: React.FC<ResidentAssessmentsProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [formData, setFormData] = useState({
    assessmentType: '',
    assessmentDate: '',
    nextAssessmentDate: '',
    title: '',
    description: '',
    recommendations: '',
    status: 'draft',
    score: '',
    maxScore: '',
  });

  useEffect(() => {
    fetchAssessments();
  }, [residentId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/resident-assessments/resident/${residentId}`);
      if (response.data.success) {
        setAssessments(response.data.data.assessments || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch assessments:', error);
      showError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (assessment?: any) => {
    if (assessment) {
      setSelectedAssessment(assessment);
      setFormData({
        assessmentType: assessment.assessmentType || '',
        assessmentDate: assessment.assessmentDate ? new Date(assessment.assessmentDate).toISOString().split('T')[0] : '',
        nextAssessmentDate: assessment.nextAssessmentDate ? new Date(assessment.nextAssessmentDate).toISOString().split('T')[0] : '',
        title: assessment.title || '',
        description: assessment.description || '',
        recommendations: assessment.recommendations || '',
        status: assessment.status || 'draft',
        score: assessment.score?.toString() || '',
        maxScore: assessment.maxScore?.toString() || '',
      });
    } else {
      setSelectedAssessment(null);
      setFormData({
        assessmentType: '',
        assessmentDate: new Date().toISOString().split('T')[0],
        nextAssessmentDate: '',
        title: '',
        description: '',
        recommendations: '',
        status: 'draft',
        score: '',
        maxScore: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAssessment(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        score: formData.score ? parseInt(formData.score) : null,
        maxScore: formData.maxScore ? parseInt(formData.maxScore) : null,
      };

      if (selectedAssessment) {
        await api.put(`/resident-assessments/${selectedAssessment.id}`, data);
        showSuccess('Assessment updated successfully');
      } else {
        await api.post(`/resident-assessments/resident/${residentId}`, data);
        showSuccess('Assessment created successfully');
      }
      handleCloseDialog();
      fetchAssessments();
    } catch (error: any) {
      console.error('Failed to save assessment:', error);
      showError(error.response?.data?.message || 'Failed to save assessment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await api.delete(`/resident-assessments/${id}`);
      showSuccess('Assessment deleted successfully');
      fetchAssessments();
    } catch (error: any) {
      console.error('Failed to delete assessment:', error);
      showError('Failed to delete assessment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'reviewed':
        return 'info';
      case 'draft':
        return 'default';
      case 'archived':
        return 'secondary';
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
          Assessments
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Assessment
          </Button>
        )}
      </Box>

      {assessments.length === 0 ? (
        <Alert severity="info">No assessments found for this resident.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {assessment.assessmentType?.replace('_', ' ').toUpperCase()}
                  </TableCell>
                  <TableCell>{assessment.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={assessment.status?.toUpperCase()}
                      color={getStatusColor(assessment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {assessment.score !== null && assessment.maxScore !== null
                      ? `${assessment.score}/${assessment.maxScore}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(assessment)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(assessment.id)}
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
          {selectedAssessment ? 'Edit Assessment' : 'Add Assessment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Assessment Type"
                value={formData.assessmentType}
                onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                required
              >
                <MenuItem value="initial">Initial</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="change_in_condition">Change in Condition</MenuItem>
                <MenuItem value="discharge">Discharge</MenuItem>
                <MenuItem value="fall">Fall</MenuItem>
                <MenuItem value="medication_review">Medication Review</MenuItem>
                <MenuItem value="nutrition">Nutrition</MenuItem>
                <MenuItem value="cognitive">Cognitive</MenuItem>
                <MenuItem value="functional">Functional</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Assessment Date"
                value={formData.assessmentDate}
                onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Next Assessment Date"
                value={formData.nextAssessmentDate}
                onChange={(e) => setFormData({ ...formData, nextAssessmentDate: e.target.value })}
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
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Score"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Score"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
              />
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
                label="Recommendations"
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAssessment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentAssessments;


