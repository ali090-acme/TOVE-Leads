import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { getStatusChip } from '@/components/common/DataTable';

export const JobOrderDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobOrders, submitJobOrderReport } = useAppContext();
  const jobOrder = jobOrders.find((job) => job.id === jobId);

  const [formData, setFormData] = useState({
    equipmentSerial: '',
    location: jobOrder?.location || '',
    condition: '',
    safetyCheck: '',
    loadTest: '',
    visualInspection: '',
    observations: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  if (!jobOrder) {
    return (
      <Alert severity="error">Job order not found</Alert>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPhotos([...photos, ...Array.from(event.target.files)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};
    
    if (!formData.equipmentSerial.trim()) {
      errors.equipmentSerial = true;
    }
    if (!formData.safetyCheck) {
      errors.safetyCheck = true;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    
    // Save to localStorage for persistence
    setTimeout(() => {
      localStorage.setItem(`draft-${jobId}`, JSON.stringify({ formData, photoCount: photos.length }));
      setIsSaving(false);
      setSnackbarMessage('Draft saved successfully!');
      setShowSnackbar(true);
    }, 500);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setShowSnackbar(true);
      return;
    }

    if (photos.length === 0) {
      if (!confirm('No photos uploaded. Do you want to submit anyway?')) {
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const success = submitJobOrderReport(jobId!, formData, photos);
      
      setIsSubmitting(false);
      
      if (success) {
        // Clear draft
        localStorage.removeItem(`draft-${jobId}`);
        
        setSnackbarMessage('Report submitted for approval successfully!');
        setShowSnackbar(true);
        
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/inspector');
        }, 2000);
      } else {
        setSnackbarMessage('Error submitting report. Please try again.');
        setShowSnackbar(true);
      }
    }, 1500);
  };

  // Load draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem(`draft-${jobId}`);
    if (draft) {
      try {
        const { formData: savedFormData } = JSON.parse(draft);
        setFormData(savedFormData);
        setSnackbarMessage('Draft loaded');
        setShowSnackbar(true);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [jobId]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Job Order Detail
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete the inspection checklist and submit for approval
        </Typography>
      </Box>

      {/* Job Order Header */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Job ID
              </Typography>
              <Typography variant="h6" fontWeight={600}>{jobOrder.id}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Client
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {jobOrder.clientName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Service Type
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {jobOrder.serviceType}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Status
              </Typography>
              {getStatusChip(jobOrder.status)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Scheduled Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {format(jobOrder.dateTime, 'EEEE, MMMM dd, yyyy - hh:mm a')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Location
              </Typography>
              <Typography variant="body1" fontWeight={500}>{jobOrder.location}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Inspection Checklist Form */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Inspection Checklist
          </Typography>

          <Grid container spacing={3}>
            {/* Equipment Details Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Equipment Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Equipment Serial Number"
                value={formData.equipmentSerial}
                onChange={(e) => handleInputChange('equipmentSerial', e.target.value)}
                error={formErrors.equipmentSerial}
                helperText={formErrors.equipmentSerial ? 'This field is required' : 'Required field'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Equipment Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </Grid>

            {/* Inspection Questions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                Safety Checks
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel required error={formErrors.safetyCheck}>
                Safety Check Passed?
              </FormLabel>
              <RadioGroup
                row
                value={formData.safetyCheck}
                onChange={(e) => {
                  handleInputChange('safetyCheck', e.target.value);
                  setFormErrors({ ...formErrors, safetyCheck: false });
                }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
              {formErrors.safetyCheck && (
                <Typography variant="caption" color="error">
                  This field is required
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel>Load Test Completed?</FormLabel>
              <RadioGroup
                row
                value={formData.loadTest}
                onChange={(e) => handleInputChange('loadTest', e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel>Visual Inspection Passed?</FormLabel>
              <RadioGroup
                row
                value={formData.visualInspection}
                onChange={(e) => handleInputChange('visualInspection', e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Overall Condition"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observations & Notes"
                placeholder="Enter any additional observations, defects found, or recommendations..."
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Photo Upload Section */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
            Photo Documentation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload photos of the equipment, inspection points, and any defects found
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<UploadIcon />}
              sx={{ px: 3 }}
            >
              Upload Photos
              <input type="file" hidden multiple accept="image/*" onChange={handlePhotoUpload} />
            </Button>
            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<CameraIcon />}
              sx={{ px: 3 }}
            >
              Take Photo
              <input type="file" hidden accept="image/*" capture="environment" onChange={handlePhotoUpload} />
            </Button>
          </Box>

          {photos.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Uploaded Photos ({photos.length})
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                {photos.map((photo, index) => (
                  <ListItem
                    key={index}
                    sx={{ 
                      borderBottom: index < photos.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemovePhoto(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={photo.name} 
                      secondary={`${(photo.size / 1024).toFixed(2)} KB`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Please ensure all mandatory fields are completed before submitting for approval.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />} 
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting || jobOrder.status === 'Completed'}
              sx={{ px: 3 }}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              variant="contained" 
              size="large"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} 
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting || jobOrder.status === 'Completed'}
              sx={{
                px: 4,
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                },
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </Box>
          
          {/* Success/Error Snackbar */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={4000}
            onClose={() => setShowSnackbar(false)}
            message={snackbarMessage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

