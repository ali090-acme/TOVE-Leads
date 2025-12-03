import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  QrCodeScanner as QrIcon,
  CheckCircle as ValidIcon,
  Cancel as InvalidIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { extractCertificateNumber } from '@/utils/verificationParser';

interface BulkVerificationItem {
  id: string;
  certificateNumber: string;
  verificationCode?: string;
  status: 'Pending' | 'Valid' | 'Invalid' | 'Expired';
  verifiedAt?: Date;
}

export const BulkVerification: React.FC = () => {
  const navigate = useNavigate();
  const { certificates } = useAppContext();
  const [verificationItems, setVerificationItems] = useState<BulkVerificationItem[]>([]);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAddItem = () => {
    if (!certificateNumber.trim()) {
      setSnackbar({ open: true, message: 'Please enter a certificate number', severity: 'error' });
      return;
    }

    const newItem: BulkVerificationItem = {
      id: Date.now().toString(),
      certificateNumber: certificateNumber.trim(),
      verificationCode: verificationCode.trim() || undefined,
      status: 'Pending',
    };

    setVerificationItems([...verificationItems, newItem]);
    setCertificateNumber('');
    setVerificationCode('');
  };

  const handleVerifyItem = (itemId: string) => {
    const item = verificationItems.find((i) => i.id === itemId);
    if (!item) return;

    // Extract certificate number if it's a three-part code
    const certNumber = extractCertificateNumber(item.certificateNumber) || item.certificateNumber;
    
    // Find certificate
    const certificate = certificates.find(
      (cert) =>
        (cert.certificateNumber === certNumber || cert.certificateNumber === item.certificateNumber) &&
        (!item.verificationCode || 
         cert.verificationCode === item.verificationCode ||
         cert.verificationCode === item.certificateNumber)
    );

    if (!certificate) {
      const updatedItems = verificationItems.map((i) =>
        i.id === itemId ? { ...i, status: 'Invalid' as const, verifiedAt: new Date() } : i
      );
      setVerificationItems(updatedItems);
      return;
    }

    // Check expiry
    const isExpired = new Date(certificate.expiryDate) < new Date();
    const status = isExpired ? ('Expired' as const) : ('Valid' as const);

    const updatedItems = verificationItems.map((i) =>
      i.id === itemId ? { ...i, status, verifiedAt: new Date() } : i
    );
    setVerificationItems(updatedItems);

    // Save to verification history
    const history = JSON.parse(localStorage.getItem('verification-history') || '[]');
    history.unshift({
      id: Date.now().toString(),
      certificateNumber: item.certificateNumber,
      certificate,
      verifiedAt: new Date().toISOString(),
      status,
      method: item.verificationCode ? 'Manual Entry' : 'QR Code',
    });
    localStorage.setItem('verification-history', JSON.stringify(history.slice(0, 100)));
  };

  const handleVerifyAll = () => {
    const pendingItems = verificationItems.filter((item) => item.status === 'Pending');
    pendingItems.forEach((item) => handleVerifyItem(item.id));
    setSnackbar({
      open: true,
      message: `Verified ${pendingItems.length} certificate(s)`,
      severity: 'success',
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setVerificationItems(verificationItems.filter((i) => i.id !== itemId));
  };

  const handleClearAll = () => {
    setVerificationItems([]);
  };

  const pendingCount = verificationItems.filter((i) => i.status === 'Pending').length;
  const validCount = verificationItems.filter((i) => i.status === 'Valid').length;
  const invalidCount = verificationItems.filter((i) => i.status === 'Invalid').length;
  const expiredCount = verificationItems.filter((i) => i.status === 'Expired').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/client/verify')} sx={{ mb: 2 }}>
          Back to Verification
        </Button>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
          Bulk Certificate Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verify multiple certificates at once using certificate numbers and verification codes
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'warning.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="warning.dark">
                {pendingCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'success.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="success.dark">
                {validCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Valid
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'error.light', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="error.dark">
                {invalidCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Invalid
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'grey.300', p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="text.secondary">
                {expiredCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expired
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Add Certificate Form */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Add Certificate for Verification
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Certificate Number"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="Enter certificate number"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Verification Code (Optional)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{
                  background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #218838 0%, #1e7e34 100%)',
                  },
                  py: 1.5,
                }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Verification List */}
      {verificationItems.length > 0 ? (
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
            <Typography variant="h6" fontWeight={600}>
              Verification Queue ({verificationItems.length} certificates)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {pendingCount > 0 && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleVerifyAll}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  }}
                >
                  Verify All
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearAll}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Certificate Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Verification Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Verified At</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verificationItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.certificateNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.verificationCode || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.status === 'Pending' && (
                        <Chip label="Pending" size="small" sx={{ bgcolor: 'warning.light', color: 'warning.dark' }} />
                      )}
                      {item.status === 'Valid' && (
                        <Chip
                          icon={<ValidIcon />}
                          label="Valid"
                          size="small"
                          sx={{ bgcolor: 'success.light', color: 'success.dark' }}
                        />
                      )}
                      {item.status === 'Invalid' && (
                        <Chip
                          icon={<InvalidIcon />}
                          label="Invalid"
                          size="small"
                          sx={{ bgcolor: 'error.light', color: 'error.dark' }}
                        />
                      )}
                      {item.status === 'Expired' && (
                        <Chip label="Expired" size="small" sx={{ bgcolor: 'grey.300', color: 'text.secondary' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {item.verifiedAt ? format(new Date(item.verifiedAt), 'MMM dd, yyyy HH:mm') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {item.status === 'Pending' && (
                          <IconButton
                            size="small"
                            onClick={() => handleVerifyItem(item.id)}
                            sx={{ color: 'primary.main' }}
                          >
                            <QrIcon />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleRemoveItem(item.id)} sx={{ color: 'error.main' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <QrIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No certificates added
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add certificate numbers above to start bulk verification
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

