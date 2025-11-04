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
  Phone,
  Email,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ResidentContactsProps {
  residentId: string;
}

const ResidentContacts: React.FC<ResidentContactsProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'family',
    phone: '',
    email: '',
    address: '',
    relationship: '',
    isPrimary: false,
    isEmergency: false,
    notes: '',
  });

  useEffect(() => {
    fetchContacts();
  }, [residentId]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contacts/resident/${residentId}`);
      if (response.data.success) {
        setContacts(response.data.data.contacts || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch contacts:', error);
      showError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contact?: any) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData({
        name: contact.name || '',
        type: contact.type || 'family',
        phone: contact.phone || '',
        email: contact.email || '',
        address: contact.address || '',
        relationship: contact.relationship || '',
        isPrimary: contact.isPrimary || false,
        isEmergency: contact.isEmergency || false,
        notes: contact.notes || '',
      });
    } else {
      setSelectedContact(null);
      setFormData({
        name: '',
        type: 'family',
        phone: '',
        email: '',
        address: '',
        relationship: '',
        isPrimary: false,
        isEmergency: false,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContact(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        residentId,
      };

      if (selectedContact) {
        await api.put(`/contacts/${selectedContact.id}`, data);
        showSuccess('Contact updated successfully');
      } else {
        await api.post('/contacts', data);
        showSuccess('Contact created successfully');
      }
      handleCloseDialog();
      fetchContacts();
    } catch (error: any) {
      console.error('Failed to save contact:', error);
      showError(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      showSuccess('Contact deleted successfully');
      fetchContacts();
    } catch (error: any) {
      console.error('Failed to delete contact:', error);
      showError('Failed to delete contact');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'error';
      case 'medical':
        return 'warning';
      case 'family':
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
          Contacts
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Contact
          </Button>
        )}
      </Box>

      {contacts.length === 0 ? (
        <Alert severity="info">No contacts found for this resident.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Relationship</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    {contact.name}
                    {contact.isEmergency && (
                      <Chip label="EMERGENCY" color="error" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contact.type?.toUpperCase()}
                      color={getTypeColor(contact.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone fontSize="small" />
                      {contact.phone || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email fontSize="small" />
                      {contact.email || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>{contact.relationship || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(contact)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(contact.id)}
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
          {selectedContact ? 'Edit Contact' : 'Add Contact'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="administrative">Administrative</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Is Emergency Contact"
                value={formData.isEmergency ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, isEmergency: e.target.value === 'yes' })}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentContacts;
