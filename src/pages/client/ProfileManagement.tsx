import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as CameraIcon,
  Lock as LockIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';

export const ProfileManagement: React.FC = () => {
  const { currentUser, clients, setCurrentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Get client data if user is a client
  const clientData = currentUser ? clients.find(c => c.id === currentUser.id) : null;
  
  const [formData, setFormData] = useState({
    // Read-only fields
    name: currentUser?.name || '',
    idNumber: 'ID-123456', // Mock ID number
    dateOfBirth: '1990-01-01', // Mock DOB
    
    // Editable fields
    mobileNumber: clientData?.phone || '+971 50 123 4567',
    email: currentUser?.email || '',
    nationality: 'UAE',
    address: clientData?.address || '123 Business Bay, Building 5',
    city: clientData?.location || 'Dubai',
    country: 'United Arab Emirates',
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState(formData);

  // Load profile picture from localStorage
  useEffect(() => {
    if (currentUser?.id) {
      const storedPicture = localStorage.getItem(`profile-picture-${currentUser.id}`);
      if (storedPicture) {
        setProfilePicture(storedPicture);
      }
    }
  }, [currentUser?.id]);

  // Update form data when user changes
  useEffect(() => {
    if (currentUser) {
      const newData = {
        name: currentUser.name,
        idNumber: 'ID-123456',
        dateOfBirth: '1990-01-01',
        mobileNumber: clientData?.phone || '+971 50 123 4567',
        email: currentUser.email,
        nationality: 'UAE',
        address: clientData?.address || '123 Business Bay, Building 5',
        city: clientData?.location || 'Dubai',
        country: 'United Arab Emirates',
      };
      setFormData(newData);
      setOriginalData(newData);
    }
  }, [currentUser, clientData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update current user
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email,
        };
        setCurrentUser(updatedUser);

        // Update client data if user is a client
        if (clientData) {
          const updatedClients = clients.map(c => 
            c.id === currentUser.id 
              ? {
                  ...c,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.mobileNumber,
                  address: formData.address,
                  location: formData.city,
                }
              : c
          );
          localStorage.setItem('clients', JSON.stringify(updatedClients));
        }

        // Save profile picture
        if (profilePicture) {
          localStorage.setItem(`profile-picture-${currentUser.id}`, profilePicture);
        }

        // Save change history
        const changes = [];
        if (formData.email !== originalData.email) {
          changes.push({
            field: 'Email',
            oldValue: originalData.email,
            newValue: formData.email,
            date: new Date().toISOString(),
          });
        }
        if (formData.mobileNumber !== originalData.mobileNumber) {
          changes.push({
            field: 'Mobile Number',
            oldValue: originalData.mobileNumber,
            newValue: formData.mobileNumber,
            date: new Date().toISOString(),
          });
        }
        if (formData.address !== originalData.address) {
          changes.push({
            field: 'Address',
            oldValue: originalData.address,
            newValue: formData.address,
            date: new Date().toISOString(),
          });
        }
        if (formData.city !== originalData.city) {
          changes.push({
            field: 'City',
            oldValue: originalData.city,
            newValue: formData.city,
            date: new Date().toISOString(),
          });
        }
        if (formData.nationality !== originalData.nationality) {
          changes.push({
            field: 'Nationality',
            oldValue: originalData.nationality,
            newValue: formData.nationality,
            date: new Date().toISOString(),
          });
        }
        if (formData.country !== originalData.country) {
          changes.push({
            field: 'Country',
            oldValue: originalData.country,
            newValue: formData.country,
            date: new Date().toISOString(),
          });
        }

        if (changes.length > 0) {
          const existingHistory = JSON.parse(localStorage.getItem(`profile-history-${currentUser.id}`) || '[]');
          const newHistory = [...existingHistory, ...changes];
          localStorage.setItem(`profile-history-${currentUser.id}`, JSON.stringify(newHistory));
        }

        setOriginalData(formData);
        setIsEditing(false);
        setHasChanges(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleViewHistory = () => {
    if (!currentUser) return;
    
    const history = JSON.parse(localStorage.getItem(`profile-history-${currentUser.id}`) || '[]');
    
    if (history.length === 0) {
      setSnackbar({
        open: true,
        message: 'No change history available.',
        severity: 'success',
      });
      return;
    }

    const historyText = history
      .slice()
      .reverse()
      .map((change: any) => {
        const date = new Date(change.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return `• ${change.field}: ${change.newValue} (Updated: ${date})`;
      })
      .join('\n');

    const message = `Profile Change History:\n\n${historyText}\n\nNote: Name, ID Number, and Date of Birth cannot be changed.`;
    
    // Show in alert (similar to mobile)
    alert(message);
  };

  if (!currentUser) {
    return (
      <Alert severity="error">Please log in to view your profile</Alert>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Profile Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your profile information and view change history
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Picture & Actions */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={profilePicture || undefined}
                  sx={{
                    width: 140,
                    height: 140,
                    mx: 'auto',
                    bgcolor: 'primary.main',
                    fontSize: 56,
                    border: '4px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  {!profilePicture && currentUser.name.charAt(0).toUpperCase()}
                </Avatar>
                {isEditing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 'calc(50% - 70px)',
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 40,
                      height: 40,
                      border: '3px solid white',
                      boxShadow: 3,
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <CameraIcon />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {formData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentUser.roles.includes('client') ? 'Client' : 'Operator'}
              </Typography>
            </CardContent>
          </Card>

          {/* Action Buttons Card */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              {!isEditing ? (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleUpdate}
                    disabled={!hasChanges || loading}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#a0a0a0',
                      },
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ py: 1.5 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Change History Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              startIcon={<HistoryIcon />}
              onClick={handleViewHistory}
              sx={{
                color: 'primary.main',
                textDecoration: 'underline',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              View Change History →
            </Button>
          </Box>
        </Grid>

        {/* Right Column - Form Fields */}
        <Grid item xs={12} md={8}>
          {/* Read-only Fields Section */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Personal Information (Read-only)
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.name}
                    disabled
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: 'action.disabledBackground',
                        '& .MuiInputBase-input': {
                          color: 'text.secondary',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: <LockIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    ID Number
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.idNumber}
                    disabled
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: 'action.disabledBackground',
                        '& .MuiInputBase-input': {
                          color: 'text.secondary',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: <LockIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Date of Birth
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.dateOfBirth}
                    disabled
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: 'action.disabledBackground',
                        '& .MuiInputBase-input': {
                          color: 'text.secondary',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: <LockIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Editable Contact Information */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Contact Information (Editable)
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Mobile Number
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="+971..."
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Nationality
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Nationality"
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Address (Editable)
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Address
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street, Building"
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    City
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Country
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
