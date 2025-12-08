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
} from '@mui/material';
import { Send as SendIcon, Cancel as CancelIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, ServiceType, Client } from '@/types';
import { format } from 'date-fns';

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
      };

      const newJobOrder = createJobOrder(jobOrderData);

      if (newJobOrder) {
        alert('Job order created and assigned successfully!');
        navigate('/supervisor');
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

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/supervisor')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={loading}
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
    </Box>
  );
};

