import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Divider,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, ServiceType, Client } from '@/types';
import { canCreateJobOrder } from '@/utils/permissions';
import {
  addToOfflineQueue,
  isOnline,
  getSyncStatus,
  initializeOfflineSync,
  fileToBase64,
} from '@/utils/offlineQueue';
import { CloudOff as CloudOffIcon, CloudDone as CloudDoneIcon, PhotoCamera as PhotoCameraIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { allocateStickerToJob, canAllocateSticker, getAvailableStickerQuantity } from '@/utils/stickerTracking';
import { getAvailableTags, allocateTagToJob } from '@/utils/tagTracking';
import { StickerSize } from '@/types';
import { checkClientExists, getFilteredClients } from '@/utils/clientValidation';

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

export const NewJobOrder: React.FC = () => {
  const navigate = useNavigate();
  const { clients, createJobOrder, currentUser } = useAppContext();
  
  // Check if user has permission to create job orders
  const hasPermission = canCreateJobOrder(currentUser);
  
  // Get all clients for dropdown (users can select any existing client)
  // Region filtering happens at job order level, not client selection level
  const availableClients = React.useMemo(() => {
    const stored = localStorage.getItem('clients');
    if (stored) {
      try {
        return JSON.parse(stored) as Client[];
      } catch (error) {
        console.error('Error parsing clients:', error);
        return clients; // Fallback to context clients
      }
    }
    return clients; // Fallback to context clients
  }, [clients]);
  
  // Initialize offline sync
  React.useEffect(() => {
    initializeOfflineSync();
  }, []);

  // Load available stickers and tags for current inspector
  React.useEffect(() => {
    if (currentUser?.id) {
      loadAvailableStickers();
      loadAvailableTags();
    }
  }, [currentUser]);

  const loadAvailableTags = () => {
    const tags = getAvailableTags();
    setAvailableTags(tags);
  };

  const loadAvailableStickers = () => {
    const STORAGE_KEY_STOCK = 'sticker-stock';
    const storedStock = localStorage.getItem(STORAGE_KEY_STOCK);
    
    if (storedStock) {
      const parsed = JSON.parse(storedStock);
      const inspectorStock = parsed
        .filter((s: any) => {
          // Match by user ID
          if (s.assignedTo === currentUser?.id) return true;
          // Match by name
          if (currentUser?.name && s.assignedToName) {
            const stockName = s.assignedToName.toLowerCase().trim();
            const userName = currentUser.name.toLowerCase().trim();
            if (stockName === userName || stockName.includes(userName) || userName.includes(stockName)) {
              return true;
            }
          }
          return false;
        })
        .map((s: any) => ({
          ...s,
          issuedDate: new Date(s.issuedDate),
          availableQuantity: getAvailableStickerQuantity(s.quantity, s.id),
        }))
        .filter((s: any) => s.availableQuantity > 0); // Only show stickers with available quantity
      
      setAvailableStickers(inspectorStock);
    }
  };
  
  const [activeTab, setActiveTab] = useState(0); // 0 = Existing Client, 1 = New Client
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [onlineStatus, setOnlineStatus] = useState(isOnline());
  const [stickerPhoto, setStickerPhoto] = useState<File | null>(null);
  const [stickerNumber, setStickerNumber] = useState('');
  const [stickerSize, setStickerSize] = useState<StickerSize>('Large');
  const [showStickerSection, setShowStickerSection] = useState(false);
  const [selectedStickerStockId, setSelectedStickerStockId] = useState<string>('');
  const [availableStickers, setAvailableStickers] = useState<any[]>([]);
  const [showTagSection, setShowTagSection] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  // Load regions for display
  React.useEffect(() => {
    const stored = localStorage.getItem('regions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRegions(parsed);
      } catch (error) {
        console.error('Error parsing regions:', error);
      }
    }
  }, []);

  // Form state for existing client
  const [formData, setFormData] = useState({
    clientId: '',
    serviceTypes: [] as ServiceType[], // Multiple service types can be selected
    location: '',
    dateTime: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    description: '',
  });

  // Form state for new client
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Construction' as 'Construction' | 'Engineering' | 'Individual',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientExistsError, setClientExistsError] = useState<{ show: boolean; clientId?: string }>({ show: false });

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      const syncStatus = getSyncStatus();
      if (syncStatus.pendingItems > 0) {
        setSnackbar({
          open: true,
          message: `Device is online. ${syncStatus.pendingItems} pending job(s) will be synced automatically.`,
          severity: 'success',
        });
      }
    };
    const handleOffline = () => {
      setOnlineStatus(false);
      setSnackbar({
        open: true,
        message: 'Device is offline. Job order will be saved locally and synced when online.',
        severity: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setErrors({});
    setClientExistsError({ show: false });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 0) {
      // Existing client validation
      if (!formData.clientId) {
        newErrors.clientId = 'Please select a client';
      }
    } else {
      // New client validation
      if (!newClientData.name.trim()) {
        newErrors.newClientName = 'Client name is required';
      }
      if (!newClientData.email.trim()) {
        newErrors.newClientEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)) {
        newErrors.newClientEmail = 'Invalid email format';
      }
      if (!newClientData.phone.trim()) {
        newErrors.newClientPhone = 'Phone number is required';
      }
      
      // Check if client already exists by company name only (for confidentiality - no region info revealed)
      // This validation prevents duplicate client creation
      // Note: Company name must be unique - same email is allowed for different companies
      if (newClientData.name.trim()) {
        const existsCheck = checkClientExists(newClientData.name);
        if (existsCheck.exists) {
          setClientExistsError({ show: true, clientId: existsCheck.clientId });
          newErrors.clientExists = 'A client with this company name already exists in the system';
          // This error will prevent form submission
        } else {
          setClientExistsError({ show: false });
        }
      }
    }

    // Common validation
    if (formData.serviceTypes.length === 0) {
      newErrors.serviceTypes = 'At least one service type is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time is required';
    } else {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.dateTime = 'Date and time cannot be in the past';
      }
    }
    
    // Region validation - user must have region assigned
    if (!currentUser?.regionId) {
      newErrors.region = 'You must be assigned to a region before creating job orders. Please contact your administrator.';
    }

    // Sticker or Tag validation - at least one is required
    if (!selectedStickerStockId && !selectedTagId) {
      newErrors.stickerOrTag = 'Please select either a sticker or a tag (at least one is required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStickerPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStickerPhoto(file);
      setSnackbar({
        open: true,
        message: 'Sticker photo uploaded successfully',
        severity: 'success',
      });
    }
  };

  const handleSubmit = async () => {
    // Check permission first
    if (!hasPermission) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to create job orders. Please contact your supervisor or administrator.',
        severity: 'error',
      });
      return;
    }

    // For new client tab, check for duplicates by company name BEFORE validation
    if (activeTab === 1) {
      if (newClientData.name.trim()) {
        const existsCheck = checkClientExists(newClientData.name);
        if (existsCheck.exists) {
          setClientExistsError({ show: true, clientId: existsCheck.clientId });
          setErrors({ ...errors, clientExists: 'A client with this company name already exists in the system' });
          setSnackbar({
            open: true,
            message: 'A client with this company name already exists in the system. Please use the "Existing Client" tab to select this client.',
            severity: 'error',
          });
          return; // Prevent submission
        }
      }
    }

    if (!validateForm()) {
      // If client exists error is set, show specific message
      if (errors.clientExists || clientExistsError.show) {
        setSnackbar({
          open: true,
          message: 'This client already exists in the system. Please use the "Existing Client" tab to select this client.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Please fix the errors in the form',
          severity: 'error',
        });
      }
      return;
    }

    setLoading(true);

    try {
      let clientId = formData.clientId;
      let clientName = '';

      // If new client, create it first (mock - in real app, this would be API call)
      if (activeTab === 1) {
        // Double-check client doesn't exist by company name (final validation)
        const existsCheck = checkClientExists(newClientData.name);
        
        if (existsCheck.exists) {
          setSnackbar({
            open: true,
            message: 'A client with this company name already exists in the system. Please use the "Existing Client" tab to select this client.',
            severity: 'error',
          });
          setClientExistsError({ show: true, clientId: existsCheck.clientId });
          setLoading(false);
          return;
        }
        
        const newClient: Client = {
          id: `client-${Date.now()}`,
          name: newClientData.name,
          email: newClientData.email,
          phone: newClientData.phone,
          address: newClientData.address,
          businessType: newClientData.businessType,
          location: formData.location || '', // Use job order location as client location
          accountStatus: 'Active',
          paymentHistory: [],
          serviceHistory: [],
          // Add current user's region to client's regions array
          regions: currentUser?.regionId ? [currentUser.regionId] : [],
          // Legacy: also set regionId for backward compatibility
          regionId: currentUser?.regionId,
          teamId: currentUser?.teamId,
        };
        
        // Add to localStorage (mock - in real app, this would be API call)
        const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
        existingClients.push(newClient);
        localStorage.setItem('clients', JSON.stringify(existingClients));

        clientId = newClient.id;
        clientName = newClient.name;
      } else {
        // Get client name from existing client
        const selectedClient = clients.find((c) => c.id === clientId);
        clientName = selectedClient?.name || 'Unknown Client';
      }

      // Prepare job order data
      const jobOrderData = {
        clientId: clientId,
        clientName: clientName,
        serviceTypes: formData.serviceTypes, // Multiple service types
        dateTime: new Date(formData.dateTime),
        location: formData.location,
        status: 'Pending' as const,
        assignedTo: currentUser?.id || 'user-2',
        assignedToName: currentUser?.name || 'Inspector',
        priority: formData.priority,
        // Auto-assign region and team from current user (for confidentiality)
        regionId: currentUser?.regionId,
        teamId: currentUser?.teamId,
      };

      // If offline, add to offline queue
      if (!onlineStatus) {
        let stickerPhotoBase64: string | undefined;
        if (stickerPhoto) {
          stickerPhotoBase64 = await fileToBase64(stickerPhoto);
        }

        // Prepare sticker allocation data for offline job
        const stickerAllocation = selectedStickerStockId ? {
          stickerId: selectedStickerStockId,
          stickerNumber: stickerNumber || undefined,
          stickerLotNumber: availableStickers.find((s) => s.id === selectedStickerStockId)?.lotNumber || undefined,
          stickerSize: stickerSize,
          allocatedAt: new Date(),
          allocatedBy: currentUser?.id || 'user-2',
          stickerPhoto: stickerPhotoBase64,
        } : undefined;

        // Prepare tag allocation data for offline job
        const tagAllocation = selectedTagId ? {
          tagId: selectedTagId,
          tagNumber: availableTags.find((t) => t.id === selectedTagId)?.tagNumber || '',
          allocatedAt: new Date(),
          allocatedBy: currentUser?.id || 'user-2',
        } : undefined;

        const offlineJob = addToOfflineQueue({
          ...jobOrderData,
          stickerAllocation,
          tagAllocation,
          stickerPhoto: stickerPhotoBase64,
          stickerNumber: stickerNumber || undefined,
        });

        // If sticker selected, allocate it (will be synced when online)
        if (selectedStickerStockId) {
          const selectedSticker = availableStickers.find((s) => s.id === selectedStickerStockId);
          if (selectedSticker && canAllocateSticker(selectedSticker.id, selectedSticker.quantity)) {
            allocateStickerToJob(
              selectedSticker.id,
              selectedSticker.lotNumber,
              stickerNumber || undefined,
              offlineJob.offlineId, // Use offline ID temporarily
              offlineJob.offlineId,
              currentUser?.id || 'user-2',
              currentUser?.name || 'Inspector'
            );
          }
        }

        setSnackbar({
          open: true,
          message: `Job order saved offline (ID: ${offlineJob.offlineId.substring(0, 12)}...). It will be synced automatically when online.`,
          severity: 'success',
        });

        // Reset form
        setFormData({
          clientId: '',
          serviceTypes: [],
          location: '',
          dateTime: '',
          priority: 'Medium',
          description: '',
        });
        setNewClientData({
          name: '',
          email: '',
          phone: '',
          address: '',
          businessType: 'Construction',
        });
        setStickerPhoto(null);
        setStickerNumber('');
        setStickerSize('Large');
        setSelectedStickerStockId('');
        setShowStickerSection(false);
        setSelectedTagId('');
        setShowTagSection(false);
        setErrors({});
        loadAvailableStickers(); // Reload available stickers
        loadAvailableTags(); // Reload available tags

        navigate('/inspector/jobs');
        return;
      }

      // Online: Create job order normally
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newJobOrder = createJobOrder(jobOrderData);

      if (!newJobOrder) {
        throw new Error('Failed to create job order');
      }

      // Allocate sticker to job order if selected
      if (selectedStickerStockId) {
        const selectedSticker = availableStickers.find((s) => s.id === selectedStickerStockId);
        if (selectedSticker) {
          // Check if sticker can be allocated
          if (canAllocateSticker(selectedSticker.id, selectedSticker.quantity)) {
            const stickerPhotoBase64 = stickerPhoto ? await fileToBase64(stickerPhoto) : undefined;
            
            // Allocate sticker to job order
            allocateStickerToJob(
              selectedSticker.id,
              selectedSticker.lotNumber,
              stickerNumber || undefined,
              newJobOrder.id,
              newJobOrder.id,
              currentUser?.id || 'user-2',
              currentUser?.name || 'Inspector'
            );

            // Update job order with sticker allocation info
            const jobOrders = JSON.parse(localStorage.getItem('jobOrders') || '[]');
            const jobIndex = jobOrders.findIndex((jo: any) => jo.id === newJobOrder.id);
            if (jobIndex !== -1) {
              jobOrders[jobIndex].stickerAllocation = {
                stickerId: selectedSticker.id,
                stickerNumber: stickerNumber || undefined,
                stickerLotNumber: selectedSticker.lotNumber,
                stickerSize: stickerSize,
                allocatedAt: new Date(),
                allocatedBy: currentUser?.id || 'user-2',
                stickerPhoto: stickerPhotoBase64,
              };
              localStorage.setItem('jobOrders', JSON.stringify(jobOrders));
            }
          }
        }
      }

      // Allocate tag to job order if selected
      if (selectedTagId) {
        const selectedTag = availableTags.find((t) => t.id === selectedTagId);
        if (selectedTag) {
          allocateTagToJob(selectedTag.id, newJobOrder.id, currentUser?.id || 'user-2');
          
          // Update job order with tag allocation info
          const jobOrders = JSON.parse(localStorage.getItem('jobOrders') || '[]');
          const jobIndex = jobOrders.findIndex((jo: any) => jo.id === newJobOrder.id);
          if (jobIndex !== -1) {
            jobOrders[jobIndex].tagAllocation = {
              tagId: selectedTag.id,
              tagNumber: selectedTag.tagNumber,
              allocatedAt: new Date(),
              allocatedBy: currentUser?.id || 'user-2',
            };
            localStorage.setItem('jobOrders', JSON.stringify(jobOrders));
          }
        }
      } else if (stickerPhoto) {
        // If sticker photo uploaded but no sticker selected, just log it
        const stickerPhotoBase64 = await fileToBase64(stickerPhoto);
        console.log('Sticker photo uploaded without allocation:', {
          jobOrderId: newJobOrder.id,
          stickerNumber: stickerNumber || 'N/A',
          photoSize: stickerPhoto.size,
        });
      }

      // Show success message
      setSnackbar({
        open: true,
        message: activeTab === 1 
          ? 'New client and job order created successfully!'
          : 'Job order created successfully!',
        severity: 'success',
      });

      // Reset form
      setFormData({
        clientId: '',
        serviceTypes: [],
        location: '',
        dateTime: '',
        priority: 'Medium',
        description: '',
      });
      setNewClientData({
        name: '',
        email: '',
        phone: '',
        address: '',
        businessType: 'Construction',
      });
      setStickerPhoto(null);
      setStickerNumber('');
      setStickerSize('Large');
      setShowStickerSection(false);
      setSelectedTagId('');
      setShowTagSection(false);
      setErrors({});
      loadAvailableTags(); // Reload available tags

      // Redirect to job orders list
      navigate('/inspector/jobs');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create job order. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Create New Job Order
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new job order for inspection, assessment, training, or NDT service. 
          You can select an existing client or create a new one on-site.
        </Typography>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          {!hasPermission && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <strong>Permission Denied:</strong> You do not have permission to create job orders independently. 
              Please contact your supervisor to have a job order assigned to you, or request permission from your administrator.
            </Alert>
          )}
          
          {/* Online/Offline Status */}
          <Alert 
            severity={onlineStatus ? 'success' : 'warning'} 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={onlineStatus ? <CloudDoneIcon /> : <CloudOffIcon />}
          >
            <strong>Status:</strong> {onlineStatus ? 'Online' : 'Offline'}
            {!onlineStatus && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Job orders will be saved locally and synced automatically when you're back online.
              </Typography>
            )}
          </Alert>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Remote Site Scenario:</strong> If you're at a new client site, you can create 
            a new client profile and job order immediately. The job will be auto-assigned to you.
            {!onlineStatus && ' You can also upload a photo of the sticker attachment for accountability.'}
            <br /><br />
            <strong>Required:</strong> You must select either a <strong>Sticker</strong> or a <strong>Tag</strong> (at least one is required for accountability and traceability).
          </Alert>

          {/* Client Selection Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Existing Client" />
              <Tab label="New Client (On-Site)" />
            </Tabs>
          </Box>

          {/* Existing Client Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Select Client"
                  value={formData.clientId}
                  onChange={(e) => {
                    setFormData({ ...formData, clientId: e.target.value });
                    if (errors.clientId) {
                      setErrors({ ...errors, clientId: '' });
                    }
                  }}
                  error={!!errors.clientId}
                  helperText={errors.clientId}
                >
                  {availableClients.length === 0 ? (
                    <MenuItem disabled>
                      No clients available
                    </MenuItem>
                  ) : (
                    availableClients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name} - {client.businessType} ({client.location})
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
            </Grid>
          </TabPanel>

          {/* New Client Tab */}
          <TabPanel value={activeTab} index={1}>
            {clientExistsError.show && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setActiveTab(0);
                      setClientExistsError({ show: false });
                      // Try to select the existing client if possible
                      if (clientExistsError.clientId && availableClients.find(c => c.id === clientExistsError.clientId)) {
                        setFormData({ ...formData, clientId: clientExistsError.clientId });
                      }
                    }}
                  >
                    Use Existing Client
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight={600}>
                  Client Already Exists
                </Typography>
                <Typography variant="body2">
                  A client with this company name is already registered in the system. Please use the "Existing Client" tab to select this client.
                </Typography>
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Client Name"
                  value={newClientData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewClientData({ ...newClientData, name });
                    // Clear errors when typing
                    if (errors.newClientName) {
                      setErrors({ ...errors, newClientName: '' });
                    }
                    if (errors.clientExists) {
                      setErrors({ ...errors, clientExists: '' });
                    }
                    setClientExistsError({ show: false });
                    
                    // Real-time duplicate check when company name is entered
                    if (name.trim()) {
                      const existsCheck = checkClientExists(name);
                      if (existsCheck.exists) {
                        setClientExistsError({ show: true, clientId: existsCheck.clientId });
                        setErrors({ ...errors, clientExists: 'A client with this company name already exists in the system' });
                      } else {
                        setClientExistsError({ show: false });
                        if (errors.clientExists) {
                          const newErrors = { ...errors };
                          delete newErrors.clientExists;
                          setErrors(newErrors);
                        }
                      }
                    }
                  }}
                  error={!!errors.newClientName || !!errors.clientExists || clientExistsError.show}
                  helperText={errors.newClientName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Business Type"
                  value={newClientData.businessType}
                  onChange={(e) => setNewClientData({ ...newClientData, businessType: e.target.value as any })}
                >
                  <MenuItem value="Construction">Construction</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Individual">Individual</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  value={newClientData.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    setNewClientData({ ...newClientData, email });
                    // Clear errors when typing
                    if (errors.newClientEmail) {
                      setErrors({ ...errors, newClientEmail: '' });
                    }
                    if (errors.clientExists) {
                      setErrors({ ...errors, clientExists: '' });
                    }
                    setClientExistsError({ show: false });
                    
                    // Note: Email can be duplicate, only company name is checked for uniqueness
                  }}
                  // Note: Email validation only, company name is checked separately
                  error={!!errors.newClientEmail || !!errors.clientExists || clientExistsError.show}
                  helperText={
                    errors.newClientEmail || 
                    (errors.clientExists ? 'Client already exists in the system' : '') ||
                    (clientExistsError.show ? 'This client already exists. Use "Existing Client" tab.' : '')
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  value={newClientData.phone}
                  onChange={(e) => {
                    const phone = e.target.value;
                    setNewClientData({ ...newClientData, phone });
                    // Clear errors when typing
                    if (errors.newClientPhone) {
                      setErrors({ ...errors, newClientPhone: '' });
                    }
                    if (errors.clientExists) {
                      setErrors({ ...errors, clientExists: '' });
                    }
                    setClientExistsError({ show: false });
                    
                    // Note: Phone can be duplicate, only email is checked for uniqueness
                  }}
                  error={!!errors.newClientPhone || !!errors.clientExists || clientExistsError.show}
                  helperText={errors.newClientPhone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={newClientData.address}
                  onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Divider sx={{ my: 4 }} />

          {/* Common Job Order Fields */}
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Job Order Details
          </Typography>

          {/* Region/Team Assignment Info (Transparency) */}
          {currentUser?.regionId && (
            <Alert 
              severity="info" 
              sx={{ mb: 3, borderRadius: 2 }}
              icon={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Region/Team Assignment (Auto-Selected)
                </Typography>
              </Box>}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Region:
                  </Typography>
                  <Chip 
                    label={
                      regions.find(r => r.id === currentUser.regionId)?.name || 
                      currentUser.regionId || 
                      'Not Assigned'
                    }
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  {currentUser.teamId && (
                    <>
                      <Typography variant="body2" fontWeight={600} sx={{ ml: 2 }}>
                        Team:
                      </Typography>
                      <Chip 
                        label={
                          regions
                            .find(r => r.id === currentUser.regionId)
                            ?.teams?.find((t: any) => t.id === currentUser.teamId)?.name || 
                          currentUser.teamId || 
                          'Not Assigned'
                        }
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 600 }}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Alert>
          )}

          {!currentUser?.regionId && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                No Region Assigned
              </Typography>
              <Typography variant="body2">
                You don't have a region assigned. Please contact your administrator to assign you to a region before creating job orders.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.serviceTypes}>
                <InputLabel>Service Types</InputLabel>
                <Select
                  multiple
                  value={formData.serviceTypes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      serviceTypes: typeof value === 'string' ? value.split(',') as ServiceType[] : value as ServiceType[]
                    });
                    if (errors.serviceTypes) {
                      setErrors({ ...errors, serviceTypes: '' });
                    }
                  }}
                  input={<OutlinedInput label="Service Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Inspection">
                    <Checkbox checked={formData.serviceTypes.indexOf('Inspection') > -1} />
                    <ListItemText primary="Equipment Inspection" />
                  </MenuItem>
                  <MenuItem value="Assessment">
                    <Checkbox checked={formData.serviceTypes.indexOf('Assessment') > -1} />
                    <ListItemText primary="Operator Assessment" />
                  </MenuItem>
                  <MenuItem value="Training">
                    <Checkbox checked={formData.serviceTypes.indexOf('Training') > -1} />
                    <ListItemText primary="Training Session" />
                  </MenuItem>
                  <MenuItem value="NDT">
                    <Checkbox checked={formData.serviceTypes.indexOf('NDT') > -1} />
                    <ListItemText primary="NDT Testing" />
                  </MenuItem>
                </Select>
                {errors.serviceTypes && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.serviceTypes}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                  You can select multiple services (e.g., Inspection + Training)
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Location"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (errors.location) {
                    setErrors({ ...errors, location: '' });
                  }
                }}
                placeholder="Service location address"
                error={!!errors.location}
                helperText={errors.location}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Date & Time"
                value={formData.dateTime}
                onChange={(e) => {
                  setFormData({ ...formData, dateTime: e.target.value });
                  if (errors.dateTime) {
                    setErrors({ ...errors, dateTime: '' });
                  }
                }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateTime}
                helperText={errors.dateTime}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel required>Priority</FormLabel>
              <RadioGroup
                row
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <FormControlLabel value="Low" control={<Radio />} label="Low" />
                <FormControlLabel value="Medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="High" control={<Radio />} label="High" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description / Additional Requirements"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide any additional details about the job order..."
              />
            </Grid>

            {/* Sticker Allocation Section - Through Job Order */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Sticker Allocation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select from your assigned stickers to link with this job order
                    {!selectedTagId && (
                      <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                        *
                      </Typography>
                    )}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setShowStickerSection(!showStickerSection);
                    if (!showStickerSection) {
                      loadAvailableStickers();
                    }
                  }}
                >
                  {showStickerSection ? 'Hide' : 'Show'}
                </Button>
              </Box>
              {errors.stickerOrTag && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {errors.stickerOrTag}
                </Alert>
              )}
              {showStickerSection && (
                <Grid container spacing={2}>
                  {availableStickers.length === 0 ? (
                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          No Available Stickers
                        </Typography>
                        <Typography variant="body2">
                          You don't have any available stickers assigned. Please request stock from the manager first.
                        </Typography>
                      </Alert>
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Select Sticker Lot"
                          value={selectedStickerStockId}
                          onChange={(e) => {
                            setSelectedStickerStockId(e.target.value);
                            const selected = availableStickers.find((s) => s.id === e.target.value);
                            if (selected) {
                              setStickerNumber('');
                              setStickerSize(selected.size || 'Large');
                            }
                          }}
                          helperText="Select from your assigned sticker lots"
                        >
                          {availableStickers.map((sticker) => (
                            <MenuItem key={sticker.id} value={sticker.id}>
                              {sticker.lotNumber} ({sticker.size || 'Large'}) - {sticker.availableQuantity} available
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      {selectedStickerStockId && (
                        <>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              select
                              label="Sticker Size"
                              value={stickerSize}
                              onChange={(e) => setStickerSize(e.target.value as StickerSize)}
                            >
                              <MenuItem value="Large">Large</MenuItem>
                              <MenuItem value="Small">Small</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Sticker Number (Optional)"
                              value={stickerNumber}
                              onChange={(e) => setStickerNumber(e.target.value)}
                              placeholder="Enter specific sticker number if applicable"
                              helperText="Track specific sticker number used for this job"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                              <Typography variant="body2">
                                <strong>Selected:</strong> {availableStickers.find((s) => s.id === selectedStickerStockId)?.lotNumber} ({stickerSize})
                                <br />
                                <strong>Available:</strong> {availableStickers.find((s) => s.id === selectedStickerStockId)?.availableQuantity} sticker(s)
                                <br />
                                This sticker will be allocated to this job order for accountability and tracking.
                              </Typography>
                            </Alert>
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12}>
                        <Box>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="sticker-photo-upload"
                            type="file"
                            onChange={handleStickerPhotoChange}
                            capture="environment"
                          />
                          <label htmlFor="sticker-photo-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              fullWidth
                              startIcon={<PhotoCameraIcon />}
                              sx={{ height: '56px' }}
                              disabled={!selectedStickerStockId}
                            >
                              {stickerPhoto ? `Photo: ${stickerPhoto.name}` : 'Upload Sticker Photo (Optional)'}
                            </Button>
                          </label>
                          {stickerPhoto && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Photo uploaded: {stickerPhoto.name} ({(stickerPhoto.size / 1024).toFixed(2)} KB)
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Take a photo of the sticker attached to equipment for accountability
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </Grid>

            {/* Tag Allocation Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Tag Allocation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select a physical tag with unique number for traceability. Tags are ready-to-use items.
                    {!selectedStickerStockId && (
                      <Typography component="span" color="error" sx={{ ml: 1 }}>
                        *
                      </Typography>
                    )}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setShowTagSection(!showTagSection);
                    if (!showTagSection) {
                      loadAvailableTags();
                    }
                  }}
                >
                  {showTagSection ? 'Hide' : 'Show'}
                </Button>
              </Box>
              {showTagSection && (
                <Grid container spacing={2}>
                  {availableTags.length === 0 ? (
                    <Grid item xs={12}>
                      <Alert severity={!selectedStickerStockId ? 'error' : 'warning'} sx={{ borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          No Available Tags
                        </Typography>
                        <Typography variant="body2">
                          {!selectedStickerStockId
                            ? 'You must select either a sticker or a tag. Please select a sticker above, or ask manager to enter tags first (ready-to-use items from shipment).'
                            : 'No available tags in the system. Manager needs to enter tags first (ready-to-use items from shipment). (Sticker already selected)'}
                        </Typography>
                      </Alert>
                    </Grid>
                  ) : (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Select Tag"
                        value={selectedTagId}
                        onChange={(e) => setSelectedTagId(e.target.value)}
                        helperText="Select a physical tag with unique number for traceability"
                      >
                        {availableTags.map((tag) => (
                          <MenuItem key={tag.id} value={tag.id}>
                            {tag.tagNumber}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}
                  {selectedTagId && (
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Selected Tag:</strong> {availableTags.find((t) => t.id === selectedTagId)?.tagNumber}
                          <br />
                          This tag will be allocated to this job order for traceability. If removed, it will be detected immediately.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/inspector/jobs')}
              disabled={loading}
              sx={{ px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading || !hasPermission || !currentUser?.regionId || (activeTab === 1 && (clientExistsError.show || !!errors.clientExists))}
              sx={{
                px: 4,
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                },
                '&:disabled': {
                  background: '#ccc',
                },
              }}
            >
              {loading ? 'Creating...' : 'Create Job Order'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

