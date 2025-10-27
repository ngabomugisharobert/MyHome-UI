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
  Contacts,
  Person,
  Phone,
  Email,
  LocationOn,
  Warning,
  People,
  Business,
  LocalHospital,
  Settings,
  Store,
  Group,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Contact {
  id: string;
  name: string;
  type: 'emergency' | 'family' | 'medical' | 'administrative' | 'vendor' | 'staff';
  phone?: string;
  email?: string;
  address?: string;
  relationship?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const FacilityContacts: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    phone: '',
    email: '',
    address: '',
    relationship: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Only admin and supervisor can access all contacts
      if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        setError('Access denied: Admin or Supervisor role required');
        return;
      }
      
      const response = await api.get('/contacts');
      if (response.data.success) {
        setContacts(response.data.data.contacts);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      type: '',
      phone: '',
      email: '',
      address: '',
      relationship: '',
      notes: '',
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
      relationship: contact.relationship || '',
      notes: contact.notes || '',
      isActive: contact.isActive,
    });
    setOpenDialog(true);
  };

  const handleSaveContact = async () => {
    try {
      if (selectedContact) {
        await api.put(`/contacts/${selectedContact.id}`, formData);
        showSuccess('Contact updated successfully');
      } else {
        await api.post('/contacts', formData);
        showSuccess('Contact created successfully');
      }
      setOpenDialog(false);
      fetchContacts();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        showSuccess('Contact deleted successfully');
        fetchContacts();
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to delete contact');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <Warning />;
      case 'family': return <People />;
      case 'medical': return <LocalHospital />;
      case 'administrative': return <Settings />;
      case 'vendor': return <Store />;
      case 'staff': return <Group />;
      default: return <Person />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'error';
      case 'family': return 'primary';
      case 'medical': return 'success';
      case 'administrative': return 'info';
      case 'vendor': return 'warning';
      case 'staff': return 'secondary';
      default: return 'default';
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
            Contacts Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage facility contacts and emergency information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateContact}
        >
          Add Contact
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Contacts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Relationship</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getTypeIcon(contact.type)}
                    </Avatar>
                    <Typography variant="subtitle2">{contact.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(contact.type)}
                    label={contact.type.toUpperCase()}
                    color={getTypeColor(contact.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    {contact.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Phone sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">{contact.phone}</Typography>
                      </Box>
                    )}
                    {contact.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">{contact.email}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{contact.relationship || 'N/A'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={contact.isActive ? 'Active' : 'Inactive'}
                    color={contact.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Contact">
                    <IconButton onClick={() => handleEditContact(contact)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Contact">
                    <IconButton onClick={() => handleDeleteContact(contact.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
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
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="family">Family</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="administrative">Administrative</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
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
                  multiline
                  rows={2}
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
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
          <Button variant="contained" onClick={handleSaveContact}>
            {selectedContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityContacts;
