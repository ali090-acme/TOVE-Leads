import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import {
  Business as BankIcon,
  CreditCard as CardIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bank',
    title: 'Bank Transfer',
    description: 'Direct bank transfer instructions',
    icon: <BankIcon />,
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    description: 'Pay via card (Stripe, PayPal)',
    icon: <CardIcon />,
  },
];

const bankDetails = {
  bankName: 'Emirates NBD',
  accountName: 'TOVE Leeds Training Center',
  accountNumber: '1234567890',
  iban: 'AE123456789012345678901',
  swiftCode: 'EBILAEAD',
};

export const PaymentMethods: React.FC = () => {
  const navigate = useNavigate();
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleMethodSelect = (methodId: string) => {
    if (methodId === 'card') {
      // Navigate to payment processing page
      navigate('/client/payment/process');
    } else if (methodId === 'bank') {
      setShowBankDetails(true);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Payment Methods
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose your preferred payment method
        </Typography>
      </Box>

      {/* Payment Methods Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {paymentMethods.map((method) => (
          <Grid item xs={12} md={6} key={method.id}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleMethodSelect(method.id)}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  color: 'white',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {React.cloneElement(method.icon, { sx: { fontSize: 32, color: 'white' } })}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {method.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {method.description}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Info Section */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <InfoIcon sx={{ color: 'info.main', mt: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            All payments are processed securely. Receipts will be generated automatically.
          </Typography>
        </CardContent>
      </Card>

      {/* Bank Transfer Details Dialog */}
      <Dialog
        open={showBankDetails}
        onClose={() => setShowBankDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Bank Transfer Details
          </Typography>
          <IconButton onClick={() => setShowBankDetails(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Bank Name
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {bankDetails.bankName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(bankDetails.bankName, 'Bank Name')}
                        sx={{ color: 'primary.main' }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Account Name
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {bankDetails.accountName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(bankDetails.accountName, 'Account Name')}
                        sx={{ color: 'primary.main' }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Account Number
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {bankDetails.accountNumber}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(bankDetails.accountNumber, 'Account Number')}
                        sx={{ color: 'primary.main' }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      IBAN
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {bankDetails.iban}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(bankDetails.iban, 'IBAN')}
                        sx={{ color: 'primary.main' }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      SWIFT Code
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {bankDetails.swiftCode}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(bankDetails.swiftCode, 'SWIFT Code')}
                        sx={{ color: 'primary.main' }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Instructions:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>Transfer the payment amount to the above bank account</li>
                <li>Include your Certificate ID in the transfer reference</li>
                <li>Send the transfer receipt to support@toveleeds.com</li>
                <li>Your payment will be processed within 1-2 business days</li>
              </ol>
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowBankDetails(false)} variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

