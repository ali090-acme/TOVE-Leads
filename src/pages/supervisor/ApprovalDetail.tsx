import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, Edit as ReviseIcon, Person as PersonIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { mockJobOrders } from '@/utils/mockData';
import { format } from 'date-fns';
import { getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { logUserAction } from '@/utils/activityLogger';

export const ApprovalDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { currentUser, users, approveJobOrder, rejectJobOrder } = useAppContext();
  const jobOrder = mockJobOrders.find((job) => job.id === jobId);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviseDialogOpen, setReviseDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [useDelegation, setUseDelegation] = useState(false);
  const [delegatedToUserId, setDelegatedToUserId] = useState('');

  if (!jobOrder) {
    return <Alert severity="error">Job order not found</Alert>;
  }

  const handleApprove = () => {
    if (!confirm('Are you sure you want to approve this report?')) return;

    // Check if delegation is active
    const delegation = currentUser?.delegation;
    let actualUserId = currentUser?.id || '';
    let actualUserName = currentUser?.name || '';
    let actualUserRole = currentUser?.currentRole || currentUser?.roles[0] || '';
    let displayedUserId = currentUser?.id || '';
    let displayedUserName = currentUser?.name || '';
    let displayedUserRole = currentUser?.currentRole || currentUser?.roles[0] || '';

    if (useDelegation && delegatedToUserId) {
      const delegatedToUser = users.find((u) => u.id === delegatedToUserId);
      if (delegatedToUser) {
        actualUserId = delegatedToUser.id;
        actualUserName = delegatedToUser.name;
        actualUserRole = delegatedToUser.currentRole || delegatedToUser.roles[0] || '';
        displayedUserId = currentUser?.id || '';
        displayedUserName = currentUser?.name || '';
        displayedUserRole = currentUser?.currentRole || currentUser?.roles[0] || '';
      }
    } else if (delegation?.active) {
      // Use existing delegation
      const delegatedToUser = users.find((u) => u.id === delegation.delegatedToId);
      if (delegatedToUser) {
        actualUserId = delegatedToUser.id;
        actualUserName = delegatedToUser.name;
        actualUserRole = delegatedToUser.currentRole || delegatedToUser.roles[0] || '';
        displayedUserId = currentUser?.id || '';
        displayedUserName = currentUser?.name || '';
        displayedUserRole = currentUser?.currentRole || currentUser?.roles[0] || '';
      }
    }

    if (approveJobOrder && jobOrder) {
      approveJobOrder(jobOrder.id);
      
      // Log with delegation info
      logUserAction(
        'APPROVE',
        'JOB_ORDER',
        jobOrder.id,
        jobOrder.id,
        `Job order approved: ${jobOrder.id}`,
        { jobOrderId: jobOrder.id, clientName: jobOrder.clientName },
        actualUserId,
        actualUserName,
        actualUserRole,
        displayedUserId !== actualUserId ? displayedUserId : undefined,
        displayedUserName !== actualUserName ? displayedUserName : undefined,
        displayedUserRole !== actualUserRole ? displayedUserRole : undefined
      );

      alert('Report approved successfully!');
      navigate('/supervisor');
    }
  };

  const handleReject = () => {
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    alert('Report rejected and sent back to inspector');
    setRejectDialogOpen(false);
    navigate('/supervisor');
  };

  const handleRequestRevision = () => {
    if (!comments.trim()) {
      alert('Please provide revision comments');
      return;
    }
    alert('Revision request sent to inspector');
    setReviseDialogOpen(false);
    navigate('/supervisor');
  };

  // Mock inspection data
  const inspectionData = {
    equipmentSerial: 'SN-12345',
    location: jobOrder.location,
    safetyCheck: 'Yes',
    loadTest: 'Yes',
    visualInspection: 'Yes',
    condition: 'Good',
    observations: 'Equipment is in good working condition. Minor wear on cable, recommend monitoring.',
    photos: ['inspection_photo1.jpg', 'inspection_photo2.jpg', 'equipment_serial.jpg'],
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Review Submission
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review the inspection report and approve or request changes
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Job ID
              </Typography>
              <Typography variant="h6">{jobOrder.id}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Inspector
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobOrder.assignedToName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Service Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobOrder.serviceType}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              {getStatusChip(jobOrder.status)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Client
              </Typography>
              <Typography variant="body1">{jobOrder.clientName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Submission Date
              </Typography>
              <Typography variant="body1">{format(jobOrder.dateTime, 'EEEE, MMMM dd, yyyy')}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submission Details */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Inspection Details
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Equipment Serial Number
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {inspectionData.equipmentSerial}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Equipment Location
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {inspectionData.location}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Safety Check Passed?
              </Typography>
              <Chip label={inspectionData.safetyCheck} color="success" size="small" sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Load Test Completed?
              </Typography>
              <Chip label={inspectionData.loadTest} color="success" size="small" sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Visual Inspection Passed?
              </Typography>
              <Chip label={inspectionData.visualInspection} color="success" size="small" sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Overall Condition
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {inspectionData.condition}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Observations & Notes
              </Typography>
              <Typography variant="body1">{inspectionData.observations}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Photo Documentation
          </Typography>
          <List>
            {inspectionData.photos.map((photo, index) => (
              <ListItem key={index}>
                <ListItemText primary={photo} secondary="Click to view" />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Delegation Option */}
      {currentUser && (currentUser.roles.includes('supervisor') || currentUser.roles.includes('manager') || currentUser.roles.includes('gm')) && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
              Shadow Role / Delegation
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                If you have an active delegation, actions will be logged with the delegated user's name for accountability,
                but will appear as your name in the front end.
              </Typography>
            </Alert>
            {currentUser.delegation?.active ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Active Delegation:</strong> Actions will be performed by {currentUser.delegation.delegatedToName},
                  but will show as {currentUser.name} in the front end.
                </Typography>
              </Alert>
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={useDelegation}
                    onChange={(e) => setUseDelegation(e.target.checked)}
                  />
                }
                label="Use delegation for this action"
                sx={{ mb: 2 }}
              />
            )}
            {useDelegation && !currentUser.delegation?.active && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select User to Delegate To</InputLabel>
                <Select
                  value={delegatedToUserId}
                  onChange={(e) => setDelegatedToUserId(e.target.value)}
                  label="Select User to Delegate To"
                >
                  {users
                    .filter((u) => u.id !== currentUser?.id && (u.roles.includes('inspector') || u.roles.includes('trainer')))
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Please review all submitted data carefully before taking action.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => setRejectDialogOpen(true)}
              sx={{ px: 3 }}
            >
              Reject Report
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<ReviseIcon />}
              onClick={() => setReviseDialogOpen(true)}
              sx={{ px: 3 }}
            >
              Request Revision
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<ApproveIcon />} 
              onClick={handleApprove}
              sx={{
                px: 4,
                background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0a3e4e 0%, #61a270 100%)',
                },
              }}
            >
              Approve Report
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejection. The inspector will be notified.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Revision Dialog */}
      <Dialog open={reviseDialogOpen} onClose={() => setReviseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Revision</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Specify what needs to be revised. The inspector will make the changes and resubmit.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter revision comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRequestRevision} variant="contained" color="warning">
            Request Revision
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};




