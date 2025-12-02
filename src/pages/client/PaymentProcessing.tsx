import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Lock as LockIcon,
  Shield as ShieldIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';

export const PaymentProcessing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { payments, jobOrders } = useAppContext();
  
  // Get payment details from location state
  const paymentData = location.state || {};
  const paymentId = paymentData.paymentId;
  const amount = paymentData.amount || 400;
  const serviceName = paymentData.service || 'Service Payment';

  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // Format card number
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      if (value.length > 5) return;
    }
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }

    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
    setPaymentError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }

    if (!formData.expiryDate.trim() || formData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Valid expiry date is required (MM/YY)';
    }

    if (!formData.cvv.trim() || formData.cvv.length < 3) {
      newErrors.cvv = 'Valid CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    // Simulate payment processing
    setTimeout(() => {
      // Simulate 10% failure rate for prototype
      const isSuccess = Math.random() > 0.1;

      setIsProcessing(false);

      if (isSuccess) {
        // Navigate to payment history or success page
        navigate('/client/payment/history', {
          state: {
            success: true,
            message: `Your payment of ${amount} AED for ${serviceName} has been processed successfully.`,
          },
        });
      } else {
        setPaymentError('Payment failed. Please check your card details and try again.');
      }
    }, 2000);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/client/payment/methods')}
          sx={{ mb: 2 }}
        >
          Back to Payment Methods
        </Button>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Payment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {serviceName}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Payment Summary
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Service
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {serviceName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Amount
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {amount} AED
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Security Note */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <ShieldIcon sx={{ color: 'success.main', mt: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Your payment is secure and encrypted. We use industry-standard SSL encryption to protect your information.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Payment Form */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Card Details
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    placeholder="John Doe"
                    error={!!errors.cardholderName}
                    helperText={errors.cardholderName}
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    disabled={isProcessing}
                    inputProps={{ maxLength: 19 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate}
                    disabled={isProcessing}
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    type="password"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    error={!!errors.cvv}
                    helperText={errors.cvv}
                    disabled={isProcessing}
                    inputProps={{ maxLength: 3 }}
                  />
                </Grid>
              </Grid>

              {/* Payment Error */}
              {paymentError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {paymentError}
                </Alert>
              )}

              {/* Payment Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                onClick={handlePayment}
                disabled={isProcessing}
                sx={{
                  mt: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #229954 0%, #27ae60 100%)',
                  },
                }}
              >
                {isProcessing ? 'Processing...' : `Pay ${amount} AED`}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

