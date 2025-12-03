import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Grid,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Snackbar,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Label as LabelIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { logUserAction } from '@/utils/activityLogger';

interface Document {
  id: string;
  name: string;
  fileName: string;
  category: string;
  tags: string[];
  uploadedAt: Date;
  uploadedBy: string;
  fileSize: number;
  fileType: string;
  description?: string;
  expiryDate?: Date;
  relatedTo?: {
    type: 'certificate' | 'job-order' | 'payment' | 'other';
    id: string;
    name: string;
  };
}

const STORAGE_KEY = 'user-documents';
const CATEGORIES = [
  'Certificate',
  'Payment Proof',
  'Identity Document',
  'Training Certificate',
  'Inspection Report',
  'Renewal Document',
  'Other',
];

export const DocumentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ anchor: HTMLElement; doc: Document } | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: '',
    tags: [] as string[],
    description: '',
    expiryDate: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchText, selectedCategory, selectedTags]);

  const loadDocuments = () => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${currentUser?.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const docs = parsed.map((doc: any) => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
      }));
      setDocuments(docs);
      
      // Extract all unique tags
      const allTags = new Set<string>();
      docs.forEach((doc: Document) => {
        doc.tags.forEach((tag) => allTags.add(tag));
      });
      setAvailableTags(Array.from(allTags));
    }
  };

  const saveDocuments = (docs: Document[]) => {
    localStorage.setItem(`${STORAGE_KEY}-${currentUser?.id}`, JSON.stringify(docs));
    setDocuments(docs);
    
    // Update available tags
    const allTags = new Set<string>();
    docs.forEach((doc) => {
      doc.tags.forEach((tag) => allTags.add(tag));
    });
    setAvailableTags(Array.from(allTags));
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchLower) ||
          doc.fileName.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedTags.every((tag) => doc.tags.includes(tag))
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleUpload = () => {
    if (!uploadedFile || !newDocument.name || !newDocument.category) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const document: Document = {
      id: `doc-${Date.now()}`,
      name: newDocument.name,
      fileName: uploadedFile.name,
      category: newDocument.category,
      tags: newDocument.tags,
      uploadedAt: new Date(),
      uploadedBy: currentUser?.id || 'system',
      fileSize: uploadedFile.size,
      fileType: uploadedFile.type,
      description: newDocument.description || undefined,
      expiryDate: newDocument.expiryDate ? new Date(newDocument.expiryDate) : undefined,
    };

    const updatedDocs = [...documents, document];
    saveDocuments(updatedDocs);

    logUserAction(
      'UPLOAD',
      'DOCUMENT',
      document.id,
      document.name,
      `Uploaded document: ${document.name}`,
      { category: document.category, tags: document.tags },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Document uploaded successfully', severity: 'success' });
    setUploadDialogOpen(false);
    setNewDocument({ name: '', category: '', tags: [], description: '', expiryDate: '' });
    setUploadedFile(null);
  };

  const handleEdit = () => {
    if (!selectedDocument || !newDocument.name || !newDocument.category) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const updatedDocs = documents.map((doc) =>
      doc.id === selectedDocument.id
        ? {
            ...doc,
            name: newDocument.name,
            category: newDocument.category,
            tags: newDocument.tags,
            description: newDocument.description || undefined,
            expiryDate: newDocument.expiryDate ? new Date(newDocument.expiryDate) : undefined,
          }
        : doc
    );
    saveDocuments(updatedDocs);

    logUserAction(
      'UPDATE',
      'DOCUMENT',
      selectedDocument.id,
      selectedDocument.name,
      `Updated document: ${newDocument.name}`,
      { category: newDocument.category, tags: newDocument.tags },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Document updated successfully', severity: 'success' });
    setEditDialogOpen(false);
    setSelectedDocument(null);
    setNewDocument({ name: '', category: '', tags: [], description: '', expiryDate: '' });
  };

  const handleDelete = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updatedDocs = documents.filter((d) => d.id !== docId);
    saveDocuments(updatedDocs);

    logUserAction(
      'DELETE',
      'DOCUMENT',
      docId,
      doc.name,
      `Deleted document: ${doc.name}`,
      {},
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'success' });
    setMenuAnchor(null);
  };

  const handleDownload = (doc: Document) => {
    // In a real app, this would download from server
    // For now, we'll create a mock download
    const blob = new Blob(['Mock file content'], { type: doc.fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logUserAction(
      'DOWNLOAD',
      'DOCUMENT',
      doc.id,
      doc.name,
      `Downloaded document: ${doc.name}`,
      {},
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );
  };

  const openEditDialog = (doc: Document) => {
    setSelectedDocument(doc);
    setNewDocument({
      name: doc.name,
      category: doc.category,
      tags: doc.tags,
      description: doc.description || '',
      expiryDate: doc.expiryDate ? format(doc.expiryDate, 'yyyy-MM-dd') : '',
    });
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isExpiringSoon = (doc: Document): boolean => {
    if (!doc.expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (doc.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (doc: Document): boolean => {
    if (!doc.expiryDate) return false;
    return doc.expiryDate < new Date();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/client')} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              Document Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload, categorize, and manage your documents
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
              },
            }}
          >
            Upload Document
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Autocomplete
                multiple
                options={availableTags}
                value={selectedTags}
                onChange={(_, newValue) => setSelectedTags(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Tags" placeholder="Select tags" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
          {selectedTags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                startIcon={<CloseIcon />}
                onClick={() => setSelectedTags([])}
              >
                Clear Tag Filters
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Documents Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchText || selectedCategory !== 'All' || selectedTags.length > 0
                ? 'No documents match your filters.'
                : 'Upload your first document to get started.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                },
              }}
            >
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: isExpired(doc) ? '2px solid' : isExpiringSoon(doc) ? '1px solid' : 'none',
                  borderColor: isExpired(doc) ? 'error.main' : isExpiringSoon(doc) ? 'warning.main' : 'transparent',
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderIcon />
                    <Typography variant="h6" fontWeight={600}>
                      {doc.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuAnchor({ anchor: e.currentTarget, doc })}
                    sx={{ color: 'white' }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      File Name
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.fileName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Category
                    </Typography>
                    <Chip label={doc.category} size="small" color="primary" />
                  </Box>
                  {doc.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {doc.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {doc.description && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">{doc.description}</Typography>
                    </Box>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Uploaded
                    </Typography>
                    <Typography variant="body2">{format(doc.uploadedAt, 'MMM dd, yyyy')}</Typography>
                  </Box>
                  {doc.expiryDate && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Expiry Date
                      </Typography>
                      <Typography
                        variant="body2"
                        color={isExpired(doc) ? 'error.main' : isExpiringSoon(doc) ? 'warning.main' : 'text.primary'}
                        fontWeight={isExpired(doc) || isExpiringSoon(doc) ? 600 : 400}
                      >
                        {format(doc.expiryDate, 'MMM dd, yyyy')}
                        {isExpired(doc) && ' (EXPIRED)'}
                        {isExpiringSoon(doc) && ' (Expiring Soon)'}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(doc)}
                      fullWidth
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedFile(e.target.files[0]);
                    if (!newDocument.name) {
                      setNewDocument({ ...newDocument, name: e.target.files[0].name });
                    }
                  }
                }}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span" fullWidth startIcon={<UploadIcon />}>
                  {uploadedFile ? uploadedFile.name : 'Choose File'}
                </Button>
              </label>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newDocument.category}
                  label="Category"
                  onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={availableTags}
                value={newDocument.tags}
                onChange={(_, newValue) => setNewDocument({ ...newDocument, tags: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date (Optional)"
                value={newDocument.expiryDate}
                onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newDocument.category}
                  label="Category"
                  onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={availableTags}
                value={newDocument.tags}
                onChange={(_, newValue) => setNewDocument({ ...newDocument, tags: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date (Optional)"
                value={newDocument.expiryDate}
                onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor?.anchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && openEditDialog(menuAnchor.doc)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && handleDownload(menuAnchor.doc)}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem
          onClick={() => menuAnchor && handleDelete(menuAnchor.doc.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

