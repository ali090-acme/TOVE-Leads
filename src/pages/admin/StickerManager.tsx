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
  // Sequence number tracking (5-digit or 6-digit)
  startSequence: number; // Starting sequence number (e.g., 82812 or 100000)
  endSequence: number; // Ending sequence number (e.g., 82999 or 199999)
  currentSequence: number; // Next available sequence number
}

interface StickerStock {
  id: string;
  lotId: string;
  lotNumber: string;
  size: string; // Sticker size (Large or Small)
  assignedTo: string;
  assignedToName: string;
  assignedToEmail?: string; // Added for better matching
  assignedToType: 'Region' | 'Inspector';
  quantity: number;
  sequenceNumbers: string[]; // Array of sequence numbers assigned (5-digit or 6-digit, e.g., ['82812', '82813'] or ['100001', '100002'])
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
  size: 'Large' | 'Small'; // Sticker size requested
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
  
  const [newLot, setNewLot] = useState({ lotNumber: '', size: '', quantity: 0, startSequence: '' });
  const [issueData, setIssueData] = useState({ lotId: '', assignedTo: '', assignedToType: 'Inspector' as 'Region' | 'Inspector', quantity: 0 });
  const [transferData, setTransferData] = useState({ from: '', to: '', quantity: 0, lotNumber: '' });
  const [requestData, setRequestData] = useState({ quantity: 0, size: 'Large' as 'Large' | 'Small', lotNumber: '' });
  
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

  // Sync lot data with actual stock items to ensure consistency
  const syncLotsWithStock = (lotsData: StickerLot[], stockData: StickerStock[]): StickerLot[] => {
    return lotsData.map((lot) => {
      // Find all stock items for this lot
      const lotStockItems = stockData.filter((s) => s.lotId === lot.id);
      
      // Calculate actual issued quantity from stock items
      const actualIssuedQuantity = lotStockItems.reduce((sum, s) => sum + s.quantity, 0);
      
      // Find maximum sequence number used from stock items
      let maxSequenceUsed = lot.startSequence - 1; // Default to startSequence - 1
      
      lotStockItems.forEach((stockItem) => {
        if (stockItem.sequenceNumbers && stockItem.sequenceNumbers.length > 0) {
          stockItem.sequenceNumbers.forEach((seqStr) => {
            const seqNum = parseInt(seqStr.replace(/\D/g, ''), 10);
            if (!isNaN(seqNum) && seqNum >= 10000 && seqNum <= 99999 && seqNum > maxSequenceUsed) {
              maxSequenceUsed = seqNum;
            }
          });
        }
      });
      
      // Calculate next available sequence (maxSequenceUsed + 1)
      const syncedCurrentSequence = maxSequenceUsed + 1;
      
      // Ensure currentSequence doesn't exceed endSequence
      const finalCurrentSequence = Math.min(syncedCurrentSequence, lot.endSequence + 1);
      
      // Calculate available quantity
      const syncedAvailableQuantity = Math.max(0, lot.quantity - actualIssuedQuantity);
      
      return {
        ...lot,
        issuedQuantity: actualIssuedQuantity,
        availableQuantity: syncedAvailableQuantity,
        currentSequence: finalCurrentSequence,
        status: syncedAvailableQuantity === 0 ? 'Depleted' : lot.status === 'Depleted' && syncedAvailableQuantity > 0 ? 'Active' : lot.status,
      };
    });
  };

  const loadData = () => {
    // Load from localStorage
    const storedLots = localStorage.getItem(STORAGE_KEY_LOTS);
    const storedStock = localStorage.getItem(STORAGE_KEY_STOCK);
    const storedTransfers = localStorage.getItem(STORAGE_KEY_TRANSFERS);
    const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);

    let parsedLots: StickerLot[] = [];
    if (storedLots) {
      parsedLots = JSON.parse(storedLots).map((lot: any) => ({
        ...lot,
        createdAt: new Date(lot.createdAt),
        // Add default sequence numbers for old lots that don't have them
        startSequence: lot.startSequence ?? 0,
        endSequence: lot.endSequence ?? (lot.startSequence ? lot.startSequence + lot.quantity - 1 : lot.quantity - 1),
        currentSequence: lot.currentSequence ?? lot.startSequence ?? 0,
      }));
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
          startSequence: 82812, // 5-digit format (like existing sticker)
          endSequence: 83811,
          currentSequence: 83162, // Next available sequence
        },
        {
          id: 'lot-2',
          lotNumber: 'LOT-2025-002',
          size: 'Large',
          quantity: 500,
          issuedQuantity: 200,
          availableQuantity: 300,
          status: 'Active',
          createdAt: new Date('2025-01-05'),
          createdBy: 'admin',
          startSequence: 10000, // 5-digit format
          endSequence: 10499,
          currentSequence: 10200, // Next available sequence
        },
      ];
      setLots(mockLots);
      localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(mockLots));
    }

    let parsedStock: StickerStock[] = [];
    if (storedStock) {
      parsedStock = JSON.parse(storedStock).map((s: any) => ({
        ...s,
        issuedDate: new Date(s.issuedDate),
        // Ensure sequenceNumbers array exists (for old stock items)
        // Only set empty array if sequenceNumbers doesn't exist, don't override if it's already there
        sequenceNumbers: s.sequenceNumbers !== undefined ? s.sequenceNumbers : [],
      }));
      setStock(parsedStock);
    }

    // Sync lots with actual stock data to ensure consistency
    if (parsedLots.length > 0) {
      const syncedLots = syncLotsWithStock(parsedLots, parsedStock);
      setLots(syncedLots);
      // Save synced lots back to localStorage to persist the sync
      localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(syncedLots));
    }

    if (storedTransfers) {
      const parsed = JSON.parse(storedTransfers);
      setTransfers(parsed.map((t: any) => ({ ...t, transferDate: new Date(t.transferDate) })));
    }

    if (storedRequests) {
      const parsed = JSON.parse(storedRequests);
      setRequests(parsed.map((r: any) => ({ 
        ...r, 
        size: r.size || 'Large', // Default to Large for backward compatibility
        requestDate: new Date(r.requestDate), 
        approvedDate: r.approvedDate ? new Date(r.approvedDate) : undefined 
      })));
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

  // Helper function to format sequence number (always 5-digit)
  const formatSequenceNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return 'N/A';
    }
    // Always format as 5-digit (10000-99999)
    return num.toString().padStart(5, '0');
  };

  // Get the last used sequence number for a specific sticker size
  const getLastUsedSequenceForSize = (size: string): number => {
    let maxSequence = 9999; // Default starting point (will start from 10000)

    // FIRST: Check all stock items for this size - find max sequence number (actual issued sequences)
    // This is the most accurate source as it shows what was actually issued
    const stockForSize = stock.filter((s) => s.size === size);
    stockForSize.forEach((s) => {
      if (s.sequenceNumbers && s.sequenceNumbers.length > 0) {
        s.sequenceNumbers.forEach((seqStr) => {
          const seqNum = parseInt(seqStr.replace(/\D/g, ''), 10);
          // Only consider 5-digit sequences (10000-99999)
          if (!isNaN(seqNum) && seqNum >= 10000 && seqNum <= 99999 && seqNum > maxSequence) {
            maxSequence = seqNum;
          }
        });
      }
    });

    // SECOND: Check sticker usage tracking for this size (allocated/used stickers)
    try {
      const stickerUsage = localStorage.getItem('sticker-usage-tracking');
      if (stickerUsage) {
        const usage: any[] = JSON.parse(stickerUsage);
        usage.forEach((u) => {
          if (u.stickerNumber) {
            const seqNum = parseInt(u.stickerNumber.replace(/\D/g, ''), 10);
            // Only consider 5-digit sequences (10000-99999)
            if (!isNaN(seqNum) && seqNum >= 10000 && seqNum <= 99999 && seqNum > maxSequence) {
              // Need to check if this sticker belongs to the right size
              // Find the stock item to get size
              const stockItem = stock.find((s) => s.id === u.stickerStockId);
              if (stockItem && stockItem.size === size && seqNum > maxSequence) {
                maxSequence = seqNum;
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking sticker usage:', error);
    }

    // THIRD: Check lots' currentSequence (next available = last used + 1)
    // Only use this if no stock items found (fallback)
    const lotsForSize = lots.filter((lot) => lot.size === size);
    lotsForSize.forEach((lot) => {
      // Only consider 5-digit sequences (10000-99999)
      // currentSequence is the next available, so last used is currentSequence - 1
      if (lot.currentSequence && lot.currentSequence >= 10000 && lot.currentSequence <= 99999) {
        const lastUsedFromLot = lot.currentSequence - 1;
        if (lastUsedFromLot > maxSequence) {
          maxSequence = lastUsedFromLot;
        }
      }
    });

    return maxSequence;
  };

  // Get next available sequence number for a sticker size (checking both stock items AND existing lots)
  const getNextSequenceForSize = (size: string): number => {
    // First, get last used sequence from stock items
    const lastUsedFromStock = getLastUsedSequenceForSize(size);
    
    // Second, check all existing lots for this size to find the maximum endSequence
    // This ensures we don't create overlapping lots
    let maxEndSequence = 9999; // Default starting point
    
    const lotsForSize = lots.filter((lot) => lot.size === size);
    lotsForSize.forEach((lot) => {
      // Check endSequence of existing lots (only 5-digit sequences)
      if (lot.endSequence && lot.endSequence >= 10000 && lot.endSequence <= 99999 && lot.endSequence > maxEndSequence) {
        maxEndSequence = lot.endSequence;
      }
    });
    
    // Use the maximum of: lastUsedFromStock OR maxEndSequence from existing lots
    const lastUsed = Math.max(lastUsedFromStock, maxEndSequence);
    
    // Return next sequence (lastUsed + 1), but ensure it's at least 10000 and max 99999 (5-digit)
    const nextSeq = Math.max(10000, lastUsed + 1);
    // Ensure it doesn't exceed 5-digit limit
    return Math.min(99999, nextSeq);
  };

  const handleCreateLot = () => {
    if (!newLot.lotNumber || !newLot.size || newLot.quantity <= 0) {
      setSnackbar({ open: true, message: 'Please fill all fields correctly', severity: 'error' });
      return;
    }

    // Auto-generate start sequence if not provided
    let startSeq: number;
    if (newLot.startSequence) {
      startSeq = parseInt(newLot.startSequence);
    } else {
      // Auto-generate based on last used sequence for this size
      startSeq = getNextSequenceForSize(newLot.size);
    }

    // Only allow 5-digit numbers (10000-99999)
    if (isNaN(startSeq) || startSeq < 10000 || startSeq > 99999) {
      setSnackbar({ open: true, message: 'Start sequence must be a 5-digit number (10000-99999)', severity: 'error' });
      return;
    }

    const endSeq = startSeq + newLot.quantity - 1;
    // Check limit for 5-digit numbers
    const maxLimit = 99999;
    if (endSeq > maxLimit) {
      setSnackbar({ open: true, message: `Sequence range exceeds limit. Maximum allowed: ${maxLimit}. Please reduce quantity.`, severity: 'error' });
      return;
    }

    // Check for overlap with existing lots of the same size
    const lotsForSize = lots.filter((lot) => lot.size === newLot.size);
    const hasOverlap = lotsForSize.some((lot) => {
      // Check if new lot's range overlaps with existing lot's range
      const existingStart = lot.startSequence;
      const existingEnd = lot.endSequence;
      
      // Overlap occurs if:
      // - New start is within existing range: existingStart <= startSeq <= existingEnd
      // - New end is within existing range: existingStart <= endSeq <= existingEnd
      // - New range completely contains existing range: startSeq <= existingStart && endSeq >= existingEnd
      return (
        (startSeq >= existingStart && startSeq <= existingEnd) ||
        (endSeq >= existingStart && endSeq <= existingEnd) ||
        (startSeq <= existingStart && endSeq >= existingEnd)
      );
    });

    if (hasOverlap) {
      const suggestedStart = getNextSequenceForSize(newLot.size);
      setSnackbar({ 
        open: true, 
        message: `Sequence range ${formatSequenceNumber(startSeq)} - ${formatSequenceNumber(endSeq)} overlaps with an existing lot. Suggested next available: ${formatSequenceNumber(suggestedStart)}`, 
        severity: 'error' 
      });
      // Auto-update the start sequence field with suggested value
      setNewLot({ ...newLot, startSequence: suggestedStart.toString() });
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
      startSequence: startSeq,
      endSequence: endSeq,
      currentSequence: startSeq, // Start from beginning
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

    setSnackbar({ open: true, message: `Sticker lot created successfully. Sequence range: ${formatSequenceNumber(startSeq)} - ${formatSequenceNumber(endSeq)}`, severity: 'success' });
    setLotDialogOpen(false);
    setNewLot({ lotNumber: '', size: '', quantity: 0, startSequence: '' });
  };

  // Handle size change - auto-populate start sequence
  const handleSizeChange = (size: string) => {
    const nextSequence = getNextSequenceForSize(size);
    setNewLot({ ...newLot, size, startSequence: nextSequence.toString() });
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

    // Check if sequence range is sufficient
    if (lot.currentSequence + issueData.quantity - 1 > lot.endSequence) {
      setSnackbar({ open: true, message: 'Insufficient sequence numbers available in this lot', severity: 'error' });
      return;
    }

    // Generate sequence numbers for this issue
    const sequenceNumbers: string[] = [];
    for (let i = 0; i < issueData.quantity; i++) {
      sequenceNumbers.push(formatSequenceNumber(lot.currentSequence + i));
    }

    const assignedUser = users.find((u) => u.id === issueData.assignedTo);
    const stockItem: StickerStock = {
      id: `stock-${Date.now()}`,
      lotId: issueData.lotId,
      lotNumber: lot.lotNumber,
      size: lot.size, // Copy size from lot
      assignedTo: issueData.assignedTo,
      assignedToName: assignedUser?.name || 'Unknown',
      assignedToEmail: assignedUser?.email || undefined, // Store email for better matching
      assignedToType: issueData.assignedToType,
      quantity: issueData.quantity,
      sequenceNumbers: sequenceNumbers, // Assign sequence numbers
      issuedDate: new Date(),
      issuedBy: currentUser?.id || 'system',
    };

    // Update lot (increment currentSequence)
    const updatedLots = lots.map((l) =>
      l.id === issueData.lotId
        ? {
            ...l,
            issuedQuantity: l.issuedQuantity + issueData.quantity,
            availableQuantity: l.availableQuantity - issueData.quantity,
            currentSequence: l.currentSequence + issueData.quantity, // Update next available sequence
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
      `Issued ${issueData.quantity} stickers from ${lot.lotNumber} (Sequence: ${sequenceNumbers[0]} - ${sequenceNumbers[sequenceNumbers.length - 1]})`,
      { lotNumber: lot.lotNumber, quantity: issueData.quantity, assignedTo: stockItem.assignedToName, sequenceNumbers: sequenceNumbers },
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
      size: requestData.size,
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
    setRequestData({ quantity: 0, size: 'Large', lotNumber: '' });
  };

  const handleApproveRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    // Find an available lot matching the requested size
    // Priority: 1) Requested lot if it matches size, 2) Any lot with matching size, 3) Any available lot
    let selectedLot: StickerLot | undefined;
    const requestedSize = request.size || 'Large'; // Default to Large for backward compatibility
    
    if (request.lotNumber) {
      // Try to find the requested lot with matching size
      selectedLot = lots.find((l) => 
        l.lotNumber === request.lotNumber && 
        l.status === 'Active' && 
        l.size === requestedSize &&
        l.availableQuantity >= request.quantity
      );
    }
    
    // If requested lot not available or doesn't match size, find any lot with matching size
    if (!selectedLot) {
      selectedLot = lots.find((l) => 
        l.status === 'Active' && 
        l.size === requestedSize &&
        l.availableQuantity >= request.quantity
      );
    }
    
    // If still no lot found with matching size, find any available lot (fallback)
    if (!selectedLot) {
      selectedLot = lots.find((l) => l.status === 'Active' && l.availableQuantity >= request.quantity);
    }

    if (!selectedLot || selectedLot.availableQuantity < request.quantity) {
      setSnackbar({ 
        open: true, 
        message: `Insufficient ${requestedSize} stock available to fulfill this request`, 
        severity: 'error' 
      });
      setMenuAnchor(null);
      return;
    }

    // Check if sequence range is sufficient
    if (selectedLot.currentSequence + request.quantity - 1 > selectedLot.endSequence) {
      setSnackbar({ 
        open: true, 
        message: 'Insufficient sequence numbers available in this lot', 
        severity: 'error' 
      });
      setMenuAnchor(null);
      return;
    }

    // Generate sequence numbers for this approval
    const sequenceNumbers: string[] = [];
    for (let i = 0; i < request.quantity; i++) {
      sequenceNumbers.push(formatSequenceNumber(selectedLot.currentSequence + i));
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
      size: requestedSize, // Use requested size instead of lot size
      assignedTo: assignedToId,
      assignedToName: assignedToName,
      assignedToEmail: assignedToEmail,
      assignedToType: request.requestedByType,
      quantity: request.quantity,
      sequenceNumbers: sequenceNumbers, // Assign sequence numbers
      issuedDate: new Date(),
      issuedBy: currentUser?.id || 'system',
    };

    // Update lot quantities and sequence
    const updatedLots = lots.map((l) =>
      l.id === selectedLot!.id
        ? {
            ...l,
            issuedQuantity: l.issuedQuantity + request.quantity,
            availableQuantity: l.availableQuantity - request.quantity,
            currentSequence: l.currentSequence + request.quantity, // Update next available sequence
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
      `Approved stock request for ${request.requestedByName} and issued ${request.quantity} stickers from ${selectedLot.lotNumber} (Sequence: ${sequenceNumbers[0]} - ${sequenceNumbers[sequenceNumbers.length - 1]})`,
      { requestId, requestedBy: request.requestedByName, quantity: request.quantity, lotNumber: selectedLot.lotNumber, sequenceNumbers: sequenceNumbers },
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
                  <TableCell sx={{ fontWeight: 600 }}>Sequence Range</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                        {lot.startSequence !== undefined && lot.startSequence !== null ? (
                          <>
                            <Typography variant="body2" fontFamily="monospace">
                              {formatSequenceNumber(lot.startSequence)} - {formatSequenceNumber(lot.endSequence)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Next: {formatSequenceNumber(lot.currentSequence)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sequence numbers not configured
                          </Typography>
                        )}
                      </TableCell>
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
                  <TableCell sx={{ fontWeight: 600 }}>Sequence Numbers</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issued Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                      <TableCell>
                        {s.sequenceNumbers && s.sequenceNumbers.length > 0 ? (
                          <Box>
                            <Typography 
                              variant="body2" 
                              fontFamily="monospace" 
                              sx={{ 
                                fontSize: '0.875rem', 
                                fontWeight: 600,
                                color: 'primary.main',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {s.sequenceNumbers.length === 1 
                                ? s.sequenceNumbers[0]
                                : s.sequenceNumbers.length <= 3 
                                ? s.sequenceNumbers.join(', ')
                                : `${s.sequenceNumbers[0]} - ${s.sequenceNumbers[s.sequenceNumbers.length - 1]}`
                              }
                            </Typography>
                            {s.sequenceNumbers.length > 3 && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                ({s.sequenceNumbers.length} stickers)
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Chip 
                            label="Not configured" 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
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
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
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
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                      <TableCell>
                        <Chip label={request.size || 'Large'} size="small" color="primary" />
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
      <Dialog 
        open={lotDialogOpen} 
        onClose={() => {
          setLotDialogOpen(false);
          setNewLot({ lotNumber: '', size: '', quantity: 0, startSequence: '' });
        }} 
        maxWidth="sm" 
        fullWidth
      >
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
                  onChange={(e) => handleSizeChange(e.target.value)}
                >
                  <MenuItem value="Large">Large</MenuItem>
                  <MenuItem value="Small">Small</MenuItem>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Start Sequence Number (Auto-generated)"
                value={newLot.startSequence}
                placeholder="Auto-generated based on last used sequence"
                helperText={newLot.size 
                  ? `System-generated: Next available 5-digit sequence for ${newLot.size} stickers. Last used: ${formatSequenceNumber(getLastUsedSequenceForSize(newLot.size))}.`
                  : "Select sticker size first to auto-generate sequence number"
                }
                inputProps={{ maxLength: 5, readOnly: true }}
                disabled={true}
                sx={{
                  '& .MuiInputBase-input': {
                    cursor: 'not-allowed',
                  },
                }}
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
                      {lot.lotNumber} - {lot.size} ({lot.availableQuantity} available)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {issueData.lotId && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected Sticker Size:
                  </Typography>
                  <Chip 
                    label={lots.find((l) => l.id === issueData.lotId)?.size || 'N/A'} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  {lots.find((l) => l.id === issueData.lotId) && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Sequence Range: {formatSequenceNumber(lots.find((l) => l.id === issueData.lotId)!.startSequence)} - {formatSequenceNumber(lots.find((l) => l.id === issueData.lotId)!.endSequence)}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
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
                <InputLabel>Sticker Size</InputLabel>
                <Select
                  value={requestData.size}
                  label="Sticker Size"
                  onChange={(e) => setRequestData({ ...requestData, size: e.target.value as 'Large' | 'Small' })}
                >
                  <MenuItem value="Large">Large</MenuItem>
                  <MenuItem value="Small">Small</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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

