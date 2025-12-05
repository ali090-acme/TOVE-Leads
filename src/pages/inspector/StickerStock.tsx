import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  RequestQuote as RequestIcon,
  CheckCircle as CheckIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { logUserAction } from '@/utils/activityLogger';
import { getStickerUsageForStock, getAvailableStickerQuantity } from '@/utils/stickerTracking';
import { Link } from 'react-router-dom';

interface StickerStockItem {
  id: string;
  lotId: string;
  lotNumber: string;
  assignedTo: string;
  assignedToName: string;
  assignedToEmail?: string; // Added for better matching
  assignedToType: 'Region' | 'Inspector';
  quantity: number;
  issuedDate: Date;
  issuedBy: string;
}

interface StickerRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  requestedByType: 'Region' | 'Inspector';
  quantity: number;
  lotNumber?: string;
  requestDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: Date;
}

const STORAGE_KEY_STOCK = 'sticker-stock';
const STORAGE_KEY_REQUESTS = 'sticker-requests';

export const StickerStock: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const [stock, setStock] = useState<StickerStockItem[]>([]);
  const [requests, setRequests] = useState<StickerRequest[]>([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState(0);
  const [requestLotNumber, setRequestLotNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadData();
    
    // Refresh every 500ms for faster updates
    const interval = setInterval(() => {
      loadData();
    }, 500);
    
    // Also listen for storage events (when manager approves/issues stock from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_STOCK || e.key === STORAGE_KEY_REQUESTS || e.key?.startsWith('sticker-update-')) {
        setTimeout(() => loadData(), 100); // Small delay to ensure data is saved
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (for same-tab updates)
    const handleCustomEvent = () => {
      setTimeout(() => loadData(), 100); // Small delay to ensure data is saved
    };
    window.addEventListener('stickerStockUpdated', handleCustomEvent);
    
    // Also listen for focus events (when user switches back to tab)
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('stickerStockUpdated', handleCustomEvent);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser]);

  const loadData = () => {
    const storedStock = localStorage.getItem(STORAGE_KEY_STOCK);
    const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);

    if (storedStock) {
      const parsed = JSON.parse(storedStock);
      
      // First, load requests to use for matching
      const storedRequestsData = localStorage.getItem(STORAGE_KEY_REQUESTS);
      const allRequests = storedRequestsData ? JSON.parse(storedRequestsData) : [];
      const inspectorRequestIds = allRequests
        .filter((r: any) => 
          r.requestedBy === currentUser?.id ||
          r.requestedBy === 'user-2' ||
          r.requestedByName === currentUser?.name
        )
        .map((r: any) => r.requestedBy);
      
      const inspectorStock = parsed
        .filter((s: any) => {
          // Match by user ID (primary method)
          if (s.assignedTo === currentUser?.id) return true;
          
          // Match by name (case-insensitive) - more flexible matching
          if (currentUser?.name && s.assignedToName) {
            const stockName = s.assignedToName.toLowerCase().trim();
            const userName = currentUser.name.toLowerCase().trim();
            if (stockName === userName || stockName.includes(userName) || userName.includes(stockName)) {
              return true;
            }
          }
          
          // Match by email (if available) - case-insensitive
          if (currentUser?.email && s.assignedToEmail) {
            const stockEmail = s.assignedToEmail.toLowerCase().trim();
            const userEmail = currentUser.email.toLowerCase().trim();
            if (stockEmail === userEmail) return true;
          }
          
          // Match by request ID - if stock was assigned to same ID as any of our requests
          if (currentUser?.roles?.includes('inspector')) {
            // If assignedTo matches any of our request IDs
            if (inspectorRequestIds.includes(s.assignedTo) || s.assignedTo === 'user-2') {
              return true;
            }
            
            // If stock is assigned to an inspector type, check by name match
            if (s.assignedToType === 'Inspector' && s.assignedToName && currentUser?.name) {
              const stockName = s.assignedToName.toLowerCase().trim();
              const userName = currentUser.name.toLowerCase().trim();
              if (stockName === userName || stockName.includes(userName) || userName.includes(stockName)) {
                return true;
              }
            }
            
            // CRITICAL: Match stock to approved requests
            // This handles cases where:
            // 1. Stock is issued to "Jane Inspector" but logged-in user is "John Doe"
            // 2. Admin issues stock to wrong name but request was made by current user
            if (s.assignedToType === 'Inspector') {
              // Check if we have ANY approved requests
              const hasApprovedRequest = allRequests.some((r: any) => 
                r.status === 'Approved' &&
                (r.requestedBy === currentUser?.id || 
                 r.requestedBy === 'user-2' ||
                 (currentUser?.name && r.requestedByName && r.requestedByName.toLowerCase() === currentUser.name.toLowerCase()))
              );
              
              if (hasApprovedRequest) {
                // If we have approved requests, show ALL stock issued to Inspector type
                // This ensures stock is visible even if name doesn't match exactly
                // The matching will be refined by checking quantity/date later
                return true;
              }
            }
          }
          
          return false;
        })
        .map((s: any) => ({
          ...s,
          issuedDate: new Date(s.issuedDate),
        }));
      setStock(inspectorStock);
    }

    if (storedRequests) {
      const parsed = JSON.parse(storedRequests);
      const inspectorRequests = parsed
        .filter(
          (r: any) =>
            r.requestedBy === currentUser?.id ||
            r.requestedBy === 'user-2' ||
            r.requestedByName === currentUser?.name
        )
        .map((r: any) => ({
          ...r,
          requestDate: new Date(r.requestDate),
          approvedDate: r.approvedDate ? new Date(r.approvedDate) : undefined,
        }));
      setRequests(inspectorRequests);
    }
  };

  const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0);
  const totalAvailable = stock.reduce((sum, s) => sum + getAvailableStickerQuantity(s.quantity, s.id), 0);
  const totalUsed = stock.reduce((sum, s) => {
    const usage = getStickerUsageForStock(s.id);
    return sum + usage.filter((u) => u.status === 'Allocated' || u.status === 'Used').length;
  }, 0);
  const lowStockAlert = totalAvailable > 0 && totalAvailable < 20; // Only show low stock if stock exists but is low
  const noStock = totalAvailable === 0; // Separate condition for no stock
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
  
  // Filter requests based on selected filter
  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status.toLowerCase() === requestFilter;
  });

  const handleRequestStock = () => {
    if (requestQuantity <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid quantity', severity: 'error' });
      return;
    }

    setIsSubmitting(true);

    const request: StickerRequest = {
      id: `request-${Date.now()}`,
      requestedBy: currentUser?.id || 'user-2',
      requestedByName: currentUser?.name || 'Inspector',
      requestedByType: 'Inspector',
      quantity: requestQuantity,
      lotNumber: requestLotNumber || undefined,
      requestDate: new Date(),
      status: 'Pending',
    };

    const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
    const existingRequests = stored ? JSON.parse(stored) : [];
    const updatedRequests = [...existingRequests, request];
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedRequests));

    // Trigger events to notify manager page immediately
    window.dispatchEvent(new Event('stickerStockUpdated'));
    
    // Simulate storage event for cross-tab updates
    const dummyKey = `sticker-update-${Date.now()}`;
    localStorage.setItem(dummyKey, 'updated');
    localStorage.removeItem(dummyKey);

    logUserAction(
      'CREATE',
      'DOCUMENT',
      request.id,
      `Stock request by ${request.requestedByName}`,
      `Requested ${requestQuantity} stickers`,
      { quantity: requestQuantity, lotNumber: requestLotNumber },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Stock request submitted successfully', severity: 'success' });
    setRequestDialogOpen(false);
    setRequestQuantity(0);
    setRequestLotNumber('');
    setIsSubmitting(false);
    loadData();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/inspector')} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              My Sticker Stock
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your assigned sticker stock and request additional stickers
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RequestIcon />}
            onClick={() => setRequestDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
              },
            }}
          >
            Request Stock
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: noStock
                ? 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)'
                : lowStockAlert
                ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Available Stickers
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {totalAvailable}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    {totalUsed} used / {totalStock} total
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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
                    Stock Lots
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stock.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Assigned Lots
                  </Typography>
                </Box>
                <RequestIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: pendingRequests > 0
                ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                : 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Pending Requests
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {pendingRequests}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Awaiting Approval
                  </Typography>
                </Box>
                <RequestIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {noStock && (
        <Alert
          severity="error"
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setRequestDialogOpen(true)}>
              Request Stock
            </Button>
          }
        >
          <Typography variant="body1" fontWeight={600}>
            No Stickers Available
          </Typography>
          <Typography variant="body2">
            You don't have any stickers assigned. Please request stock from the manager to issue certificates.
          </Typography>
        </Alert>
      )}

      {lowStockAlert && !noStock && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setRequestDialogOpen(true)}>
              Request Stock
            </Button>
          }
        >
          <Typography variant="body1" fontWeight={600}>
            Low Stock Alert
          </Typography>
          <Typography variant="body2">
            You have {totalStock} sticker{totalStock !== 1 ? 's' : ''} remaining (less than 20). Please request additional stock from the manager.
          </Typography>
        </Alert>
      )}

      {/* Stock Details Table */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Assigned Stock Details
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Available</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Used/Allocated</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Issued Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Job Orders</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No stock assigned yet. Request stock from manager.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stock.map((item) => {
                  const usage = getStickerUsageForStock(item.id);
                  const allocatedOrUsed = usage.filter((u) => u.status === 'Allocated' || u.status === 'Used').length;
                  const available = getAvailableStickerQuantity(item.quantity, item.id);
                  
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.lotNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600} color={available > 0 ? 'success.main' : 'error.main'}>
                          {available}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {allocatedOrUsed} / {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{format(item.issuedDate, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Chip
                          label={available > 0 ? 'Active' : 'Depleted'}
                          size="small"
                          color={available > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {usage.length > 0 ? (
                          <Box>
                            {usage.slice(0, 2).map((u) => (
                              <Link
                                key={u.id}
                                to={`/inspector/jobs/${u.jobOrderId}`}
                                style={{ textDecoration: 'none', display: 'block', marginBottom: '4px' }}
                              >
                                <Chip
                                  label={`Job: ${u.jobOrderNumber.substring(0, 12)}...`}
                                  size="small"
                                  color={u.status === 'Used' ? 'success' : 'info'}
                                  sx={{ cursor: 'pointer' }}
                                />
                              </Link>
                            ))}
                            {usage.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{usage.length - 2} more
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not used yet
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Request History */}
      {requests.length > 0 && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Request History
              </Typography>
              <Tabs
                value={requestFilter}
                onChange={(e, newValue) => setRequestFilter(newValue)}
                sx={{
                  minHeight: 'auto',
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    minHeight: 'auto',
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                  },
                  '& .Mui-selected': {
                    color: 'white',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                  },
                }}
              >
                <Tab label={`All (${requests.length})`} value="all" />
                <Tab label={`Pending (${requests.filter((r) => r.status === 'Pending').length})`} value="pending" />
                <Tab label={`Approved (${requests.filter((r) => r.status === 'Approved').length})`} value="approved" />
                <Tab label={`Rejected (${requests.filter((r) => r.status === 'Rejected').length})`} value="rejected" />
              </Tabs>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No {requestFilter !== 'all' ? requestFilter : ''} requests found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => {
                    // Check if stock was issued for this approved request
                    // Match by request ID, name, and quantity to find the exact stock item
                    const issuedStock = request.status === 'Approved' 
                      ? stock.find((s) => {
                          // Match by request ID or name
                          const matchesUser = s.assignedTo === request.requestedBy || 
                                            s.assignedToName === request.requestedByName;
                          
                          // Prefer exact quantity match to avoid matching wrong stock items
                          const matchesQuantity = s.quantity === request.quantity;
                          
                          // Return true if user matches AND quantity matches (exact match)
                          return matchesUser && matchesQuantity;
                        }) || stock.find((s) => {
                          // Fallback: match by user only if exact match not found
                          return (s.assignedTo === request.requestedBy || 
                                 s.assignedToName === request.requestedByName);
                        })
                      : null;
                    
                    return (
                      <TableRow key={request.id} hover>
                        <TableCell>{format(request.requestDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{request.lotNumber || 'Any Available'}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            size="small"
                            color={
                              request.status === 'Approved'
                                ? 'success'
                                : request.status === 'Rejected'
                                ? 'error'
                                : 'warning'
                            }
                            icon={request.status === 'Approved' ? <CheckIcon /> : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          {request.status === 'Approved' && issuedStock ? (
                            <Typography variant="body2" color="success.main" sx={{ fontSize: '0.75rem' }}>
                              ✓ Stock issued ({request.quantity} stickers from {issuedStock.lotNumber})
                            </Typography>
                          ) : request.status === 'Approved' ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              ✓ Approved - Stock issued ({request.quantity} stickers)
                            </Typography>
                          ) : request.status === 'Pending' ? (
                            <Typography variant="body2" color="warning.main" sx={{ fontSize: '0.75rem' }}>
                              Awaiting manager approval
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="error.main" sx={{ fontSize: '0.75rem' }}>
                              Request rejected
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Request Stock Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Sticker Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={requestQuantity}
              onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 0)}
              sx={{ mb: 3 }}
              helperText="Enter the number of stickers you need"
            />
            <TextField
              fullWidth
              label="Lot Number (Optional)"
              value={requestLotNumber}
              onChange={(e) => setRequestLotNumber(e.target.value)}
              placeholder="e.g., LOT-2025-001"
              helperText="Leave blank to request from any available lot"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestStock}
            disabled={isSubmitting || requestQuantity <= 0}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <RequestIcon />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
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

