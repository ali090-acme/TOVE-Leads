import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Divider,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import { CheckCircle as ConfirmIcon, Cancel as RejectIcon, Description as DocumentIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { getStatusChip } from '@/components/common/DataTable';

export const PaymentVerification: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { payments, jobOrders, confirmPayment, rejectPayment, certificates } = useAppContext();
  const payment = payments.find((p) => p.id === paymentId);
  const jobOrder = payment ? jobOrders.find((j) => j.id === payment.jobOrderId) : null;

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [certificateGenerated, setCertificateGenerated] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!confirm('Are you sure you want to confirm this payment? This will update the job order to Paid status and generate a certificate.')) {
      return;
    }

    setIsProcessing(true);

    // Simulate API call delay
    setTimeout(() => {
      const success = confirmPayment(paymentId!);
      setIsProcessing(false);

      if (success) {
        // Find the generated certificate
        const cert = certificates.find(c => c.jobOrderId === payment?.jobOrderId);
        if (cert) {
          setCertificateGenerated(cert.certificateNumber);
        }

        setSnackbarMessage('Payment confirmed successfully! Certificate generated.');
        setShowSnackbar(true);

        // Redirect after delay
        setTimeout(() => {
          navigate('/accountant');
        }, 3000);
      } else {
        setSnackbarMessage('Error confirming payment. Please try again.');
        setShowSnackbar(true);
      }
    }, 1500);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      setSnackbarMessage('Please provide a reason for rejection');
      setShowSnackbar(true);
      return;
    }

    setIsProcessing(true);
    setRejectDialogOpen(false);

    // Simulate API call delay
    setTimeout(() => {
      const success = rejectPayment(paymentId!, rejectReason);
      setIsProcessing(false);

      if (success) {
        setSnackbarMessage('Payment rejected. Notification sent to client and GM.');
        setShowSnackbar(true);

        // Redirect after delay
        setTimeout(() => {
          navigate('/accountant');
        }, 2000);
      } else {
        setSnackbarMessage('Error rejecting payment. Please try again.');
        setShowSnackbar(true);
      }
    }, 1000);
  };

  if (!payment || !jobOrder) {
    return <Alert severity="error">Payment or job order not found</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Payment Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review payment details and proof of payment
        </Typography>
      </Box>

      {/* Payment Details */}
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
            Payment Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Payment ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {payment.id}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              {getStatusChip(payment.status)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Job Order ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {payment.jobOrderId}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Client
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobOrder.clientName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Service Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {jobOrder.serviceTypes?.map((type) => (
                  <Chip key={type} label={type} size="small" color="primary" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {payment.method}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight={600}>
                ${payment.amount}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Submission Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {format(payment.createdAt, 'MMMM dd, yyyy')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Job Order Details */}
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
            Associated Job Order Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Service Date
              </Typography>
              <Typography variant="body1">
                {format(jobOrder.dateTime, 'MMMM dd, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">{jobOrder.location}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Assigned To
              </Typography>
              <Typography variant="body1">{jobOrder.assignedToName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Job Status
              </Typography>
              {getStatusChip(jobOrder.status)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Proof of Payment */}
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
            Proof of Payment
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {payment.proofOfPayment ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <DocumentIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={500}>
                  {payment.proofOfPayment}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click to view or download
                </Typography>
              </Box>
              <Button variant="outlined" component={Link} href="#" target="_blank">
                View Document
              </Button>
            </Box>
          ) : (
            <Alert severity="warning">No proof of payment uploaded</Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Once confirmed, the job order status will be updated to "Paid" and the certificate will be issued to the client.
          </Alert>
          
          {certificateGenerated && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Certificate generated: <strong>{certificateGenerated}</strong>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<RejectIcon />}
              onClick={() => setRejectDialogOpen(true)}
              disabled={isProcessing || payment?.status !== 'Pending'}
              sx={{ px: 3 }}
            >
              Reject Payment
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <ConfirmIcon />}
              onClick={handleConfirm}
              disabled={isProcessing || payment?.status !== 'Pending'}
              sx={{
                px: 4,
                background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0a3e4e 0%, #61a270 100%)',
                },
              }}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this payment. The client and GM will be notified.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error" disabled={isProcessing}>
            Reject Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

