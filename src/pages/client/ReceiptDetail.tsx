import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

export const ReceiptDetail: React.FC = () => {
  const { receiptId } = useParams<{ receiptId: string }>();
  const navigate = useNavigate();
  const { payments, jobOrders, currentUser, clients } = useAppContext();

  const payment = payments.find(p => p.id === receiptId);
  const jobOrder = payment ? jobOrders.find(jo => jo.id === payment.jobOrderId) : null;
  const client = currentUser ? clients.find(c => c.id === currentUser.id) : null;

  if (!payment) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Receipt not found
        </Typography>
        <Button onClick={() => navigate('/client/payment/history')}>
          Back to Payment History
        </Button>
      </Box>
    );
  }

  // Generate receipt number
  const receiptNumber = `REC-${new Date(payment.createdAt).getFullYear()}-${String(payment.id).slice(-3).padStart(3, '0')}`;
  const transactionId = `TXN-${payment.id}`;

  // Convert amount to words (simplified)
  const amountInWords = (amount: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (amount === 0) return 'Zero';
    if (amount < 10) return ones[amount];
    if (amount < 20) return teens[amount - 10];
    if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 !== 0 ? ' ' + ones[amount % 10] : '');
    if (amount < 1000) {
      const hundreds = Math.floor(amount / 100);
      const remainder = amount % 100;
      return ones[hundreds] + ' Hundred' + (remainder !== 0 ? ' ' + amountInWords(remainder) : '');
    }
    return amount.toString();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
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
    
    // Line
    doc.line(20, y, 190, y);
    y += 10;
    
    // Customer Information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Customer Name', 20, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(currentUser?.name || 'N/A', 20, y + 7);
    y += 15;
    
    if (client?.phone) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Contact', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(client.phone, 20, y + 7);
      y += 15;
    }
    
    // Line
    doc.line(20, y, 190, y);
    y += 10;
    
    // Service Details
    if (jobOrder) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Service', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(jobOrder.serviceTypes?.join(', ') || 'N/A', 20, y + 7);
      y += 15;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Location', 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(jobOrder.location, 20, y + 7);
      y += 15;
    }
    
    // Line
    doc.line(20, y, 190, y);
    y += 10;
    
    // Payment Details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Payment Method', 20, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(payment.method, 20, y + 7);
    y += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Date & Time', 20, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(format(payment.createdAt, 'MMM dd, yyyy HH:mm'), 20, y + 7);
    y += 15;
    
    // Line
    doc.line(20, y, 190, y);
    y += 10;
    
    // Amount Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Total Amount', 20, y);
    doc.setFontSize(20);
    doc.setTextColor(30, 60, 114);
    doc.text(`$${payment.amount}`, 190, y, { align: 'right' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${amountInWords(payment.amount)} Dirhams Only`, 20, y, { align: 'center' });
    y += 15;
    
    // Line
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
    
    // Save PDF
    doc.save(`Receipt-${receiptNumber}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receiptNumber}`,
          text: `Receipt ${receiptNumber}\nService: ${jobOrder?.serviceTypes?.join(', ') || 'N/A'}\nAmount: $${payment.amount}\nDate: ${format(payment.createdAt, 'MMM dd, yyyy')}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Receipt ${receiptNumber}\nService: ${jobOrder?.serviceTypes?.join(', ') || 'N/A'}\nAmount: $${payment.amount}\nDate: ${format(payment.createdAt, 'MMM dd, yyyy')}`;
      navigator.clipboard.writeText(text);
      alert('Receipt details copied to clipboard');
    }
  };

  const handleEmailReceipt = () => {
    alert(`Receipt will be emailed to ${currentUser?.email || 'your registered email address'}`);
  };

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/client/payment/history')}
        sx={{ mb: 3 }}
      >
        Back to Payment History
      </Button>

      {/* Receipt Card */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
            borderBottom: '3px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="h3" fontWeight={700} letterSpacing={2} gutterBottom>
            TOVE
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Leeds
          </Typography>
          <Typography variant="h5" fontWeight={700} letterSpacing={1}>
            PAYMENT RECEIPT
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Receipt Number */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Receipt Number
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {receiptNumber}
            </Typography>
          </Box>

          {/* Transaction ID */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Transaction ID
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {transactionId}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Customer Name
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {currentUser?.name || 'N/A'}
            </Typography>
          </Box>

          {client?.phone && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Contact
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {client.phone}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Service Details */}
          {jobOrder && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Service
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {jobOrder.serviceTypes?.map((type) => (
                    <Chip key={type} label={type} size="small" color="primary" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Location
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {jobOrder.location}
                </Typography>
              </Box>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Payment Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Payment Method
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {payment.method}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Date & Time
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {format(payment.createdAt, 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Amount Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'action.hover',
              borderRadius: 2,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total Amount
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
              ${payment.amount}
            </Typography>
          </Paper>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {amountInWords(payment.amount)} Dirhams Only
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Status */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {payment.status === 'Confirmed' ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Completed"
                sx={{
                  px: 2,
                  py: 3,
                  bgcolor: '#1e3c72',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                }}
              />
            ) : payment.status === 'Pending' ? (
              <Chip
                label="Pending"
                sx={{
                  px: 2,
                  py: 3,
                  bgcolor: '#3498db',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            ) : payment.status === 'Failed' ? (
              <Chip
                label="Failed"
                color="error"
                sx={{ px: 2, py: 3, fontWeight: 600 }}
              />
            ) : (
              <Chip
                label={payment.status}
                sx={{ px: 2, py: 3 }}
              />
            )}
          </Box>
        </CardContent>

        {/* Footer */}
        <Box sx={{ p: 3, bgcolor: 'action.hover', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            This is a computer-generated receipt. No signature required.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            For support, contact: support@toveleeds.com
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            fullWidth
          >
            Share
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleDownloadPDF}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
              },
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleEmailReceipt}
            fullWidth
          >
            Email Receipt
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

