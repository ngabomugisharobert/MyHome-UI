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
  Tabs,
  Tab,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit,
  Delete,
  Done,
  Close,
  Pause,
  Event,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Autocomplete from '@mui/material/Autocomplete';

interface ResidentMedicationsProps {
  residentId: string;
}

const ResidentMedications: React.FC<ResidentMedicationsProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    medicationId: '',
    medicationName: '',
    dosage: '',
    frequency: 'daily',
    startDate: '',
    endDate: '',
    instructions: '',
    reason: '',
    form: 'tablet',
    route: 'oral',
  });
  const [medTab, setMedTab] = useState<number>(0); // 0: List, 1: Med Pass, 2: Med Log
  const [passDate, setPassDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [logStart, setLogStart] = useState<string>('');
  const [logEnd, setLogEnd] = useState<string>('');
  const [administrations, setAdministrations] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [useNewMedication, setUseNewMedication] = useState<boolean>(false);
  const [customTimes, setCustomTimes] = useState<string[]>(['08:00']);
  const [windowMinutes, setWindowMinutes] = useState<number>(60);

  useEffect(() => {
    fetchSchedules();
    fetchMedications();
  }, [residentId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/medications/schedules/resident/${residentId}`);
      if (response.data.success) {
        setSchedules(response.data.data.schedules || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch medication schedules:', error);
      showError('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await api.get('/medications');
      if (response.data.success) {
        setMedications(response.data.data.medications || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch medications:', error);
    }
  };

  const fetchAdministrations = async () => {
    try {
      setAdminLoading(true);
      const params: any = { residentId };
      if (logStart) params.startDate = logStart;
      if (logEnd) params.endDate = logEnd;
      const response = await api.get('/medications/administrations', { params });
      if (response.data.success) {
        setAdministrations(response.data.data.administrations || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch administrations:', err);
      showError(err.response?.data?.message || 'Failed to load med log');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (medTab === 2) {
      fetchAdministrations();
    }
  }, [medTab]);

  const handleOpenDialog = (schedule?: any) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setFormData({
        medicationId: schedule.medicationId || '',
        medicationName: schedule.medication?.name || '',
        dosage: schedule.dosage || '',
        frequency: schedule.frequency || 'daily',
        startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : '',
        endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
        instructions: schedule.instructions || '',
        reason: schedule.reason || '',
        form: schedule.medication?.form || 'tablet',
        route: schedule.medication?.route || 'oral',
      });
      const times = schedule.customSchedule?.times || ['08:00'];
      setCustomTimes(times);
      setWindowMinutes(schedule.customSchedule?.windowMinutes || 60);
      setUseNewMedication(false);
    } else {
      setSelectedSchedule(null);
      setFormData({
        medicationId: '',
        medicationName: '',
        dosage: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: '',
        reason: '',
        form: 'tablet',
        route: 'oral',
      });
      setCustomTimes(['08:00']);
      setWindowMinutes(60);
      setUseNewMedication(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSchedule(null);
  };

  const handleSubmit = async () => {
    try {
      let medicationId = formData.medicationId;
      // If creating a new medication, create it first
      if (useNewMedication || (!medicationId && formData.medicationName)) {
        const createPayload = {
          name: formData.medicationName.trim(),
          dosage: formData.dosage || '1',
          form: formData.form || 'tablet',
          route: formData.route || 'oral',
        } as any;
        const medResp = await api.post('/medications', createPayload);
        if (!medResp.data?.success) {
          showError(medResp.data?.message || 'Failed to create medication');
          return;
        }
        medicationId = medResp.data.data.medication.id;
      }

      const data: any = {
        residentId,
        medicationId,
        dosage: formData.dosage,
        frequency: formData.frequency === 'custom' ? 'custom' : formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        instructions: formData.instructions,
        reason: formData.reason,
      };

      if (data.frequency === 'custom') {
        data.customSchedule = {
          times: customTimes.filter(Boolean),
          days: [1,2,3,4,5,6,7],
          windowMinutes,
        };
      }

      if (selectedSchedule) {
        await api.put(`/medications/schedules/${selectedSchedule.id}`, data);
        showSuccess('Medication schedule updated successfully');
      } else {
        await api.post('/medications/schedules', data);
        showSuccess('Medication schedule created successfully');
      }
      handleCloseDialog();
      fetchSchedules();
    } catch (error: any) {
      console.error('Failed to save medication schedule:', error);
      showError(error.response?.data?.message || 'Failed to save medication schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication schedule?')) return;

    try {
      await api.delete(`/medications/schedules/${id}`);
      showSuccess('Medication schedule deleted successfully');
      fetchSchedules();
    } catch (error: any) {
      console.error('Failed to delete medication schedule:', error);
      showError('Failed to delete medication schedule');
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
      default:
        return 'default';
    }
  };

  const recordAdministration = async (schedule: any, status: 'administered' | 'missed' | 'refused' | 'held') => {
    try {
      const scheduledTime = new Date(passDate + 'T00:00:00');
      const body: any = { scheduledTime: scheduledTime.toISOString(), status };
      if (status !== 'administered') {
        body.reasonNotGiven = 'Recorded during Med Pass';
      }
      const resp = await api.post(`/medications/administrations/schedule/${schedule.id}`, body);
      if (resp.data.success) {
        showSuccess('Administration recorded');
        if (medTab === 2) fetchAdministrations();
      } else {
        showError(resp.data.message || 'Failed to record administration');
      }
    } catch (err: any) {
      console.error('Record administration failed:', err);
      showError(err.response?.data?.message || 'Failed to record administration');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
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

      <Tabs value={medTab} onChange={(_, v) => setMedTab(v)} sx={{ mb: 2 }}>
        <Tab label="Medication List" />
        <Tab label="Med Pass" />
        <Tab label="Med Log" />
      </Tabs>

      {medTab === 0 && (
        schedules.length === 0 ? (
          <Alert severity="info">No medications found for this resident.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medication</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.medication?.name || 'Unknown'}</TableCell>
                    <TableCell>{schedule.dosage}</TableCell>
                    <TableCell>{schedule.frequency}</TableCell>
                    <TableCell>
                      {new Date(schedule.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.status?.toUpperCase()}
                        color={getStatusColor(schedule.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(schedule)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(schedule.id)}
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
        )
      )}

      {medTab === 1 && (
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              type="date"
              label="Date"
              value={passDate}
              onChange={(e) => setPassDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Stack>
          {schedules.length === 0 ? (
            <Alert severity="info">No scheduled medications for this resident.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Drug</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.medication?.name}</TableCell>
                      <TableCell>{schedule.dosage}</TableCell>
                      <TableCell>{schedule.frequency}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="contained" color="success" startIcon={<Done />} onClick={() => recordAdministration(schedule, 'administered')}>Given</Button>
                          <Button size="small" variant="outlined" color="warning" startIcon={<Pause />} onClick={() => recordAdministration(schedule, 'held')}>Held</Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<Close />} onClick={() => recordAdministration(schedule, 'refused')}>Refused</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {medTab === 2 && (
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField type="date" label="From" value={logStart} onChange={(e) => setLogStart(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            <TextField type="date" label="To" value={logEnd} onChange={(e) => setLogEnd(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            <Button variant="outlined" startIcon={<Event />} onClick={fetchAdministrations}>Filter</Button>
          </Stack>
          {adminLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            administrations.length === 0 ? (
              <Alert severity="info">No administrations found for the selected range.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date/Time</TableCell>
                      <TableCell>Medication</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {administrations.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.scheduledTime).toLocaleString()}</TableCell>
                        <TableCell>{a.schedule?.medication?.name}</TableCell>
                        <TableCell>
                          <Chip label={a.status?.toUpperCase()} size="small" color={a.status === 'administered' ? 'success' : a.status === 'missed' ? 'error' : 'warning'} />
                        </TableCell>
                        <TableCell>{a.notes || a.reasonNotGiven || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSchedule ? 'Edit Medication Schedule' : 'Add Medication Schedule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={useNewMedication} onChange={(e) => setUseNewMedication(e.target.checked)} />}
                label="Medication not in list (add new)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={medications}
                getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.name)}
                onChange={(_, value: any) => {
                  if (value && value.id) {
                    setFormData({
                      ...formData,
                      medicationId: value.id,
                      medicationName: value.name,
                      dosage: formData.dosage || value.dosage || '',
                      form: value.form || 'tablet',
                      route: value.route || 'oral',
                    });
                  }
                }}
                value={null}
                inputValue={formData.medicationName}
                onInputChange={(_, val) => setFormData({ ...formData, medicationName: val, medicationId: '' })}
                renderInput={(params) => (
                  <TextField {...params} label="Medication" placeholder="Type to search or add new" required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Form"
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
              >
                <MenuItem value="tablet">Tablet</MenuItem>
                <MenuItem value="capsule">Capsule</MenuItem>
                <MenuItem value="liquid">Liquid</MenuItem>
                <MenuItem value="injection">Injection</MenuItem>
                <MenuItem value="topical">Topical</MenuItem>
                <MenuItem value="inhaler">Inhaler</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Route"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              >
                <MenuItem value="oral">Oral</MenuItem>
                <MenuItem value="intramuscular">Intramuscular</MenuItem>
                <MenuItem value="intravenous">Intravenous</MenuItem>
                <MenuItem value="subcutaneous">Subcutaneous</MenuItem>
                <MenuItem value="topical">Topical</MenuItem>
                <MenuItem value="inhalation">Inhalation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="twice_daily">Twice Daily</MenuItem>
                <MenuItem value="three_times_daily">Three Times Daily</MenuItem>
                <MenuItem value="four_times_daily">Four Times Daily</MenuItem>
                <MenuItem value="as_needed">As Needed</MenuItem>
                <MenuItem value="custom">Custom Times</MenuItem>
              </TextField>
            </Grid>
            {formData.frequency === 'custom' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Administration Times</Typography>
                {customTimes.map((t, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <TextField type="time" label={`Time ${idx + 1}`} value={t} onChange={(e) => {
                      const copy = [...customTimes];
                      copy[idx] = e.target.value;
                      setCustomTimes(copy);
                    }} InputLabelProps={{ shrink: true }} size="small" />
                    <Button size="small" color="error" onClick={() => setCustomTimes(customTimes.filter((_, i) => i !== idx))}>Remove</Button>
                  </Stack>
                ))}
                <Button size="small" onClick={() => setCustomTimes([...customTimes, '12:00'])}>Add Time</Button>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <TextField type="number" label="Window (minutes)" value={windowMinutes} onChange={(e) => setWindowMinutes(parseInt(e.target.value || '0', 10))} size="small" />
                  <Typography variant="caption" color="text.secondary">Allowed time range around each dose</Typography>
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedSchedule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentMedications;
