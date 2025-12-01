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
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, Edit as ReviseIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { mockJobOrders } from '@/utils/mockData';
import { format } from 'date-fns';
import { getStatusChip } from '@/components/common/DataTable';

export const ApprovalDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const jobOrder = mockJobOrders.find((job) => job.id === jobId);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviseDialogOpen, setReviseDialogOpen] = useState(false);
  const [comments, setComments] = useState('');

  if (!jobOrder) {
    return <Alert severity="error">Job order not found</Alert>;
  }

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this report?')) {
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
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Review Submission
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review the inspection report and approve or request changes
        </Typography>
      </Box>

      {/* Job Order Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
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

      {/* Action Buttons */}
      <Card>
        <CardContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please review all submitted data carefully before taking action.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => setRejectDialogOpen(true)}
            >
              Reject Report
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<ReviseIcon />}
              onClick={() => setReviseDialogOpen(true)}
            >
              Request Revision
            </Button>
            <Button variant="contained" color="success" startIcon={<ApproveIcon />} onClick={handleApprove}>
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




