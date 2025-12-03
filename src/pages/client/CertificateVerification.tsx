import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  CheckCircle as ValidIcon,
  Error as InvalidIcon,
  Search as SearchIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { Certificate } from '@/types';
import { QRScanner } from '@/components/common/QRScanner';
import { exportCertificateAsPDF, exportCertificateAsImage } from '@/utils/certificateExport';
import { useNavigate } from 'react-router-dom';
import { parseVerificationInput } from '@/utils/verificationParser';

export const CertificateVerification: React.FC = () => {
  const navigate = useNavigate();
  const { verifyCertificate, certificates } = useAppContext();
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    certificate?: Certificate;
    message: string;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<HTMLElement | null>(null);
  const [parsedCode, setParsedCode] = useState<ReturnType<typeof parseVerificationInput> | null>(null);

  const handleVerify = async () => {
    if (!certificateNumber.trim()) {
      setVerificationResult({
        valid: false,
        message: 'Please enter a certificate number or verification code',
      });
      setShowResult(true);
      return;
    }

      setIsVerifying(true);
      setShowResult(false);

      // Parse verification input
      const parsed = parseVerificationInput(certificateNumber.trim());
      setParsedCode(parsed);

      // Simulate API call delay for realistic UX
      setTimeout(() => {
        const certificate = verifyCertificate(certificateNumber.trim());
        const verificationMethod = qrScannerOpen ? 'QR Code' : parsed.type === 'three-part-code' ? 'Three-Part Code' : 'Manual Entry';

        if (certificate) {
          const isExpired = certificate.status === 'Expired';
          const daysUntilExpiry = Math.floor(
            (certificate.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          let message = 'Certificate is valid';
          if (isExpired) {
            message = `Certificate expired on ${format(certificate.expiryDate, 'MMM dd, yyyy')}`;
          } else if (daysUntilExpiry <= 30) {
            message = `Certificate is valid but expires in ${daysUntilExpiry} days`;
          }

          setVerificationResult({
            valid: !isExpired,
            certificate: certificate,
            message: message,
          });

          // Save to verification history
          const history = JSON.parse(localStorage.getItem('verification-history') || '[]');
          const newRecord = {
            id: `v-${Date.now()}`,
            certificateNumber: certificate.certificateNumber,
            certificateId: certificate.id,
            verifiedAt: new Date().toISOString(),
            status: isExpired ? 'Expired' : 'Valid',
            method: verificationMethod,
            verifiedBy: 'Current User', // In real app, get from auth context
          };
          history.unshift(newRecord);
          localStorage.setItem('verification-history', JSON.stringify(history.slice(0, 100))); // Keep last 100 records
        } else {
          setVerificationResult({
            valid: false,
            message: 'Certificate not found. Please verify the certificate number and try again.',
          });

          // Save failed verification to history
          const history = JSON.parse(localStorage.getItem('verification-history') || '[]');
          const newRecord = {
            id: `v-${Date.now()}`,
            certificateNumber: certificateNumber.trim(),
            verifiedAt: new Date().toISOString(),
            status: 'Invalid',
            method: verificationMethod,
            verifiedBy: 'Current User',
          };
          history.unshift(newRecord);
          localStorage.setItem('verification-history', JSON.stringify(history.slice(0, 100)));
        }
        
        setShowResult(true);
        setIsVerifying(false);
        setQrScannerOpen(false);
      }, 1000);
  };

  const handleScan = () => {
    setQrScannerOpen(true);
  };

  const handleQRScanSuccess = (decodedText: string) => {
    // Set the scanned text as certificate number
    setCertificateNumber(decodedText);
    setShowResult(false);
    // Automatically verify after scanning (using the decoded text directly)
    setIsVerifying(true);
    setTimeout(() => {
      const certificate = verifyCertificate(decodedText.trim());
      if (certificate) {
        const isExpired = certificate.status === 'Expired';
        const daysUntilExpiry = Math.floor(
          (certificate.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        let message = 'Certificate is valid';
        if (isExpired) {
          message = `Certificate expired on ${format(certificate.expiryDate, 'MMM dd, yyyy')}`;
        } else if (daysUntilExpiry <= 30) {
          message = `Certificate is valid but expires in ${daysUntilExpiry} days`;
        }
        setVerificationResult({
          valid: !isExpired,
          certificate: certificate,
          message: message,
        });

        // Save to verification history
        const history = JSON.parse(localStorage.getItem('verification-history') || '[]');
        const newRecord = {
          id: `v-${Date.now()}`,
          certificateNumber: certificate.certificateNumber,
          certificateId: certificate.id,
          verifiedAt: new Date().toISOString(),
          status: isExpired ? 'Expired' : 'Valid',
          method: 'QR Code',
          verifiedBy: 'Current User',
        };
        history.unshift(newRecord);
        localStorage.setItem('verification-history', JSON.stringify(history.slice(0, 100)));
      } else {
        setVerificationResult({
          valid: false,
          message: 'Certificate not found. Please verify the certificate number and try again.',
        });

        // Save failed verification to history
        const history = JSON.parse(localStorage.getItem('verification-history') || '[]');
        const newRecord = {
          id: `v-${Date.now()}`,
          certificateNumber: decodedText.trim(),
          verifiedAt: new Date().toISOString(),
          status: 'Invalid',
          method: 'QR Code',
          verifiedBy: 'Current User',
        };
        history.unshift(newRecord);
        localStorage.setItem('verification-history', JSON.stringify(history.slice(0, 100)));
      }
      setShowResult(true);
      setIsVerifying(false);
      setQrScannerOpen(false);
    }, 1000);
  };

  const handleQRScanError = (error: string) => {
    console.error('QR Scan Error:', error);
    // Error is handled by QRScanner component
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Certificate Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verify the authenticity and validity of certificates using QR code scanning or manual entry
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Verify Certificate
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Enter certificate details or scan QR code to verify authenticity
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <TextField
                fullWidth
                label="Certificate Number or Verification Code"
                placeholder="e.g., CERT-2025-001 or VER-001-STK-001-CERT-001"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVerify();
                  }
                }}
                disabled={isVerifying}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={isVerifying ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  onClick={handleVerify}
                  disabled={isVerifying || !certificateNumber.trim()}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                    },
                  }}
                >
                  {isVerifying ? 'Verifying...' : 'Verify Certificate'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<QrIcon />}
                  onClick={handleScan}
                  sx={{ py: 1.5 }}
                >
                  Scan QR Code
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<QrIcon />}
                  onClick={() => navigate('/client/verify/bulk')}
                  sx={{
                    py: 1.5,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  Bulk Verification
                </Button>
              </Stack>

              {/* Demo helper */}
              <Paper sx={{ mt: 4, p: 2.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
                  Quick Test:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                  {certificates.slice(0, 3).map((cert) => (
                    <Chip
                      key={cert.id}
                      label={cert.certificateNumber}
                      onClick={() => {
                        setCertificateNumber(cert.certificateNumber);
                        setShowResult(false);
                      }}
                      disabled={isVerifying}
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Verification Result */}
        {showResult && (
          <Grid item xs={12} md={8} lg={6}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  background: verificationResult?.valid
                    ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                    : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                  color: 'white',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {verificationResult?.valid ? (
                    <ValidIcon sx={{ fontSize: 48 }} />
                  ) : (
                    <InvalidIcon sx={{ fontSize: 48 }} />
                  )}
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {verificationResult?.valid ? 'Certificate Verified' : 'Verification Failed'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                      {verificationResult?.message || 'Verification failed'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {verificationResult?.certificate && (
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Certificate Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {verificationResult.valid && (
                        <IconButton
                          size="small"
                          onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'primary.light', color: 'white' },
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                      <Chip
                        label={verificationResult.certificate.status}
                        color={verificationResult.valid ? 'success' : 'error'}
                        icon={<SecurityIcon />}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AssignmentIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Certificate Number
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {verificationResult.certificate.certificateNumber}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Client Name
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {verificationResult.certificate.clientName}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AssignmentIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Service Type
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {verificationResult.certificate.serviceType}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Issue Date
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {format(verificationResult.certificate.issueDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Expiry Date
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color={verificationResult.valid ? 'text.primary' : 'error.main'}
                        >
                          {format(verificationResult.certificate.expiryDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SecurityIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Verification Code
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                          {verificationResult.certificate.verificationCode}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {!verificationResult.valid && (
                    <Box sx={{ mt: 4 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        href="/client/renewal"
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                          },
                        }}
                      >
                        Renew This Certificate
                      </Button>
                    </Box>
                  )}
                </CardContent>
              )}
            </Card>
          </Grid>
        )}
      </Grid>

      {/* QR Scanner Dialog */}
      <QRScanner
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        onScanError={handleQRScanError}
      />

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={!!downloadMenuAnchor}
        onClose={() => setDownloadMenuAnchor(null)}
      >
        <MenuItem
          onClick={async () => {
            if (verificationResult?.certificate) {
              await exportCertificateAsPDF(verificationResult.certificate);
              setDownloadMenuAnchor(null);
            }
          }}
        >
          <PdfIcon sx={{ mr: 1, fontSize: 20 }} />
          Download as PDF
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (verificationResult?.certificate) {
              await exportCertificateAsImage(verificationResult.certificate);
              setDownloadMenuAnchor(null);
            }
          }}
        >
          <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
          Download as Image
        </MenuItem>
      </Menu>
    </Box>
  );
};

