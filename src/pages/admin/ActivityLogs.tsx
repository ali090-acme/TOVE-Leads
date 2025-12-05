import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getActivityLogs,
  filterLogs,
  exportLogsToCSV,
  exportLogsToJSON,
  clearOldLogs,
  ActivityLog,
  ActionType,
  EntityType,
} from '@/utils/activityLogger';
import { useAppContext } from '@/context/AppContext';

export const ActivityLogs: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filters
  const [searchText, setSearchText] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionType | ''>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('');
  const [severityFilter, setSeverityFilter] = useState<'INFO' | 'WARNING' | 'ERROR' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchText, actionTypeFilter, entityTypeFilter, severityFilter, startDate, endDate, userFilter]);

  const loadLogs = () => {
    const allLogs = getActivityLogs();
    setLogs(allLogs);
  };

  const applyFilters = () => {
    const filters: any = {};
    if (actionTypeFilter) filters.actionType = actionTypeFilter;
    if (entityTypeFilter) filters.entityType = entityTypeFilter;
    if (severityFilter) filters.severity = severityFilter;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end;
    }
    if (userFilter) filters.userId = userFilter;
    if (searchText) filters.searchText = searchText;

    const filtered = filterLogs(logs, filters);
    setFilteredLogs(filtered);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setActionTypeFilter('');
    setEntityTypeFilter('');
    setSeverityFilter('');
    setStartDate('');
    setEndDate('');
    setUserFilter('');
  };

  const handleExportCSV = () => {
    const csv = exportLogsToCSV(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Logs exported to CSV successfully', severity: 'success' });
  };

  const handleExportJSON = () => {
    const json = exportLogsToJSON(filteredLogs);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Logs exported to JSON successfully', severity: 'success' });
  };

  const handleClearOldLogs = () => {
    const clearedCount = clearOldLogs();
    loadLogs();
    setSnackbar({
      open: true,
      message: `Cleared ${clearedCount} old log entries`,
      severity: 'success',
    });
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getActionTypeColor = (actionType: ActionType) => {
    if (actionType.includes('ERROR') || actionType === 'DELETE' || actionType === 'REJECT') return 'error';
    if (actionType.includes('WARNING')) return 'warning';
    if (actionType === 'APPROVE' || actionType === 'CREATE') return 'success';
    return 'default';
  };

  // Check if user has access (Manager or GM only)
  const hasAccess = currentUser?.currentRole === 'manager' || currentUser?.currentRole === 'gm';
  
  if (!hasAccess) {
    return (
      <Box>
        <Alert severity="error">You do not have permission to access Activity Logs.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
          Activity Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor user actions and system events for audit and compliance
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary.dark">
                {logs.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Logs
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'error.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="error.dark">
                {logs.filter((l) => l.severity === 'ERROR').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Errors
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'warning.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="warning.dark">
                {logs.filter((l) => l.severity === 'WARNING').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Warnings
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'success.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="success.dark">
                {filteredLogs.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Filtered Results
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
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
            <FilterIcon />
            <Typography variant="h6" fontWeight={600}>
              Filters
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white' }}
          >
            Clear All
          </Button>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search in description, user, entity..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={actionTypeFilter}
                  label="Action Type"
                  onChange={(e) => setActionTypeFilter(e.target.value as ActionType | '')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="LOGIN">Login</MenuItem>
                  <MenuItem value="LOGOUT">Logout</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                  <MenuItem value="APPROVE">Approve</MenuItem>
                  <MenuItem value="REJECT">Reject</MenuItem>
                  <MenuItem value="SUBMIT">Submit</MenuItem>
                  <MenuItem value="VERIFY">Verify</MenuItem>
                  <MenuItem value="PAYMENT">Payment</MenuItem>
                  <MenuItem value="SYSTEM_ERROR">System Error</MenuItem>
                  <MenuItem value="SYSTEM_WARNING">System Warning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={entityTypeFilter}
                  label="Entity Type"
                  onChange={(e) => setEntityTypeFilter(e.target.value as EntityType | '')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="CERTIFICATE">Certificate</MenuItem>
                  <MenuItem value="JOB_ORDER">Job Order</MenuItem>
                  <MenuItem value="PAYMENT">Payment</MenuItem>
                  <MenuItem value="CLIENT">Client</MenuItem>
                  <MenuItem value="TRAINING_SESSION">Training</MenuItem>
                  <MenuItem value="DOCUMENT">Document</MenuItem>
                  <MenuItem value="SYSTEM">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  label="Severity"
                  onChange={(e) => setSeverityFilter(e.target.value as 'INFO' | 'WARNING' | 'ERROR' | '')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="INFO">Info</MenuItem>
                  <MenuItem value="WARNING">Warning</MenuItem>
                  <MenuItem value="ERROR">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredLogs.length} of {logs.length} logs
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadLogs}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportJSON}
          >
            Export JSON
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearOldLogs}
          >
            Clear Old Logs
          </Button>
        </Box>
      </Box>

      {/* Logs Table */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actual User (Logs)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Displayed User (Front End)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No logs found matching the filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {log.userName || 'System'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.userRole || 'N/A'}
                      </Typography>
                      {log.isDelegated && (
                        <Chip
                          label="Delegated"
                          size="small"
                          color="warning"
                          sx={{ mt: 0.5, fontSize: '0.65rem', height: '18px' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {log.isDelegated && log.displayedUserName ? (
                        <>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {log.displayedUserName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.displayedUserRole || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            (Displayed in UI)
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Same as actual user
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.actionType}
                        size="small"
                        color={getActionTypeColor(log.actionType) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.entityType}</Typography>
                      {log.entityName && (
                        <Typography variant="caption" color="text.secondary">
                          {log.entityName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.severity}
                        size="small"
                        color={getSeverityColor(log.severity) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(log)}
                        sx={{ color: 'primary.main' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography variant="body2">{selectedLog.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                  <Typography variant="body2">{format(selectedLog.timestamp, 'PPpp')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Actual User (for accountability)</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedLog.userName || 'System'}</Typography>
                  {selectedLog.isDelegated && (
                    <Chip label="Delegated Action" size="small" color="warning" sx={{ mt: 1 }} />
                  )}
                </Grid>
                {selectedLog.isDelegated && selectedLog.displayedUserName ? (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Displayed User (shown in UI)</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">{selectedLog.displayedUserName}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedLog.displayedUserRole || 'N/A'}</Typography>
                  </Grid>
                ) : (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Role</Typography>
                    <Typography variant="body2">{selectedLog.userRole || 'N/A'}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Action Type</Typography>
                  <Typography variant="body2">{selectedLog.actionType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Entity Type</Typography>
                  <Typography variant="body2">{selectedLog.entityType}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{selectedLog.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Details</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

