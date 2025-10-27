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
  Link,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Description,
  Upload,
  Download,
  Visibility,
  Assignment,
  Security,
  LocalHospital,
  Business,
  Person,
  Folder,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Document {
  id: string;
  title: string;
  category: 'license' | 'insurance' | 'compliance' | 'medical' | 'administrative' | 'resident_file' | 'staff_file' | 'other';
  filePath: string;
  fileType?: string;
  uploadedBy?: string;
  uploadDate: string;
  version: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const FacilityDocuments: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    filePath: '',
    fileType: '',
    version: '1.0',
    isArchived: false,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Only admin and supervisor can access all documents
      if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        setError('Access denied: Admin or Supervisor role required');
        return;
      }
      
      const response = await api.get('/documents');
      if (response.data.success) {
        setDocuments(response.data.data.documents);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setFormData({
      title: '',
      category: '',
      filePath: '',
      fileType: '',
      version: '1.0',
      isArchived: false,
    });
    setOpenDialog(true);
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setFormData({
      title: document.title,
      category: document.category,
      filePath: document.filePath,
      fileType: document.fileType || '',
      version: document.version,
      isArchived: document.isArchived,
    });
    setOpenDialog(true);
  };

  const handleSaveDocument = async () => {
    try {
      if (selectedDocument) {
        await api.put(`/documents/${selectedDocument.id}`, formData);
        showSuccess('Document updated successfully');
      } else {
        await api.post('/documents', formData);
        showSuccess('Document created successfully');
      }
      setOpenDialog(false);
      fetchDocuments();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save document');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${id}`);
        showSuccess('Document deleted successfully');
        fetchDocuments();
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to delete document');
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'license': return <Assignment />;
      case 'insurance': return <Security />;
      case 'compliance': return <Warning />;
      case 'medical': return <LocalHospital />;
      case 'administrative': return <Business />;
      case 'resident_file': return <Person />;
      case 'staff_file': return <Person />;
      default: return <Description />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'license': return 'primary';
      case 'insurance': return 'success';
      case 'compliance': return 'warning';
      case 'medical': return 'error';
      case 'administrative': return 'info';
      case 'resident_file': return 'secondary';
      case 'staff_file': return 'secondary';
      default: return 'default';
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <Description />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <Description />;
    if (type.includes('word') || type.includes('doc')) return <Description />;
    if (type.includes('excel') || type.includes('sheet')) return <Description />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <Visibility />;
    return <Description />;
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
            Documents Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage facility documents and files
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateDocument}
        >
          Add Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Documents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getCategoryIcon(document.category)}
                    </Avatar>
                    <Typography variant="subtitle2">{document.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getCategoryIcon(document.category)}
                    label={document.category.replace('_', ' ').toUpperCase()}
                    color={getCategoryColor(document.category) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      {getFileIcon(document.fileType)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{document.fileType || 'Unknown'}</Typography>
                      {document.filePath && (
                        <Link href={document.filePath} target="_blank" rel="noopener">
                          <Typography variant="caption" color="primary">
                            View File
                          </Typography>
                        </Link>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={document.version} size="small" />
                </TableCell>
                <TableCell>
                  {new Date(document.uploadDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={document.isArchived ? 'Archived' : 'Active'}
                    color={document.isArchived ? 'default' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Document">
                    <IconButton onClick={() => window.open(document.filePath, '_blank')}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton onClick={() => window.open(document.filePath, '_blank')}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Document">
                    <IconButton onClick={() => handleEditDocument(document)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Document">
                    <IconButton onClick={() => handleDeleteDocument(document.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Document Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDocument ? 'Edit Document' : 'Add New Document'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
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
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <MenuItem value="license">License</MenuItem>
                    <MenuItem value="insurance">Insurance</MenuItem>
                    <MenuItem value="compliance">Compliance</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="administrative">Administrative</MenuItem>
                    <MenuItem value="resident_file">Resident File</MenuItem>
                    <MenuItem value="staff_file">Staff File</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="File Type"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  placeholder="e.g., PDF, DOC, JPG"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="File Path/URL"
                  value={formData.filePath}
                  onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                  required
                  placeholder="Enter file path or URL"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isArchived}
                      onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                    />
                  }
                  label="Archived"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDocument}>
            {selectedDocument ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityDocuments;
