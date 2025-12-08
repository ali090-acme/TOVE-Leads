import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { TrainingSession, JobOrder } from '@/types';

export const TrainingSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { trainingSessions, jobOrders, currentUser, createTrainingSession } = useAppContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJobOrderId, setSelectedJobOrderId] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  // Get all job orders assigned to this trainer (for display)
  const assignedJobOrders = useMemo(() => {
    return jobOrders.filter((job) => {
      // Must have Training in service types
      if (!job.serviceTypes?.includes('Training')) return false;
      
      // Check if assigned to this trainer via assignedTo or assignments.trainer
      const isAssignedToTrainer =
        job.assignedTo === currentUser?.id ||
        job.assignments?.trainer?.userId === currentUser?.id;
      
      return isAssignedToTrainer;
    });
  }, [jobOrders, currentUser?.id]);

  // Get approved job orders that have Training in serviceTypes and don't have training session yet
  // Also filter by trainer assignment (if job is assigned to this trainer)
  const availableJobOrders = useMemo(() => {
    // Filter assigned job orders to only Approved or In Progress
    const trainingJobOrders = assignedJobOrders.filter((job) => {
      // Must be Approved or In Progress
      return job.status === 'Approved' || job.status === 'In Progress';
    });
    
    // Filter out job orders that already have training sessions
    const jobOrderIdsWithTraining = new Set(trainingSessions.map((ts) => ts.jobOrderId));
    return trainingJobOrders.filter((job) => !jobOrderIdsWithTraining.has(job.id));
  }, [assignedJobOrders, trainingSessions]);

  const handleCreateTraining = () => {
    setError('');
    
    if (!selectedJobOrderId) {
      setError('Please select a job order');
      return;
    }
    
    if (!scheduledDateTime) {
      setError('Please select date and time');
      return;
    }
    
    if (!location.trim()) {
      setError('Please enter location');
      return;
    }

    const selectedJobOrder = jobOrders.find((j) => j.id === selectedJobOrderId);
    if (!selectedJobOrder) {
      setError('Selected job order not found');
      return;
    }

    const newTraining: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'> = {
      jobOrderId: selectedJobOrderId,
      clientId: selectedJobOrder.clientId,
      trainerId: currentUser?.id || '',
      trainerName: currentUser?.name || 'Trainer',
      scheduledDateTime: new Date(scheduledDateTime),
      attendanceList: [],
      assessmentResults: [],
      approvalStatus: 'Pending',
      location: location.trim(),
      status: 'Scheduled',
    };

    if (createTrainingSession(newTraining)) {
      setOpenDialog(false);
      setSelectedJobOrderId('');
      setScheduledDateTime('');
      setLocation('');
      setError('');
    } else {
      setError('Failed to create training session');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            Training Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your scheduled training sessions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={availableJobOrders.length === 0}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
            },
          }}
        >
          Schedule New Session
        </Button>
      </Box>

      {/* Assigned Job Orders Section */}
      {assignedJobOrders.length > 0 && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
              p: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <AssignmentIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600}>
                Assigned Job Orders
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.95, ml: 5 }}>
              Job orders assigned to you for training
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assignedJobOrders.map((job) => {
                const hasTrainingSession = trainingSessions.some((ts) => ts.jobOrderId === job.id);
                return (
                  <Card
                    key={job.id}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: hasTrainingSession ? 'primary.light' : 'divider',
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: hasTrainingSession ? 'action.hover' : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: 1.5,
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AssignmentIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                            {job.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.clientName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={job.status}
                          size="small"
                          color={
                            job.status === 'In Progress'
                              ? 'primary'
                              : job.status === 'Approved'
                              ? 'success'
                              : job.status === 'Pending'
                              ? 'warning'
                              : 'default'
                          }
                          sx={{ fontWeight: 500 }}
                        />
                        {hasTrainingSession && (
                          <Chip 
                            label="Session Created" 
                            size="small" 
                            color="info"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                          Location:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {job.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                          Scheduled:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {format(job.dateTime, 'MMM dd, yyyy - hh:mm a')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                        Services:
                      </Typography>
                      {job.serviceTypes?.map((type) => (
                        <Chip 
                          key={type} 
                          label={type} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      ))}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Upcoming Sessions
          </Typography>
          <List>
            {trainingSessions.map((session, index) => (
              <React.Fragment key={session.id}>
                <ListItem
                  sx={{ px: 0, cursor: 'pointer' }}
                  onClick={() => navigate(`/trainer/results/${session.id}`)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={500}>
                          Session {session.id}
                        </Typography>
                        <Chip label={session.status} size="small" color="info" />
                      </Box>
                    }
                    secondary={
                      <>
                        {format(session.scheduledDateTime, 'EEEE, MMMM dd, yyyy - hh:mm a')}
                        <br />
                        Location: {session.location}
                        <br />
                        Participants: {session.attendanceList.length}
                      </>
                    }
                  />
                </ListItem>
                {index < trainingSessions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {trainingSessions.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No scheduled sessions
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Create Training Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Training Session</DialogTitle>
        <DialogContent>
          {availableJobOrders.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No approved job orders with Training service available. Please wait for job orders to be approved.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                <InputLabel>Select Job Order *</InputLabel>
                <Select
                  value={selectedJobOrderId}
                  onChange={(e) => {
                    setSelectedJobOrderId(e.target.value);
                    const job = jobOrders.find((j) => j.id === e.target.value);
                    if (job) {
                      setLocation(job.location);
                    }
                  }}
                  label="Select Job Order *"
                >
                  {availableJobOrders.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.id} - {job.clientName} ({format(job.dateTime, 'MMM dd, yyyy')})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Date & Time *"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Location *"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTraining}
            variant="contained"
            disabled={availableJobOrders.length === 0}
          >
            Create Training
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};



