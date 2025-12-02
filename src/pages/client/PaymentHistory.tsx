import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';

export const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { payments, jobOrders, currentUser } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Show success message if redirected from payment processing
  useEffect(() => {
    if (location.state?.success) {
      setSnackbar({
        open: true,
        message: location.state.message || 'Payment processed successfully!',
        severity: 'success',
      });
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = searchQuery.trim() === '' ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.jobOrderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
      (filter === 'completed' && payment.status === 'Confirmed') ||
      (filter === 'pending' && payment.status === 'Pending') ||
      (filter === 'failed' && payment.status === 'Failed');

    return matchesSearch && matchesFilter;
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Chip label="Completed" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'Pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'Failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleViewReceipt = (paymentId: string) => {
    navigate(`/client/payment/receipt/${paymentId}`);
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      setSnackbar({
        open: true,
        message: 'Receipt not found',
        severity: 'error',
      });
      return;
    }

    try {
      const doc = new (await import('jspdf')).default();
      const receiptNumber = `REC-${new Date(payment.createdAt).getFullYear()}-${String(payment.id).slice(-3).padStart(3, '0')}`;
      const transactionId = `TXN-${payment.id}`;
      const jobOrder = jobOrders.find(jo => jo.id === payment.jobOrderId);
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(30, 60, 114);
      doc.text('TOVE', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Leeds', 105, 27, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('PAYMENT RECEIPT', 105, 35, { align: 'center' });
      
      let y = 45;
      
      // Receipt Number
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Receipt Number', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(receiptNumber, 20, y + 7);
      y += 15;
      
      // Transaction ID
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Transaction ID', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(transactionId, 20, y + 7);
      y += 15;
      
      doc.line(20, y, 190, y);
      y += 10;
      
      // Customer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Customer Name', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(currentUser?.name || 'N/A', 20, y + 7);
      y += 15;
      
      doc.line(20, y, 190, y);
      y += 10;
      
      // Service
      if (jobOrder) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Service', 20, y);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(jobOrder.serviceType, 20, y + 7);
        y += 15;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Location', 20, y);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(jobOrder.location, 20, y + 7);
        y += 15;
      }
      
      doc.line(20, y, 190, y);
      y += 10;
      
      // Payment Method
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Payment Method', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(payment.method, 20, y + 7);
      y += 15;
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Date & Time', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(format(payment.createdAt, 'MMM dd, yyyy HH:mm'), 20, y + 7);
      y += 15;
      
      doc.line(20, y, 190, y);
      y += 10;
      
      // Amount
      doc.setFontSize(12);
      doc.text('Total Amount', 20, y);
      doc.setFontSize(20);
      doc.setTextColor(30, 60, 114);
      doc.text(`$${payment.amount}`, 190, y, { align: 'right' });
      y += 15;
      
      doc.line(20, y, 190, y);
      y += 10;
      
      // Status
      doc.setFontSize(10);
      if (payment.status === 'Confirmed') {
        doc.setTextColor(46, 125, 50);
        doc.text('✓ Completed', 20, y);
      } else if (payment.status === 'Pending') {
        doc.setTextColor(255, 152, 0);
        doc.text('⏳ Pending', 20, y);
      } else if (payment.status === 'Failed') {
        doc.setTextColor(211, 47, 47);
        doc.text('✗ Failed', 20, y);
      }
      y += 15;
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated receipt. No signature required.', 105, 250, { align: 'center' });
      doc.text('For support, contact: support@toveleeds.com', 105, 257, { align: 'center' });
      
      doc.save(`Receipt-${receiptNumber}.pdf`);
      
      setSnackbar({
        open: true,
        message: 'Receipt downloaded successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download receipt',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Payment History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your payment history and download receipts
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by Payment ID or Job Order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="All"
                  onClick={() => setFilter('all')}
                  color={filter === 'all' ? 'primary' : 'default'}
                  icon={<FilterIcon />}
                />
                <Chip
                  label="Completed"
                  onClick={() => setFilter('completed')}
                  color={filter === 'completed' ? 'primary' : 'default'}
                />
                <Chip
                  label="Pending"
                  onClick={() => setFilter('pending')}
                  color={filter === 'pending' ? 'primary' : 'default'}
                />
                <Chip
                  label="Failed"
                  onClick={() => setFilter('failed')}
                  color={filter === 'failed' ? 'primary' : 'default'}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment List */}
      {filteredPayments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredPayments.map((payment) => {
            const jobOrder = jobOrders.find(jo => jo.id === payment.jobOrderId);
            return (
              <Grid item xs={12} key={payment.id}>
                <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ReceiptIcon />
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Payment #{payment.id}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {format(payment.createdAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                    {getStatusChip(payment.status)}
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Job Order
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.jobOrderId}
                        </Typography>
                        {jobOrder && (
                          <Typography variant="body2" color="text.secondary">
                            {jobOrder.serviceType} - {jobOrder.location}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Amount
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                          ${payment.amount}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Payment Method
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.method}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ReceiptIcon />}
                        onClick={() => handleViewReceipt(payment.id)}
                      >
                        View Receipt
                      </Button>
                      {(payment.status === 'Confirmed' || payment.status === 'Pending') && (
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadReceipt(payment.id)}
                          sx={{
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                            },
                          }}
                        >
                          Download Receipt
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No payments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Your payment history will appear here once you make a payment'}
            </Typography>
          </CardContent>
        </Card>
      )}

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

