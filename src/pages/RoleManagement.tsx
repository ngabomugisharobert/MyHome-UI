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
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

const RoleManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true,
  });

  // Mock permissions data
  useEffect(() => {
    const mockPermissions: Permission[] = [
      { id: '1', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
      { id: '2', name: 'Manage Users', description: 'Create, edit, delete users', category: 'User Management' },
      { id: '3', name: 'View Users', description: 'View user information', category: 'User Management' },
      { id: '4', name: 'Manage Facilities', description: 'Create, edit, delete facilities', category: 'Facility Management' },
      { id: '5', name: 'View Facilities', description: 'View facility information', category: 'Facility Management' },
      { id: '6', name: 'Add Notes', description: 'Add patient notes', category: 'Patient Care' },
      { id: '7', name: 'Delete Notes', description: 'Delete patient notes', category: 'Patient Care' },
      { id: '8', name: 'View Reports', description: 'Access to reports and analytics', category: 'Reporting' },
      { id: '9', name: 'Manage Roles', description: 'Create and modify user roles', category: 'Administration' },
      { id: '10', name: 'System Settings', description: 'Access to system configuration', category: 'Administration' },
    ];

    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access with all permissions',
        permissions: mockPermissions.map(p => p.id),
        isActive: true,
        createdAt: '2024-01-01',
        userCount: 2,
      },
      {
        id: '2',
        name: 'Doctor',
        description: 'Medical staff with patient care and reporting access',
        permissions: ['1', '3', '5', '6', '8'],
        isActive: true,
        createdAt: '2024-01-01',
        userCount: 5,
      },
      {
        id: '3',
        name: 'Caregiver',
        description: 'Patient care staff with limited permissions',
        permissions: ['1', '3', '5', '6'],
        isActive: true,
        createdAt: '2024-01-01',
        userCount: 12,
      },
      {
        id: '4',
        name: 'Supervisor',
        description: 'Team management with oversight capabilities',
        permissions: ['1', '2', '3', '4', '5', '6', '8'],
        isActive: true,
        createdAt: '2024-01-01',
        userCount: 3,
      },
    ];

    setPermissions(mockPermissions);
    setRoles(mockRoles);
  }, []);

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [], isActive: true });
    setOpenDialog(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
    setOpenDialog(true);
  };

  const handleSaveRole = () => {
    if (!formData.name || !formData.description) {
      showError('Please fill in all required fields');
      return;
    }

    if (editingRole) {
      // Update existing role
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...formData }
          : role
      ));
      showSuccess('Role updated successfully');
    } else {
      // Add new role
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        userCount: 0,
      };
      setRoles(prev => [...prev, newRole]);
      showSuccess('Role created successfully');
    }

    setOpenDialog(false);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(prev => prev.filter(role => role.id !== id));
    showSuccess('Role deleted successfully');
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getPermissionName = (id: string) => {
    return permissions.find(p => p.id === id)?.name || 'Unknown';
  };

  const getPermissionsByCategory = () => {
    const categories = Array.from(new Set(permissions.map(p => p.category)));
    return categories.map(category => ({
      category,
      permissions: permissions.filter(p => p.category === category)
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Role Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
          sx={{ textTransform: 'none' }}
        >
          Create New Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={6} lg={4} key={role.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {role.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={role.isActive ? 'Active' : 'Inactive'}
                      color={role.isActive ? 'success' : 'error'}
                      size="small"
                    />
                    <Switch
                      checked={role.isActive}
                      onChange={() => {
                        setRoles(prev => prev.map(r => 
                          r.id === role.id ? { ...r, isActive: !r.isActive } : r
                        ));
                      }}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Users with this role: {role.userCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {role.createdAt}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Permissions ({role.permissions.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {role.permissions.slice(0, 3).map(permissionId => (
                      <Chip
                        key={permissionId}
                        label={getPermissionName(permissionId)}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {role.permissions.length > 3 && (
                      <Chip
                        label={`+${role.permissions.length - 3} more`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit Role">
                    <IconButton size="small" onClick={() => handleEditRole(role)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Role">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={role.userCount > 0}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Role Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
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
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              required
            />

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the permissions that users with this role will have
              </Typography>
              
              {getPermissionsByCategory().map(({ category, permissions: categoryPermissions }) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {category}
                  </Typography>
                  <FormGroup>
                    {categoryPermissions.map((permission) => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {permission.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">
            {editingRole ? 'Update' : 'Create'} Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
