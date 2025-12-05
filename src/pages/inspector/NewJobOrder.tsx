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
  
  // Initialize offline sync
  React.useEffect(() => {
    initializeOfflineSync();
  }, []);

  // Load available stickers for current inspector
  React.useEffect(() => {
    if (currentUser?.id) {
      loadAvailableStickers();
    }
  }, [currentUser]);

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
  const [showStickerSection, setShowStickerSection] = useState(false);
  const [selectedStickerStockId, setSelectedStickerStockId] = useState<string>('');
  const [availableStickers, setAvailableStickers] = useState<any[]>([]);

  // Form state for existing client
  const [formData, setFormData] = useState({
    clientId: '',
    serviceType: '' as ServiceType | '',
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
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }

    // Common validation
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
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

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      let clientId = formData.clientId;
      let clientName = '';

      // If new client, create it first (mock - in real app, this would be API call)
      if (activeTab === 1) {
        const newClient: Client = {
          id: `client-${Date.now()}`,
          name: newClientData.name,
          email: newClientData.email,
          phone: newClientData.phone,
          address: newClientData.address,
          businessType: newClientData.businessType,
          location: newClientData.location,
          accountStatus: 'Active',
          paymentHistory: [],
          serviceHistory: [],
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
        serviceType: formData.serviceType as ServiceType,
        dateTime: new Date(formData.dateTime),
        location: formData.location,
        status: 'Pending' as const,
        assignedTo: currentUser?.id || 'user-2',
        assignedToName: currentUser?.name || 'Inspector',
        priority: formData.priority,
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
          allocatedAt: new Date(),
          allocatedBy: currentUser?.id || 'user-2',
          stickerPhoto: stickerPhotoBase64,
        } : undefined;

        const offlineJob = addToOfflineQueue({
          ...jobOrderData,
          stickerAllocation,
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
          serviceType: '' as ServiceType | '',
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
          location: '',
        });
        setStickerPhoto(null);
        setStickerNumber('');
        setSelectedStickerStockId('');
        setShowStickerSection(false);
        setErrors({});
        loadAvailableStickers(); // Reload available stickers

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
                allocatedAt: new Date(),
                allocatedBy: currentUser?.id || 'user-2',
                stickerPhoto: stickerPhotoBase64,
              };
              localStorage.setItem('jobOrders', JSON.stringify(jobOrders));
            }
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
        serviceType: '' as ServiceType | '',
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
        location: '',
      });
      setStickerPhoto(null);
      setStickerNumber('');
      setShowStickerSection(false);
      setErrors({});

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
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} - {client.businessType} ({client.location})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </TabPanel>

          {/* New Client Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Client Name"
                  value={newClientData.name}
                  onChange={(e) => {
                    setNewClientData({ ...newClientData, name: e.target.value });
                    if (errors.newClientName) {
                      setErrors({ ...errors, newClientName: '' });
                    }
                  }}
                  error={!!errors.newClientName}
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
                    setNewClientData({ ...newClientData, email: e.target.value });
                    if (errors.newClientEmail) {
                      setErrors({ ...errors, newClientEmail: '' });
                    }
                  }}
                  error={!!errors.newClientEmail}
                  helperText={errors.newClientEmail}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  value={newClientData.phone}
                  onChange={(e) => {
                    setNewClientData({ ...newClientData, phone: e.target.value });
                    if (errors.newClientPhone) {
                      setErrors({ ...errors, newClientPhone: '' });
                    }
                  }}
                  error={!!errors.newClientPhone}
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newClientData.location}
                  onChange={(e) => setNewClientData({ ...newClientData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Divider sx={{ my: 4 }} />

          {/* Common Job Order Fields */}
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Job Order Details
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="Service Type"
                value={formData.serviceType}
                onChange={(e) => {
                  setFormData({ ...formData, serviceType: e.target.value as ServiceType });
                  if (errors.serviceType) {
                    setErrors({ ...errors, serviceType: '' });
                  }
                }}
                error={!!errors.serviceType}
                helperText={errors.serviceType}
              >
                <MenuItem value="Inspection">Equipment Inspection</MenuItem>
                <MenuItem value="Assessment">Operator Assessment</MenuItem>
                <MenuItem value="Training">Training Session</MenuItem>
                <MenuItem value="NDT">NDT Testing</MenuItem>
              </TextField>
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
                    Sticker Allocation (Through Job Order)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select from your assigned stickers to link with this job order
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
                      <Grid item xs={12} md={6}>
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
                            }
                          }}
                          helperText="Select from your assigned sticker lots"
                        >
                          {availableStickers.map((sticker) => (
                            <MenuItem key={sticker.id} value={sticker.id}>
                              {sticker.lotNumber} - {sticker.availableQuantity} available (Total: {sticker.quantity})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      {selectedStickerStockId && (
                        <>
                          <Grid item xs={12} md={6}>
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
                                <strong>Selected:</strong> {availableStickers.find((s) => s.id === selectedStickerStockId)?.lotNumber}
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
              disabled={loading || !hasPermission}
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

