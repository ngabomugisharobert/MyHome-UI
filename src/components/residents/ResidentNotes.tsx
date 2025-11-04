import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
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
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit,
  Delete,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ResidentNotesProps {
  residentId: string;
}

const ResidentNotes: React.FC<ResidentNotesProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    isPrivate: false,
  });

  useEffect(() => {
    fetchNotes();
  }, [residentId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/resident-notes/resident/${residentId}`);
      if (response.data.success) {
        setNotes(response.data.data.notes || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch notes:', error);
      showError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (note?: any) => {
    if (note) {
      setSelectedNote(note);
      setFormData({
        title: note.title || '',
        content: note.content || '',
        category: note.category || 'general',
        priority: note.priority || 'medium',
        isPrivate: note.isPrivate || false,
      });
    } else {
      setSelectedNote(null);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        isPrivate: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNote(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedNote) {
        await api.put(`/resident-notes/${selectedNote.id}`, formData);
        showSuccess('Note updated successfully');
      } else {
        await api.post(`/resident-notes/resident/${residentId}`, formData);
        showSuccess('Note created successfully');
      }
      handleCloseDialog();
      fetchNotes();
    } catch (error: any) {
      console.error('Failed to save note:', error);
      showError(error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/resident-notes/${id}`);
      showSuccess('Note deleted successfully');
      fetchNotes();
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      showError('Failed to delete note');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical':
        return 'error';
      case 'incident':
        return 'warning';
      case 'behavioral':
        return 'info';
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
          Notes
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'doctor' || user?.role === 'caregiver') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Note
          </Button>
        )}
      </Box>

      {notes.length === 0 ? (
        <Alert severity="info">No notes found for this resident.</Alert>
      ) : (
        <Grid container spacing={2}>
          {notes.map((note) => (
            <Grid item xs={12} md={6} key={note.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {note.title || 'Untitled Note'}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={note.category?.toUpperCase()}
                        color={getCategoryColor(note.category)}
                        size="small"
                      />
                      <Chip
                        label={note.priority?.toUpperCase()}
                        color={getPriorityColor(note.priority)}
                        size="small"
                      />
                    </Stack>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {note.author?.name || 'Unknown'} • {new Date(note.created_at).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  {(note.created_by === user?.id || user?.role === 'admin') && (
                    <>
                      <IconButton size="small" onClick={() => handleOpenDialog(note)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedNote ? 'Edit Note' : 'Add Note'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="behavioral">Behavioral</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="incident">Incident</MenuItem>
                <MenuItem value="medication">Medication</MenuItem>
                <MenuItem value="nutrition">Nutrition</MenuItem>
                <MenuItem value="activity">Activity</MenuItem>
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
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedNote ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentNotes;


