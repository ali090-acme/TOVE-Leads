import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, ServiceType } from '@/types';

export const NewServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const { createJobOrder, clients, currentUser } = useAppContext();
  
  const [formData, setFormData] = useState({
    serviceType: '',
    location: '',
    preferredDate: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.preferredDate = 'Preferred date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new job order using AppContext
      const newJobOrder = createJobOrder({
        clientId: currentUser?.id || 'client-1',
        clientName: currentUser?.name || clients[0]?.name || 'Client',
        serviceType: formData.serviceType as ServiceType,
        dateTime: new Date(formData.preferredDate),
        location: formData.location,
        status: 'Pending',
      });

      if (!newJobOrder) {
        throw new Error('Failed to create job order');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Service request submitted successfully! You will be contacted soon.',
        severity: 'success',
      });

      // Reset form
      setFormData({
        serviceType: '',
        location: '',
        preferredDate: '',
        description: '',
      });
      setErrors({});

      // Redirect to service history after 1.5 seconds
      setTimeout(() => {
        navigate('/client/history');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit service request. Please try again.',
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
      <Typography variant="h4" gutterBottom fontWeight={600}>
        New Service Request
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Request a new inspection, assessment, training, or NDT service
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Fill out the form below and our team will contact you to schedule the service.
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="Service Type"
                value={formData.serviceType}
                onChange={(e) => {
                  setFormData({ ...formData, serviceType: e.target.value });
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
                placeholder="Enter service location"
                error={!!errors.location}
                helperText={errors.location}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Preferred Date"
                value={formData.preferredDate}
                onChange={(e) => {
                  setFormData({ ...formData, preferredDate: e.target.value });
                  if (errors.preferredDate) {
                    setErrors({ ...errors, preferredDate: '' });
                  }
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                error={!!errors.preferredDate}
                helperText={errors.preferredDate}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description / Additional Requirements"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide any additional details about your service request..."
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/client/history')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </Box>
            </Grid>
          </Grid>
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



