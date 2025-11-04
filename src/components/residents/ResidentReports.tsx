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

interface ResidentReportsProps {
  residentId: string;
}

const ResidentReports: React.FC<ResidentReportsProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    reportType: '',
    reportDate: '',
    title: '',
    summary: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchReports();
  }, [residentId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/resident-reports/resident/${residentId}`);
      if (response.data.success) {
        setReports(response.data.data.reports || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch reports:', error);
      showError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (report?: any) => {
    if (report) {
      setSelectedReport(report);
      setFormData({
        reportType: report.reportType || '',
        reportDate: report.reportDate ? new Date(report.reportDate).toISOString().split('T')[0] : '',
        title: report.title || '',
        summary: report.summary || '',
        status: report.status || 'draft',
      });
    } else {
      setSelectedReport(null);
      setFormData({
        reportType: '',
        reportDate: new Date().toISOString().split('T')[0],
        title: '',
        summary: '',
        status: 'draft',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedReport) {
        await api.put(`/resident-reports/${selectedReport.id}`, formData);
        showSuccess('Report updated successfully');
      } else {
        await api.post(`/resident-reports/resident/${residentId}`, formData);
        showSuccess('Report created successfully');
      }
      handleCloseDialog();
      fetchReports();
    } catch (error: any) {
      console.error('Failed to save report:', error);
      showError(error.response?.data?.message || 'Failed to save report');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await api.delete(`/resident-reports/${id}`);
      showSuccess('Report deleted successfully');
      fetchReports();
    } catch (error: any) {
      console.error('Failed to delete report:', error);
      showError('Failed to delete report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'reviewed':
        return 'info';
      case 'approved':
        return 'success';
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
          Reports
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Report
          </Button>
        )}
      </Box>

      {reports.length === 0 ? (
        <Alert severity="info">No reports found for this resident.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {new Date(report.reportDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {report.reportType?.replace('_', ' ').toUpperCase()}
                  </TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status?.toUpperCase()}
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(report)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(report.id)}
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
          {selectedReport ? 'Edit Report' : 'Add Report'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Report Type"
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                required
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="incident">Incident</MenuItem>
                <MenuItem value="medication">Medication</MenuItem>
                <MenuItem value="care_plan_review">Care Plan Review</MenuItem>
                <MenuItem value="discharge">Discharge</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Report Date"
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
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
                <MenuItem value="approved">Approved</MenuItem>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentReports;


