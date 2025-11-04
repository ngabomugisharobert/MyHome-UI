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
  Download,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ResidentDocumentsProps {
  residentId: string;
}

const ResidentDocuments: React.FC<ResidentDocumentsProps> = ({ residentId }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'administrative',
    expiryDate: '',
    isConfidential: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [residentId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/resident/${residentId}?page=1&limit=100`);
      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
      } else {
        setDocuments([]);
        console.warn('Documents API returned unsuccessful response:', response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      // If it's a 404 or empty, just set empty array instead of showing error
      if (error.response?.status === 404 || error.response?.status === 400) {
        setDocuments([]);
      } else {
        showError(error.response?.data?.message || 'Failed to load documents');
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (document?: any) => {
    if (document) {
      setSelectedDocument(document);
      setFormData({
        title: document.title || '',
        description: document.description || '',
        category: document.category || 'administrative',
        expiryDate: document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : '',
        isConfidential: document.isConfidential || false,
      });
      setSelectedFile(null);
    } else {
      setSelectedDocument(null);
      setFormData({
        title: '',
        description: '',
        category: 'administrative',
        expiryDate: '',
        isConfidential: false,
      });
      setSelectedFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocument(null);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      if (selectedDocument) {
        // Update existing document (no file upload)
        const data = {
          ...formData,
          residentId,
        };
        await api.put(`/documents/${selectedDocument.id}`, data);
        showSuccess('Document updated successfully');
        handleCloseDialog();
        fetchDocuments();
      } else {
        // Create new document with file upload
        if (!selectedFile) {
          showError('Please select a file to upload');
          setUploading(false);
          return;
        }

        // Validate file size
        if (selectedFile.size > 10 * 1024 * 1024) {
          showError('File size must be less than 10MB');
          setUploading(false);
          return;
        }

        // Validate required fields
        if (!formData.title?.trim()) {
          showError('Please enter a title for the document');
          setUploading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile);
        formDataToSend.append('title', formData.title.trim());
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('category', formData.category);
        formDataToSend.append('residentId', residentId);
        if (formData.expiryDate) {
          formDataToSend.append('expiryDate', formData.expiryDate);
        }
        formDataToSend.append('isConfidential', formData.isConfidential.toString());

        try {
          const response = await api.post('/documents', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            showSuccess('Document uploaded successfully');
            handleCloseDialog();
            fetchDocuments();
          } else {
            showError(response.data.message || 'Failed to upload document');
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          const errorMessage = uploadError.response?.data?.message || 
                             uploadError.message || 
                             'Failed to upload document. Please check your file and try again.';
          showError(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Failed to save document:', error);
      showError(error.response?.data?.message || 'Failed to save document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }

      // Validate file type/extension on client
      const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      const allowedExts = ['.jpg','.jpeg','.png','.gif','.webp','.pdf','.doc','.docx','.xls','.xlsx','.txt','.csv','.ppt','.pptx'];
      const fileNameLower = file.name.toLowerCase();
      const ext = fileNameLower.substring(fileNameLower.lastIndexOf('.'));
      if (!allowedMimes.includes(file.type) && !allowedExts.includes(ext)) {
        showError(`Invalid file type. Allowed: Images, PDF, Word, Excel, PowerPoint, Text, CSV`);
        return;
      }
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData({ ...formData, title: file.name });
      }
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Document downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download document:', error);
      showError('Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/documents/${id}`);
      showSuccess('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      showError('Failed to delete document');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical':
        return 'error';
      case 'legal':
        return 'warning';
      case 'insurance':
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
          Documents
        </Typography>
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Document
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              (user?.role === 'admin' || user?.role === 'supervisor') && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => handleOpenDialog()}
                >
                  Upload Document
                </Button>
              )
            }
          >
            No documents found for this resident.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {(user?.role === 'admin' || user?.role === 'supervisor') && 
              'Click "Add Document" to upload the first document.'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={document.category?.toUpperCase()}
                      color={getCategoryColor(document.category)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{document.fileName}</TableCell>
                  <TableCell>
                    {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(document)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      title="Download"
                      onClick={() => handleDownload(document.id, document.fileName)}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(document.id)}
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
          {selectedDocument ? 'Edit Document' : 'Add Document'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!selectedDocument && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<AddIcon />}
                    >
                      {selectedFile ? selectedFile.name : 'Select File'}
                    </Button>
                  </label>
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
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
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="license">License</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="compliance">Compliance</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="administrative">Administrative</MenuItem>
                <MenuItem value="legal">Legal</MenuItem>
                <MenuItem value="financial">Financial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={uploading || (!selectedDocument && !selectedFile)}
            startIcon={uploading ? <CircularProgress size={16} /> : null}
          >
            {uploading ? 'Uploading...' : (selectedDocument ? 'Update' : 'Upload')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentDocuments;
