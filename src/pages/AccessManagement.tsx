import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';

interface Facility {
  id: string;
  name: string;
  location: string;
  type: string;
}

interface Resident {
  id: string;
  name: string;
  facilityId: string;
  room: string;
}

interface AccessRule {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  facilityId: string;
  facilityName: string;
  residentId?: string;
  residentName?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const AccessManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [accessRules, setAccessRules] = useState<AccessRule[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    facilityId: '',
    residentId: '',
    permissions: [] as string[],
    isActive: true,
  });

  // Mock data
  useEffect(() => {
    const mockFacilities: Facility[] = [
      { id: '1', name: 'Main Healthcare Center', location: 'Downtown', type: 'Hospital' },
      { id: '2', name: 'North Branch Clinic', location: 'North District', type: 'Clinic' },
      { id: '3', name: 'Senior Living Facility', location: 'Suburbs', type: 'Assisted Living' },
    ];

    const mockResidents: Resident[] = [
      { id: '1', name: 'John Smith', facilityId: '1', room: '101A' },
      { id: '2', name: 'Mary Johnson', facilityId: '1', room: '102B' },
      { id: '3', name: 'Robert Davis', facilityId: '2', room: '201' },
      { id: '4', name: 'Sarah Wilson', facilityId: '3', room: '301' },
    ];

    const mockAccessRules: AccessRule[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Dr. Sarah Johnson',
        userRole: 'Doctor',
        facilityId: '1',
        facilityName: 'Main Healthcare Center',
        residentId: '1',
        residentName: 'John Smith',
        permissions: ['view', 'edit', 'add_notes'],
        isActive: true,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        userId: '2',
        userName: 'Mike Chen',
        userRole: 'Caregiver',
        facilityId: '1',
        facilityName: 'Main Healthcare Center',
        permissions: ['view', 'add_notes'],
        isActive: true,
        createdAt: '2024-01-10',
      },
      {
        id: '3',
        userId: '3',
        userName: 'Lisa Rodriguez',
        userRole: 'Supervisor',
        facilityId: '2',
        facilityName: 'North Branch Clinic',
        permissions: ['view', 'edit', 'manage', 'reports'],
        isActive: true,
        createdAt: '2024-01-12',
      },
    ];

    setFacilities(mockFacilities);
    setResidents(mockResidents);
    setAccessRules(mockAccessRules);
  }, []);

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      userId: '',
      facilityId: '',
      residentId: '',
      permissions: [],
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleEditRule = (rule: AccessRule) => {
    setEditingRule(rule);
    setFormData({
      userId: rule.userId,
      facilityId: rule.facilityId,
      residentId: rule.residentId || '',
      permissions: rule.permissions,
      isActive: rule.isActive,
    });
    setOpenDialog(true);
  };

  const handleSaveRule = () => {
    if (!formData.userId || !formData.facilityId) {
      showError('Please select a user and facility');
      return;
    }

    const facility = facilities.find(f => f.id === formData.facilityId);
    const resident = formData.residentId ? residents.find(r => r.id === formData.residentId) : null;
    const user = { name: 'Selected User', role: 'User' }; // In real app, get from users API

    if (editingRule) {
      // Update existing rule
      setAccessRules(prev => prev.map(rule => 
        rule.id === editingRule.id 
          ? { 
              ...rule, 
              ...formData,
              facilityName: facility?.name || '',
              residentName: resident?.name,
            }
          : rule
      ));
      showSuccess('Access rule updated successfully');
    } else {
      // Add new rule
      const newRule: AccessRule = {
        id: Date.now().toString(),
        ...formData,
        userName: user.name,
        userRole: user.role,
        facilityName: facility?.name || '',
        residentName: resident?.name,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccessRules(prev => [...prev, newRule]);
      showSuccess('Access rule created successfully');
    }

    setOpenDialog(false);
  };

  const handleDeleteRule = (id: string) => {
    setAccessRules(prev => prev.filter(rule => rule.id !== id));
    showSuccess('Access rule deleted successfully');
  };

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getPermissionLabel = (permission: string) => {
    const labels: { [key: string]: string } = {
      'view': 'View',
      'edit': 'Edit',
      'add_notes': 'Add Notes',
      'delete_notes': 'Delete Notes',
      'manage': 'Manage',
      'reports': 'Reports',
    };
    return labels[permission] || permission;
  };

  const getPermissionColor = (permission: string) => {
    const colors: { [key: string]: string } = {
      'view': 'primary',
      'edit': 'warning',
      'add_notes': 'success',
      'delete_notes': 'error',
      'manage': 'secondary',
      'reports': 'info',
    };
    return colors[permission] || 'default';
  };

  const availablePermissions = [
    { id: 'view', name: 'View', description: 'View information and data' },
    { id: 'edit', name: 'Edit', description: 'Modify information and data' },
    { id: 'add_notes', name: 'Add Notes', description: 'Add patient notes and observations' },
    { id: 'delete_notes', name: 'Delete Notes', description: 'Remove patient notes' },
    { id: 'manage', name: 'Manage', description: 'Manage users and settings' },
    { id: 'reports', name: 'Reports', description: 'Access reports and analytics' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Access Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRule}
          sx={{ textTransform: 'none' }}
        >
          Configure Access
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Access Rules
              </Typography>
              <Typography variant="h4">
                {accessRules.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Rules
              </Typography>
              <Typography variant="h4">
                {accessRules.filter(r => r.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Facilities
              </Typography>
              <Typography variant="h4">
                {facilities.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Residents
              </Typography>
              <Typography variant="h4">
                {residents.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Resident</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {rule.userName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{rule.userName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rule.userRole}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{rule.facilityName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {rule.residentName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{rule.residentName}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          All Residents
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {rule.permissions.map(permission => (
                          <Chip
                            key={permission}
                            label={getPermissionLabel(permission)}
                            size="small"
                            color={getPermissionColor(permission) as any}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.isActive ? 'Active' : 'Inactive'}
                        color={rule.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Access">
                          <IconButton size="small" onClick={() => handleEditRule(rule)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Access">
                          <IconButton size="small" onClick={() => handleDeleteRule(rule.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Access Rule' : 'Configure Access'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>User</InputLabel>
                <Select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  label="User"
                >
                  <MenuItem value="1">Dr. Sarah Johnson</MenuItem>
                  <MenuItem value="2">Mike Chen</MenuItem>
                  <MenuItem value="3">Lisa Rodriguez</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  label="Facility"
                >
                  {facilities.map(facility => (
                    <MenuItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Resident (Optional)</InputLabel>
              <Select
                value={formData.residentId}
                onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                label="Resident (Optional)"
              >
                <MenuItem value="">All Residents</MenuItem>
                {residents
                  .filter(r => r.facilityId === formData.facilityId)
                  .map(resident => (
                    <MenuItem key={resident.id} value={resident.id}>
                      {resident.name} (Room {resident.room})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the permissions for this access rule
              </Typography>
              
              <Grid container spacing={2}>
                {availablePermissions.map((permission) => (
                  <Grid item xs={12} sm={6} md={4} key={permission.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.permissions.includes(permission.id) ? 2 : 1,
                        borderColor: formData.permissions.includes(permission.id) ? 'primary.main' : 'divider',
                        backgroundColor: formData.permissions.includes(permission.id) ? 'primary.light' : 'background.paper',
                      }}
                      onClick={() => handlePermissionChange(permission.id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRule} variant="contained">
            {editingRule ? 'Update' : 'Create'} Access Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccessManagement;
