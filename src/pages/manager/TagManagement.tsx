import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { Tag } from '@/types';
import {
  getAllTags,
  createTag,
  getAvailableTags,
  getTagsByStatus,
  getRemovedTags,
} from '@/utils/tagTracking';
import { logUserAction } from '@/utils/activityLogger';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const TagManagement: React.FC = () => {
  const { currentUser } = useAppContext();
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [newTagNumber, setNewTagNumber] = useState('');
  const [newTagNotes, setNewTagNotes] = useState('');
  const [searchTagNumber, setSearchTagNumber] = useState('');
  const [searchResult, setSearchResult] = useState<Tag | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadTags();
    
    // Auto-refresh every 1 second for real-time updates
    const interval = setInterval(() => {
      loadTags();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTags = () => {
    const allTags = getAllTags();
    setTags(allTags);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateTag = () => {
    if (!newTagNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a tag number',
        severity: 'error',
      });
      return;
    }

    try {
      const tag = createTag(
        newTagNumber.trim(),
        currentUser?.id || 'manager',
        newTagNotes.trim() || undefined
      );

      logUserAction(
        'CREATE',
        'DOCUMENT',
        tag.id,
        `Tag created: ${tag.tagNumber}`,
        `Manager created new tag with number ${tag.tagNumber}`,
        { tagNumber: tag.tagNumber },
        currentUser?.id,
        currentUser?.name,
        currentUser?.currentRole
      );

      setSnackbar({
        open: true,
        message: `Tag ${tag.tagNumber} created successfully`,
        severity: 'success',
      });

      setNewTagNumber('');
      setNewTagNotes('');
      setCreateDialogOpen(false);
      loadTags();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create tag',
        severity: 'error',
      });
    }
  };

  const handleSearchTag = () => {
    if (!searchTagNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a tag number to search',
        severity: 'error',
      });
      return;
    }

    const tag = tags.find(t => t.tagNumber === searchTagNumber.trim());
    if (tag) {
      setSearchResult(tag);
    } else {
      setSearchResult(null);
      setSnackbar({
        open: true,
        message: `Tag ${searchTagNumber.trim()} not found`,
        severity: 'warning',
      });
    }
  };

  const getStatusColor = (status: Tag['status']) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Allocated':
        return 'info';
      case 'Used':
        return 'default';
      case 'Removed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Tag['status']) => {
    switch (status) {
      case 'Available':
        return <CheckCircleIcon fontSize="small" />;
      case 'Allocated':
        return <WarningIcon fontSize="small" />;
      case 'Removed':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const availableTags = getAvailableTags();
  const allocatedTags = getTagsByStatus('Allocated');
  const usedTags = getTagsByStatus('Used');
  const removedTags = getRemovedTags();

  const filteredTags = (() => {
    switch (activeTab) {
      case 0:
        return tags; // All
      case 1:
        return availableTags;
      case 2:
        return allocatedTags;
      case 3:
        return usedTags;
      case 4:
        return removedTags;
      default:
        return tags;
    }
  })();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
          Tag Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage physical tags with unique numbers for traceability. Tags are ready-to-use items (not printable).
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Tags
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {tags.length}
                  </Typography>
                </Box>
                <LabelIcon sx={{ fontSize: 48, opacity: 0.3, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Available
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {availableTags.length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Allocated
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {allocatedTags.length}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: removedTags.length > 0
                ? 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)'
                : 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Removed
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {removedTags.length}
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert for removed tags */}
      {removedTags.length > 0 && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight={600}>
            {removedTags.length} Tag{removedTags.length !== 1 ? 's' : ''} Removed
          </Typography>
          <Typography variant="body2">
            {removedTags.length} tag{removedTags.length !== 1 ? 's have' : ' has'} been reported as removed. Check the "Removed" tab for details.
          </Typography>
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
            },
          }}
        >
          Enter New Tag
        </Button>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={() => setSearchDialogOpen(true)}
        >
          Search by Tag Number
        </Button>
      </Box>

      {/* Tabs */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`All (${tags.length})`} />
            <Tab label={`Available (${availableTags.length})`} />
            <Tab label={`Allocated (${allocatedTags.length})`} />
            <Tab label={`Used (${usedTags.length})`} />
            <Tab label={`Removed (${removedTags.length})`} />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={activeTab} index={0}>
            <TagTable tags={tags} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <TagTable tags={availableTags} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <TagTable tags={allocatedTags} />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <TagTable tags={usedTags} />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <TagTable tags={removedTags} />
          </TabPanel>
        </CardContent>
      </Card>

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enter New Tag</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tags are physical items (not printable). Enter the unique tag number from the shipment.
          </Alert>
          <TextField
            fullWidth
            label="Tag Number"
            value={newTagNumber}
            onChange={(e) => setNewTagNumber(e.target.value)}
            sx={{ mb: 2 }}
            required
            helperText="Enter the unique tag number"
            placeholder="e.g., TAG-2025-001"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={newTagNotes}
            onChange={(e) => setNewTagNotes(e.target.value)}
            placeholder="Add any notes about this tag..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTag}>
            Create Tag
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Tag Dialog */}
      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Search Tag by Number</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tag Number"
            value={searchTagNumber}
            onChange={(e) => setSearchTagNumber(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Enter tag number to search"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchTag();
              }
            }}
          />
          {searchResult && (
            <Card sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tag Found
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2"><strong>Tag Number:</strong> {searchResult.tagNumber}</Typography>
                <Typography variant="body2"><strong>Status:</strong> 
                  <Chip
                    label={searchResult.status}
                    size="small"
                    color={getStatusColor(searchResult.status) as any}
                    icon={getStatusIcon(searchResult.status) || undefined}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {searchResult.allocatedTo && (
                  <Typography variant="body2"><strong>Allocated To Job:</strong> {searchResult.allocatedTo}</Typography>
                )}
                {searchResult.removedAt && (
                  <Typography variant="body2" color="error">
                    <strong>Removed:</strong> {format(searchResult.removedAt, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                )}
                {searchResult.createdAt && (
                  <Typography variant="body2"><strong>Created:</strong> {format(searchResult.createdAt, 'MMM dd, yyyy')}</Typography>
                )}
              </Box>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSearchDialogOpen(false);
            setSearchTagNumber('');
            setSearchResult(null);
          }}>Close</Button>
          <Button variant="contained" onClick={handleSearchTag}>
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

// Tag Table Component
interface TagTableProps {
  tags: Tag[];
}

const TagTable: React.FC<TagTableProps> = ({ tags }) => {
  const getStatusColor = (status: Tag['status']) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Allocated':
        return 'info';
      case 'Used':
        return 'default';
      case 'Removed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Tag['status']) => {
    switch (status) {
      case 'Available':
        return <CheckCircleIcon fontSize="small" />;
      case 'Allocated':
        return <WarningIcon fontSize="small" />;
      case 'Removed':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (tags.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No tags found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell sx={{ fontWeight: 600 }}>Tag Number</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Allocated To</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Removed</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {tag.tagNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={tag.status}
                  size="small"
                  color={getStatusColor(tag.status) as any}
                  icon={getStatusIcon(tag.status) || undefined}
                />
              </TableCell>
              <TableCell>
                {tag.allocatedTo ? (
                  <Typography variant="body2" color="info.main">
                    Job: {tag.allocatedTo.substring(0, 12)}...
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {tag.createdAt ? format(tag.createdAt, 'MMM dd, yyyy') : '-'}
              </TableCell>
              <TableCell>
                {tag.removedAt ? (
                  <Typography variant="body2" color="error">
                    {format(tag.removedAt, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {tag.notes || '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

