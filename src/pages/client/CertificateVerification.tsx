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
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  CheckCircle as ValidIcon,
  Error as InvalidIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { Certificate } from '@/types';

export const CertificateVerification: React.FC = () => {
  const { verifyCertificate, certificates } = useAppContext();
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    certificate?: Certificate;
    message: string;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

    // Simulate API call delay for realistic UX
    setTimeout(() => {
      const certificate = verifyCertificate(certificateNumber.trim());

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
      } else {
        setVerificationResult({
          valid: false,
          message: 'Certificate not found. Please verify the certificate number and try again.',
        });
      }
      
      setShowResult(true);
      setIsVerifying(false);
    }, 1000);
  };

  const handleScan = () => {
    // In a real app, this would trigger QR code scanner
    alert('QR Code scanner would open here (camera access required)');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Certificate Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Verify the authenticity and validity of a certificate
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Enter Certificate Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the certificate number or verification code to check its validity
              </Typography>

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
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={isVerifying ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  onClick={handleVerify}
                  disabled={isVerifying || !certificateNumber.trim()}
                >
                  {isVerifying ? 'Verifying...' : 'Verify Certificate'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<QrIcon />}
                  onClick={handleScan}
                >
                  Scan QR Code
                </Button>
              </Box>

              {/* Demo helper */}
              <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Try these sample certificate numbers:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {certificates.slice(0, 3).map((cert) => (
                    <Button
                      key={cert.id}
                      size="small"
                      variant="text"
                      onClick={() => {
                        setCertificateNumber(cert.certificateNumber);
                        setShowResult(false);
                      }}
                      disabled={isVerifying}
                    >
                      {cert.certificateNumber}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Verification Result */}
        {showResult && (
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {verificationResult?.valid ? (
                    <>
                      <ValidIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body1" fontWeight={500}>
                          {verificationResult.message}
                        </Typography>
                      </Alert>
                    </>
                  ) : (
                    <>
                      <InvalidIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body1" fontWeight={500}>
                          {verificationResult?.message || 'Verification failed'}
                        </Typography>
                      </Alert>
                    </>
                  )}
                </Box>

                {verificationResult?.certificate && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Certificate Details
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Certificate Number
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {verificationResult.certificate.certificateNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Client Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {verificationResult.certificate.clientName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Service Type
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {verificationResult.certificate.serviceType}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Issue Date
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {format(verificationResult.certificate.issueDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Expiry Date
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {format(verificationResult.certificate.expiryDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Verification Status
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          color={verificationResult.valid ? 'success.main' : 'error.main'}
                        >
                          {verificationResult.certificate.status}
                        </Typography>
                      </Grid>
                    </Grid>

                    {!verificationResult.valid && (
                      <Box sx={{ mt: 3 }}>
                        <Button variant="contained" fullWidth href="/client/renewal">
                          Renew This Certificate
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

