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
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
  Divider,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Send as SendIcon, Cancel as CancelIcon, Person as PersonIcon, Save as SaveIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon, Inventory as InventoryIcon, MyLocation as MyLocationIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, ServiceType, Client } from '@/types';
import { format } from 'date-fns';
import { fileToBase64 } from '@/utils/offlineQueue';

export const CreateJobOrder: React.FC = () => {
  const navigate = useNavigate();
  const { clients, createJobOrder, users, currentUser } = useAppContext();

  const [formData, setFormData] = useState({
    clientId: '',
    serviceTypes: [] as ServiceType[],
    dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    assignedUserIds: [] as string[], // Multiple users can be assigned
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    amount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Priority 1: Save as Draft, Attachments, Share with Client
  const [attachments, setAttachments] = useState<File[]>([]);
  const [shareWithClient, setShareWithClient] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  
  // Location Detection
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [detectedCoordinates, setDetectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Get all system users (for assignment)
  // TODO: When DB/backend is implemented, replace this with API call:
  // const availableUsers = await fetchAvailableUsers(); // API will check availability, workload, etc.
  // For now, showing all users who can perform work (not clients/operators who receive services)
  const availableUsers = users.filter((u) => {
    // Exclude clients and operators - they receive services, they don't perform them
    // Only include users who can perform work: inspector, trainer, supervisor, accountant, manager, gm
    const workRoles = ['inspector', 'trainer', 'supervisor', 'accountant', 'manager', 'gm'];
    // Check currentRole (primary) or roles array
    const userRole = (u.currentRole || (u.roles && u.roles[0]) || '').toLowerCase();
    // Check if user has any work role
    const hasWorkRole = workRoles.includes(userRole) || (u.roles && u.roles.some((r) => workRoles.includes(r.toLowerCase())));
    // Exclude clients and operators
    const isClientOrOperator = userRole === 'client' || userRole === 'operator' || 
                               (u.roles && (u.roles.includes('client' as any) || u.roles.includes('operator' as any)));
    return hasWorkRole && !isClientOrOperator;
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (formData.serviceTypes.length === 0) {
      newErrors.serviceTypes = 'At least one service type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time is required';
    }

    // Assignment validation
    if (formData.assignedUserIds.length === 0) {
      newErrors.assignedUserIds = 'At least one user must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Priority 1: Handle attachments upload
  const handleAttachmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Limit to 10 files max
      if (attachments.length + fileArray.length > 10) {
        setSnackbar({
          open: true,
          message: 'Maximum 10 attachments allowed',
          severity: 'error',
        });
        return;
      }
      // Check file size (max 10MB per file)
      const oversizedFiles = fileArray.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setSnackbar({
          open: true,
          message: `Some files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`,
          severity: 'error',
        });
        return;
      }
      setAttachments([...attachments, ...fileArray]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Priority 1: Save as Draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    
    try {
      // Convert attachments to base64
      const attachmentBase64s: string[] = [];
      for (const file of attachments) {
        const base64 = await fileToBase64(file);
        attachmentBase64s.push(base64);
      }

      // Prepare draft data
      const draftData = {
        formData,
        attachments: attachmentBase64s,
        attachmentNames: attachments.map(f => f.name),
        shareWithClient,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const draftKey = `supervisor-job-order-draft-${currentUser?.id || 'default'}`;
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      setIsSavingDraft(false);
      setSnackbar({
        open: true,
        message: 'Draft saved successfully! You can continue editing later.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      setIsSavingDraft(false);
      setSnackbar({
        open: true,
        message: 'Failed to save draft. Please try again.',
        severity: 'error',
      });
    }
  };

  // Priority 1: Load draft on mount
  React.useEffect(() => {
    const draftKey = `supervisor-job-order-draft-${currentUser?.id || 'default'}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData.formData || formData);
        setShareWithClient(draftData.shareWithClient || false);
        
        // Note: We can't restore File objects from base64, so we'll just show a message
        if (draftData.attachments && draftData.attachments.length > 0) {
          setSnackbar({
            open: true,
            message: `Draft loaded. ${draftData.attachmentNames?.length || 0} attachment(s) were saved. Please re-upload attachments if needed.`,
            severity: 'info',
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Draft loaded successfully!',
            severity: 'info',
          });
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [currentUser?.id]);

  // Location Detection Function
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please enter location manually.');
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by your browser.',
        severity: 'error',
      });
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');
    setDetectedCoordinates(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedCoordinates({ lat: latitude, lng: longitude });

        try {
          // Reverse geocoding to get address from coordinates
          // Using OpenStreetMap Nominatim API (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            const address = data.display_name;
            handleChange('location', address);
            setSnackbar({
              open: true,
              message: `Location detected: ${address}`,
              severity: 'success',
            });
          } else {
            // Fallback to coordinates if address not found
            const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            handleChange('location', coordString);
            setSnackbar({
              open: true,
              message: `Location detected: ${coordString}. You can edit the address if needed.`,
              severity: 'success',
            });
          }
        } catch (error) {
          // Fallback to coordinates if reverse geocoding fails
          const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          handleChange('location', coordString);
          setSnackbar({
            open: true,
            message: `Location coordinates detected: ${coordString}. You can edit the address if needed.`,
            severity: 'success',
          });
        }

        setIsDetectingLocation(false);
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = 'Failed to detect location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        setLocationError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const selectedClient = clients.find((c) => c.id === formData.clientId);
      if (!selectedClient) {
        throw new Error('Client not found');
      }

      // Build assignments object from selected users
      const assignments: any = {};
      const selectedUsers = availableUsers.filter((u) => formData.assignedUserIds.includes(u.id));
      
      // Categorize selected users by role
      selectedUsers.forEach((user) => {
        const userRole = user.currentRole || (user.roles && user.roles[0]) || '';
        if (userRole === 'inspector') {
          assignments.inspector = {
            userId: user.id,
            userName: user.name,
          };
        } else if (userRole === 'trainer') {
          assignments.trainer = {
            userId: user.id,
            userName: user.name,
          };
        }
        // Add other roles as needed (accountant, etc.)
      });

      // Determine assignedTo for backward compatibility (use first selected user)
      const firstSelectedUser = selectedUsers[0];
      const assignedTo = firstSelectedUser?.id;
      const assignedToName = firstSelectedUser?.name;

      // Convert attachments to base64 for storage
      const attachmentBase64s: string[] = [];
      for (const file of attachments) {
        const base64 = await fileToBase64(file);
        attachmentBase64s.push(base64);
      }

      const jobOrderData: Omit<JobOrder, 'id' | 'createdAt' | 'updatedAt'> = {
        clientId: formData.clientId,
        clientName: selectedClient.name,
        serviceTypes: formData.serviceTypes,
        dateTime: new Date(formData.dateTime),
        location: formData.location,
        assignedTo: assignedTo,
        assignedToName: assignedToName,
        assignments: Object.keys(assignments).length > 0 ? assignments : undefined,
        status: 'In Progress', // Supervisor-created jobs don't need approval, they're auto-approved
        priority: formData.priority,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        // Priority 1: Add attachments and shareWithClient
        attachments: attachmentBase64s,
        shareWithClient: shareWithClient,
        isDraft: false, // This is a submitted job order, not a draft
      };

      const newJobOrder = createJobOrder(jobOrderData);

      if (newJobOrder) {
        // Clear draft after successful submission
        const draftKey = `supervisor-job-order-draft-${currentUser?.id || 'default'}`;
        localStorage.removeItem(draftKey);
        
        // Reset form
        setFormData({
          clientId: '',
          serviceTypes: [],
          dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          location: '',
          assignedUserIds: [],
          priority: 'Medium',
          amount: '',
        });
        setAttachments([]);
        setShareWithClient(false);
        
        setSnackbar({
          open: true,
          message: 'Job order created and assigned successfully!',
          severity: 'success',
        });
        
        setTimeout(() => {
        navigate('/supervisor');
        }, 1500);
      } else {
        throw new Error('Failed to create job order');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create job order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Create & Assign Job Order
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new job order and assign it to inspector and/or trainer
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Client Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.clientId}>
                  <InputLabel>Client *</InputLabel>
                  <Select
                    value={formData.clientId}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    input={<OutlinedInput label="Client *" />}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.clientId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.clientId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Service Types */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.serviceTypes}>
                  <InputLabel>Service Types *</InputLabel>
                  <Select
                    multiple
                    value={formData.serviceTypes}
                    onChange={(e) => handleChange('serviceTypes', e.target.value)}
                    input={<OutlinedInput label="Service Types *" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as ServiceType[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['Inspection', 'Assessment', 'Training', 'NDT'].map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={formData.serviceTypes.indexOf(type as ServiceType) > -1} />
                        <ListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.serviceTypes && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.serviceTypes}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Date & Time */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date & Time *"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => handleChange('dateTime', e.target.value)}
                  error={!!errors.dateTime}
                  helperText={errors.dateTime}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location *"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  error={!!errors.location}
                  helperText={errors.location}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Assign Users
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select one or multiple users to assign this job order. Only users who perform work are shown (Inspector, Trainer, Accountant, Supervisor, etc.). Clients/Operators are not shown as they receive services, not perform them.
                </Typography>
              </Grid>

              {/* User Assignment - Multi-select */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.assignedUserIds}>
                  <InputLabel>Assign Users *</InputLabel>
                  <Select
                    multiple
                    value={formData.assignedUserIds}
                    onChange={(e) => handleChange('assignedUserIds', e.target.value)}
                    input={<OutlinedInput label="Assign Users *" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((userId) => {
                          const user = availableUsers.find((u) => u.id === userId);
                          return (
                            <Chip
                              key={userId}
                              label={
                                user
                                  ? `${user.name}${user.id === currentUser?.id ? ' (Self)' : ` (${user.currentRole || (user.roles && user.roles[0]) || 'N/A'})`}`
                                  : userId
                              }
                              size="small"
                              color={user?.id === currentUser?.id ? 'info' : 'default'}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableUsers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        <Checkbox checked={formData.assignedUserIds.indexOf(user.id) > -1} />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {user.name}
                              {user.id === currentUser?.id && (
                                <Chip label="Self" size="small" color="info" sx={{ height: 20 }} />
                              )}
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 'auto', textTransform: 'capitalize' }}
                              >
                                {user.currentRole || (user.roles && user.roles[0]) || 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.assignedUserIds && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.assignedUserIds}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                    Select one or multiple users. Job will be created based on selected service types.
                  </Typography>
                </FormControl>
              </Grid>

              {/* Priority */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    input={<OutlinedInput label="Priority" />}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount (Optional)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              {/* Info Alert for Self-Assignment */}
              {formData.assignedUserIds.includes(currentUser?.id || '') && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <strong>Self-Assignment:</strong> You have assigned yourself to this job order. This is useful when all team members are busy.
                    <br />
                    <strong>Note:</strong> When DB/backend is implemented, availability checks will be automated.
                  </Alert>
                </Grid>
              )}

              {/* Priority 1: Attachments Field */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Attachments (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload supporting documents, photos, or other files related to this job order (Optional - Max 10 files, 10MB each)
                </Typography>
                <Box>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="attachments-upload"
                    type="file"
                    multiple
                    onChange={handleAttachmentsChange}
                  />
                  <label htmlFor="attachments-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Upload Attachments
                    </Button>
                  </label>
                  {attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {attachments.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InventoryIcon color="action" />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(file.size / 1024).toFixed(2)} KB
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveAttachment(index)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Priority 1: Share with Client Checkbox */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shareWithClient}
                      onChange={(e) => setShareWithClient(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Share data with client
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        When checked, the client will be able to view this job order details and progress
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/supervisor')}
                    disabled={loading || isSavingDraft}
                  >
                    Cancel
                  </Button>
                  {/* Priority 1: Save as Draft Button */}
                  <Button
                    variant="outlined"
                    startIcon={isSavingDraft ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={loading || isSavingDraft}
                    sx={{ px: 3 }}
                  >
                    {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={loading || isSavingDraft}
                    sx={{
                      px: 4,
                      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                      },
                    }}
                  >
                    {loading ? 'Creating...' : 'Create & Assign Job Order'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

