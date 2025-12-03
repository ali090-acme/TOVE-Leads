import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Menu,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  TransferWithinAStation as TransferIcon,
  RequestQuote as RequestIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { logUserAction } from '@/utils/activityLogger';

interface StickerLot {
  id: string;
  lotNumber: string;
  size: string;
  quantity: number;
  issuedQuantity: number;
  availableQuantity: number;
  status: 'Active' | 'Depleted' | 'Archived';
  createdAt: Date;
  createdBy: string;
}

interface StickerStock {
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

interface StickerTransfer {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  quantity: number;
  lotNumber: string;
  transferDate: Date;
  transferredBy: string;
  status: 'Pending' | 'Completed' | 'Rejected';
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

const STORAGE_KEY_LOTS = 'sticker-lots';
const STORAGE_KEY_STOCK = 'sticker-stock';
const STORAGE_KEY_TRANSFERS = 'sticker-transfers';
const STORAGE_KEY_REQUESTS = 'sticker-requests';

export const StickerManager: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, users } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [lots, setLots] = useState<StickerLot[]>([]);
  const [stock, setStock] = useState<StickerStock[]>([]);
  const [transfers, setTransfers] = useState<StickerTransfer[]>([]);
  const [requests, setRequests] = useState<StickerRequest[]>([]);
  
  const [lotDialogOpen, setLotDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ anchor: HTMLElement; type: string; id: string } | null>(null);
  
  const [newLot, setNewLot] = useState({ lotNumber: '', size: '', quantity: 0 });
  const [issueData, setIssueData] = useState({ lotId: '', assignedTo: '', assignedToType: 'Inspector' as 'Region' | 'Inspector', quantity: 0 });
  const [transferData, setTransferData] = useState({ from: '', to: '', quantity: 0, lotNumber: '' });
  const [requestData, setRequestData] = useState({ quantity: 0, lotNumber: '' });
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 500ms for real-time updates
    const interval = setInterval(() => {
      loadData();
    }, 500);
    
    // Listen for storage events (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_REQUESTS ||
        e.key === STORAGE_KEY_STOCK ||
        e.key === STORAGE_KEY_LOTS ||
        e.key === STORAGE_KEY_TRANSFERS ||
        e.key?.startsWith('sticker-update-')
      ) {
        setTimeout(() => loadData(), 100); // Small delay to ensure data is saved
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (same-tab updates)
    const handleCustomEvent = () => {
      setTimeout(() => loadData(), 100);
    };
    window.addEventListener('stickerStockUpdated', handleCustomEvent);
    
    // Listen for focus events (when user switches back to tab)
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
  }, []);

  const loadData = () => {
    // Load from localStorage
    const storedLots = localStorage.getItem(STORAGE_KEY_LOTS);
    const storedStock = localStorage.getItem(STORAGE_KEY_STOCK);
    const storedTransfers = localStorage.getItem(STORAGE_KEY_TRANSFERS);
    const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);

    if (storedLots) {
      const parsed = JSON.parse(storedLots);
      setLots(parsed.map((lot: any) => ({ ...lot, createdAt: new Date(lot.createdAt) })));
    } else {
      // Mock initial data
      const mockLots: StickerLot[] = [
        {
          id: 'lot-1',
          lotNumber: 'LOT-2025-001',
          size: 'Small',
          quantity: 1000,
          issuedQuantity: 350,
          availableQuantity: 650,
          status: 'Active',
          createdAt: new Date('2025-01-01'),
          createdBy: 'admin',
        },
        {
          id: 'lot-2',
          lotNumber: 'LOT-2025-002',
          size: 'Medium',
          quantity: 500,
          issuedQuantity: 200,
          availableQuantity: 300,
          status: 'Active',
          createdAt: new Date('2025-01-05'),
          createdBy: 'admin',
        },
      ];
      setLots(mockLots);
      localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(mockLots));
    }

    if (storedStock) {
      const parsed = JSON.parse(storedStock);
      setStock(parsed.map((s: any) => ({ ...s, issuedDate: new Date(s.issuedDate) })));
    }

    if (storedTransfers) {
      const parsed = JSON.parse(storedTransfers);
      setTransfers(parsed.map((t: any) => ({ ...t, transferDate: new Date(t.transferDate) })));
    }

    if (storedRequests) {
      const parsed = JSON.parse(storedRequests);
      setRequests(parsed.map((r: any) => ({ ...r, requestDate: new Date(r.requestDate), approvedDate: r.approvedDate ? new Date(r.approvedDate) : undefined })));
    }
  };

  const saveLots = (updatedLots: StickerLot[]) => {
    localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(updatedLots));
    setLots(updatedLots);
  };

  const saveStock = (updatedStock: StickerStock[]) => {
    localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(updatedStock));
    setStock(updatedStock);
  };

  const saveTransfers = (updatedTransfers: StickerTransfer[]) => {
    localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(updatedTransfers));
    setTransfers(updatedTransfers);
  };

  const saveRequests = (updatedRequests: StickerRequest[]) => {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    // Trigger custom event to notify other components
    window.dispatchEvent(new Event('stickerStockUpdated'));
    
    // Simulate storage event for cross-tab updates
    const dummyKey = `sticker-update-${Date.now()}`;
    localStorage.setItem(dummyKey, 'updated');
    localStorage.removeItem(dummyKey);
  };

  const handleCreateLot = () => {
    if (!newLot.lotNumber || !newLot.size || newLot.quantity <= 0) {
      setSnackbar({ open: true, message: 'Please fill all fields correctly', severity: 'error' });
      return;
    }

    const lot: StickerLot = {
      id: `lot-${Date.now()}`,
      lotNumber: newLot.lotNumber,
      size: newLot.size,
      quantity: newLot.quantity,
      issuedQuantity: 0,
      availableQuantity: newLot.quantity,
      status: 'Active',
      createdAt: new Date(),
      createdBy: currentUser?.id || 'system',
    };

    const updatedLots = [...lots, lot];
    saveLots(updatedLots);

    logUserAction(
      'CREATE',
      'DOCUMENT',
      lot.id,
      lot.lotNumber,
      `Created sticker lot ${lot.lotNumber}`,
      { size: lot.size, quantity: lot.quantity },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Sticker lot created successfully', severity: 'success' });
    setLotDialogOpen(false);
    setNewLot({ lotNumber: '', size: '', quantity: 0 });
  };

  const handleIssueStock = () => {
    if (!issueData.lotId || !issueData.assignedTo || issueData.quantity <= 0) {
      setSnackbar({ open: true, message: 'Please fill all fields correctly', severity: 'error' });
      return;
    }

    const lot = lots.find((l) => l.id === issueData.lotId);
    if (!lot || lot.availableQuantity < issueData.quantity) {
      setSnackbar({ open: true, message: 'Insufficient stock available', severity: 'error' });
      return;
    }

    const assignedUser = users.find((u) => u.id === issueData.assignedTo);
    const stockItem: StickerStock = {
      id: `stock-${Date.now()}`,
      lotId: issueData.lotId,
      lotNumber: lot.lotNumber,
      assignedTo: issueData.assignedTo,
      assignedToName: assignedUser?.name || 'Unknown',
      assignedToEmail: assignedUser?.email || undefined, // Store email for better matching
      assignedToType: issueData.assignedToType,
      quantity: issueData.quantity,
      issuedDate: new Date(),
      issuedBy: currentUser?.id || 'system',
    };

    // Update lot
    const updatedLots = lots.map((l) =>
      l.id === issueData.lotId
        ? {
            ...l,
            issuedQuantity: l.issuedQuantity + issueData.quantity,
            availableQuantity: l.availableQuantity - issueData.quantity,
            status: l.availableQuantity - issueData.quantity === 0 ? 'Depleted' : l.status,
          }
        : l
    );
    saveLots(updatedLots);

    // Add stock
    const updatedStock = [...stock, stockItem];
    saveStock(updatedStock);
    
    // Trigger custom event to notify other components (like inspector page)
    window.dispatchEvent(new Event('stickerStockUpdated'));
    
    // Reload data to reflect changes
    loadData();

    logUserAction(
      'CREATE',
      'DOCUMENT',
      stockItem.id,
      `Stock issued to ${stockItem.assignedToName}`,
      `Issued ${issueData.quantity} stickers from ${lot.lotNumber}`,
      { lotNumber: lot.lotNumber, quantity: issueData.quantity, assignedTo: stockItem.assignedToName },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Stock issued successfully', severity: 'success' });
    setIssueDialogOpen(false);
    setIssueData({ lotId: '', assignedTo: '', assignedToType: 'Inspector', quantity: 0 });
  };

  const handleTransfer = () => {
    if (!transferData.from || !transferData.to || !transferData.lotNumber || transferData.quantity <= 0) {
      setSnackbar({ open: true, message: 'Please fill all fields correctly', severity: 'error' });
      return;
    }

    const fromUser = users.find((u) => u.id === transferData.from);
    const toUser = users.find((u) => u.id === transferData.to);

    const transfer: StickerTransfer = {
      id: `transfer-${Date.now()}`,
      from: transferData.from,
      fromName: fromUser?.name || 'Unknown',
      to: transferData.to,
      toName: toUser?.name || 'Unknown',
      quantity: transferData.quantity,
      lotNumber: transferData.lotNumber,
      transferDate: new Date(),
      transferredBy: currentUser?.id || 'system',
      status: 'Completed',
    };

    const updatedTransfers = [...transfers, transfer];
    saveTransfers(updatedTransfers);

    // Update stock
    const updatedStock = stock.map((s) => {
      if (s.assignedTo === transferData.from && s.lotNumber === transferData.lotNumber) {
        return { ...s, quantity: s.quantity - transferData.quantity };
      }
      if (s.assignedTo === transferData.to && s.lotNumber === transferData.lotNumber) {
        return { ...s, quantity: s.quantity + transferData.quantity };
      }
      return s;
    });
    saveStock(updatedStock);

    logUserAction(
      'UPDATE',
      'DOCUMENT',
      transfer.id,
      `Transfer from ${transfer.fromName} to ${transfer.toName}`,
      `Transferred ${transferData.quantity} stickers`,
      { lotNumber: transferData.lotNumber, from: transfer.fromName, to: transfer.toName },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Transfer completed successfully', severity: 'success' });
    setTransferDialogOpen(false);
    setTransferData({ from: '', to: '', quantity: 0, lotNumber: '' });
  };

  const handleRequest = () => {
    if (requestData.quantity <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid quantity', severity: 'error' });
      return;
    }

    const request: StickerRequest = {
      id: `request-${Date.now()}`,
      requestedBy: currentUser?.id || 'system',
      requestedByName: currentUser?.name || 'Unknown',
      requestedByType: 'Inspector',
      quantity: requestData.quantity,
      lotNumber: requestData.lotNumber || undefined,
      requestDate: new Date(),
      status: 'Pending',
    };

    const updatedRequests = [...requests, request];
    saveRequests(updatedRequests);

    logUserAction(
      'CREATE',
      'DOCUMENT',
      request.id,
      `Stock request by ${request.requestedByName}`,
      `Requested ${requestData.quantity} stickers`,
      { quantity: requestData.quantity, lotNumber: requestData.lotNumber },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Request submitted successfully', severity: 'success' });
    setRequestDialogOpen(false);
    setRequestData({ quantity: 0, lotNumber: '' });
  };

  const handleApproveRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    // Find an available lot (either the requested lot or any available lot)
    let selectedLot: StickerLot | undefined;
    
    if (request.lotNumber) {
      // Try to find the requested lot
      selectedLot = lots.find((l) => l.lotNumber === request.lotNumber && l.status === 'Active' && l.availableQuantity >= request.quantity);
    }
    
    // If requested lot not available or no lot specified, find any available lot
    if (!selectedLot) {
      selectedLot = lots.find((l) => l.status === 'Active' && l.availableQuantity >= request.quantity);
    }

    if (!selectedLot || selectedLot.availableQuantity < request.quantity) {
      setSnackbar({ 
        open: true, 
        message: 'Insufficient stock available to fulfill this request', 
        severity: 'error' 
      });
      setMenuAnchor(null);
      return;
    }

    // Find the user who requested - improved matching
    // CRITICAL: Use request.requestedBy ID first, then try to find user by that ID
    let requestedUser = users.find((u) => u.id === request.requestedBy);
    
    // If not found by ID, try name matching
    if (!requestedUser && request.requestedByName) {
      requestedUser = users.find(
        (u) => u.name && request.requestedByName &&
              u.name.toLowerCase().trim() === request.requestedByName.toLowerCase().trim() &&
              u.roles.includes('inspector')
      );
    }
    
    // If still not found, try to find any inspector (fallback)
    if (!requestedUser && request.requestedByType === 'Inspector') {
      requestedUser = users.find((u) => u.roles.includes('inspector'));
    }

    // Issue stock automatically when approving
    // CRITICAL: Always use request.requestedBy ID to ensure correct matching
    // This ensures stock is assigned to the same ID that made the request
    const assignedToId = request.requestedBy || requestedUser?.id || 'user-2';
    const assignedToName = request.requestedByName || requestedUser?.name || 'Inspector';
    const assignedToEmail = requestedUser?.email || undefined;
    
    const stockItem: StickerStock = {
      id: `stock-${Date.now()}`,
      lotId: selectedLot.id,
      lotNumber: selectedLot.lotNumber,
      assignedTo: assignedToId,
      assignedToName: assignedToName,
      assignedToEmail: assignedToEmail,
      assignedToType: request.requestedByType,
      quantity: request.quantity,
      issuedDate: new Date(),
      issuedBy: currentUser?.id || 'system',
    };

    // Update lot quantities
    const updatedLots = lots.map((l) =>
      l.id === selectedLot!.id
        ? {
            ...l,
            issuedQuantity: l.issuedQuantity + request.quantity,
            availableQuantity: l.availableQuantity - request.quantity,
            status: l.availableQuantity - request.quantity === 0 ? 'Depleted' : l.status,
          }
        : l
    );
    saveLots(updatedLots);

    // Add stock to issued stock
    const updatedStock = [...stock, stockItem];
    saveStock(updatedStock);

    // Update request status
    const updatedRequests = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'Approved' as const,
            approvedBy: currentUser?.id,
            approvedDate: new Date(),
          }
        : r
    );
    saveRequests(updatedRequests);

    // CRITICAL: Trigger multiple events to ensure inspector page updates
    // 1. Custom event for same-tab updates
    window.dispatchEvent(new Event('stickerStockUpdated'));
    
    // 2. Simulate storage event for cross-tab updates (works in same tab too)
    // Create a dummy storage event by setting and removing a value
    const dummyKey = `sticker-update-${Date.now()}`;
    localStorage.setItem(dummyKey, 'updated');
    localStorage.removeItem(dummyKey);
    
    // 3. Dispatch storage event manually (for same-tab)
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY_STOCK,
      newValue: JSON.stringify(updatedStock),
      oldValue: JSON.stringify(stock),
      storageArea: localStorage,
    }));

    // Reload data to reflect changes
    loadData();

    logUserAction(
      'APPROVE',
      'DOCUMENT',
      requestId,
      `Request approved and stock issued`,
      `Approved stock request for ${request.requestedByName} and issued ${request.quantity} stickers from ${selectedLot.lotNumber}`,
      { requestId, requestedBy: request.requestedByName, quantity: request.quantity, lotNumber: selectedLot.lotNumber },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ 
      open: true, 
      message: `Request approved and ${request.quantity} stickers issued from ${selectedLot.lotNumber}`, 
      severity: 'success' 
    });
    setMenuAnchor(null);
  };

  const handleRejectRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'Rejected' as const } : r
    );
    saveRequests(updatedRequests);

    logUserAction(
      'REJECT',
      'DOCUMENT',
      requestId,
      `Request rejected`,
      `Rejected stock request for ${request.requestedByName}`,
      { requestId, requestedBy: request.requestedByName },
      currentUser?.id,
      currentUser?.name,
      currentUser?.currentRole
    );

    setSnackbar({ open: true, message: 'Request rejected', severity: 'success' });
    setMenuAnchor(null);
  };

  const inspectors = users.filter((u) => u.roles.includes('inspector'));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              Sticker Manager
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage sticker lots, stock issuance, transfers, and requests
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setLotDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                },
              }}
            >
              Create Lot
            </Button>
            <Button
              variant="outlined"
              startIcon={<InventoryIcon />}
              onClick={() => setIssueDialogOpen(true)}
            >
              Issue Stock
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Lots (${lots.length})`} />
          <Tab label={`Stock Issued (${stock.length})`} />
          <Tab label={`Transfers (${transfers.length})`} />
          <Tab label={`Requests (${requests.filter((r) => r.status === 'Pending').length} pending)`} />
        </Tabs>
      </Card>

      {/* Lots Tab */}
      {activeTab === 0 && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              p: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Sticker Lots
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Available</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No sticker lots found. Create a new lot to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  lots.map((lot) => (
                    <TableRow key={lot.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {lot.lotNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{lot.size}</TableCell>
                      <TableCell align="right">{lot.quantity}</TableCell>
                      <TableCell align="right">{lot.issuedQuantity}</TableCell>
                      <TableCell align="right">{lot.availableQuantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={lot.status}
                          size="small"
                          color={lot.status === 'Active' ? 'success' : lot.status === 'Depleted' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{format(lot.createdAt, 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Stock Tab */}
      {activeTab === 1 && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              p: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Stock Issued
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issued Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No stock issued yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stock.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.lotNumber}</TableCell>
                      <TableCell>{s.assignedToName}</TableCell>
                      <TableCell>
                        <Chip label={s.assignedToType} size="small" />
                      </TableCell>
                      <TableCell align="right">{s.quantity}</TableCell>
                      <TableCell>{format(s.issuedDate, 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Transfers Tab */}
      {activeTab === 2 && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
            <Typography variant="h6" fontWeight={600}>
              Transfers
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TransferIcon />}
              onClick={() => setTransferDialogOpen(true)}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white' }}
            >
              New Transfer
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transfer Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No transfers found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id} hover>
                      <TableCell>{transfer.fromName}</TableCell>
                      <TableCell>{transfer.toName}</TableCell>
                      <TableCell>{transfer.lotNumber}</TableCell>
                      <TableCell align="right">{transfer.quantity}</TableCell>
                      <TableCell>{format(transfer.transferDate, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Chip
                          label={transfer.status}
                          size="small"
                          color={transfer.status === 'Completed' ? 'success' : transfer.status === 'Rejected' ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Requests Tab */}
      {activeTab === 3 && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
            <Typography variant="h6" fontWeight={600}>
              Stock Requests
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RequestIcon />}
              onClick={() => setRequestDialogOpen(true)}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white' }}
            >
              New Request
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Requested By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lot Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No requests found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.requestedByName}</TableCell>
                      <TableCell>
                        <Chip label={request.requestedByType} size="small" />
                      </TableCell>
                      <TableCell>{request.lotNumber || 'Any'}</TableCell>
                      <TableCell align="right">{request.quantity}</TableCell>
                      <TableCell>{format(request.requestDate, 'MMM dd, yyyy')}</TableCell>
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
                        />
                      </TableCell>
                      <TableCell align="right">
                        {request.status === 'Pending' && (
                          <IconButton
                            size="small"
                            onClick={(e) => setMenuAnchor({ anchor: e.currentTarget, type: 'request', id: request.id })}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create Lot Dialog */}
      <Dialog open={lotDialogOpen} onClose={() => setLotDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Sticker Lot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lot Number"
                value={newLot.lotNumber}
                onChange={(e) => setNewLot({ ...newLot, lotNumber: e.target.value })}
                placeholder="e.g., LOT-2025-001"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Size</InputLabel>
                <Select
                  value={newLot.size}
                  label="Size"
                  onChange={(e) => setNewLot({ ...newLot, size: e.target.value })}
                >
                  <MenuItem value="Small">Small</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Large">Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={newLot.quantity}
                onChange={(e) => setNewLot({ ...newLot, quantity: parseInt(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLotDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLot}>
            Create Lot
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Stock Dialog */}
      <Dialog open={issueDialogOpen} onClose={() => setIssueDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Stock</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lot</InputLabel>
                <Select
                  value={issueData.lotId}
                  label="Lot"
                  onChange={(e) => setIssueData({ ...issueData, lotId: e.target.value })}
                >
                  {lots.filter((l) => l.status === 'Active' && l.availableQuantity > 0).map((lot) => (
                    <MenuItem key={lot.id} value={lot.id}>
                      {lot.lotNumber} ({lot.availableQuantity} available)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To Type</InputLabel>
                <Select
                  value={issueData.assignedToType}
                  label="Assign To Type"
                  onChange={(e) => setIssueData({ ...issueData, assignedToType: e.target.value as 'Region' | 'Inspector' })}
                >
                  <MenuItem value="Inspector">Inspector</MenuItem>
                  <MenuItem value="Region">Region</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={issueData.assignedTo}
                  label="Assign To"
                  onChange={(e) => setIssueData({ ...issueData, assignedTo: e.target.value })}
                >
                  {inspectors.map((inspector) => (
                    <MenuItem key={inspector.id} value={inspector.id}>
                      {inspector.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={issueData.quantity}
                onChange={(e) => setIssueData({ ...issueData, quantity: parseInt(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleIssueStock}>
            Issue Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>From</InputLabel>
                <Select
                  value={transferData.from}
                  label="From"
                  onChange={(e) => setTransferData({ ...transferData, from: e.target.value })}
                >
                  {inspectors.map((inspector) => (
                    <MenuItem key={inspector.id} value={inspector.id}>
                      {inspector.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>To</InputLabel>
                <Select
                  value={transferData.to}
                  label="To"
                  onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
                >
                  {inspectors.map((inspector) => (
                    <MenuItem key={inspector.id} value={inspector.id}>
                      {inspector.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lot Number</InputLabel>
                <Select
                  value={transferData.lotNumber}
                  label="Lot Number"
                  onChange={(e) => setTransferData({ ...transferData, lotNumber: e.target.value })}
                >
                  {lots.map((lot) => (
                    <MenuItem key={lot.id} value={lot.lotNumber}>
                      {lot.lotNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={transferData.quantity}
                onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTransfer}>
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Stock</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lot Number (Optional)</InputLabel>
                <Select
                  value={requestData.lotNumber}
                  label="Lot Number (Optional)"
                  onChange={(e) => setRequestData({ ...requestData, lotNumber: e.target.value })}
                >
                  <MenuItem value="">Any Available</MenuItem>
                  {lots.map((lot) => (
                    <MenuItem key={lot.id} value={lot.lotNumber}>
                      {lot.lotNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={requestData.quantity}
                onChange={(e) => setRequestData({ ...requestData, quantity: parseInt(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRequest}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Actions Menu */}
      <Menu
        anchorEl={menuAnchor?.anchor}
        open={Boolean(menuAnchor && menuAnchor.type === 'request')}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && handleApproveRequest(menuAnchor.id)}>
          <CheckIcon sx={{ mr: 1 }} />
          Approve
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && handleRejectRequest(menuAnchor.id)}>
          <CancelIcon sx={{ mr: 1 }} />
          Reject
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

