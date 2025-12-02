import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  Avatar,
  Stack,
  Snackbar,
  Menu,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { Certificate } from '@/types';
import { format, differenceInDays, isPast } from 'date-fns';
import { exportCertificateAsPDF, exportCertificateAsImage } from '@/utils/certificateExport';

const steps = ['Select Certificate', 'Upload Documents', 'Review & Submit'];

export const CertificateRenewal: React.FC = () => {
  const { certificates, currentUser, renewCertificate } = useAppContext();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<HTMLElement | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  // Filter certificates for current client
  const clientCertificates = useMemo(() => {
    if (!currentUser) return certificates;
    return certificates.filter((cert) => cert.clientId === currentUser.id);
  }, [certificates, currentUser]);

  // Check renewal eligibility (mock CPD check)
  const checkRenewalEligibility = (cert: Certificate) => {
    const daysUntilExpiry = differenceInDays(cert.expiryDate, new Date());
    const isExpired = isPast(cert.expiryDate);
    
    // Mock CPD completion check (in real app, this would check actual CPD data)
    const cpdCompleted = Math.random() > 0.3; // 70% chance of completion for demo
    
    return {
      isEligible: (isExpired || daysUntilExpiry <= 90) && cpdCompleted,
      isExpired,
      daysUntilExpiry,
      cpdCompleted,
      message: isExpired
        ? 'Certificate has expired'
        : daysUntilExpiry <= 90
        ? `Expires in ${daysUntilExpiry} days`
        : 'Not yet eligible for renewal',
    };
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCertificate) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const success = renewCertificate(selectedCertificate, uploadedFiles, notes);
      
      if (success) {
        setSnackbar({
          open: true,
          message: 'Renewal request submitted successfully! You will receive a confirmation email shortly.',
          severity: 'success',
        });
        // Reset form
        setTimeout(() => {
          setActiveStep(0);
          setSelectedCertificate('');
          setUploadedFiles([]);
          setNotes('');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to submit renewal request. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCert = clientCertificates.find((c) => c.id === selectedCertificate);
  const eligibility = selectedCert ? checkRenewalEligibility(selectedCert) : null;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Certificate Renewal Request
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request renewal for your expiring or expired certificates
        </Typography>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Select Certificate */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Certificate to Renew
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the certificate you want to renew from your active certificates
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Certificate</InputLabel>
                <Select
                  value={selectedCertificate}
                  label="Certificate"
                  onChange={(e) => setSelectedCertificate(e.target.value)}
                >
                  {clientCertificates.map((cert) => {
                    const certEligibility = checkRenewalEligibility(cert);
                    return (
                      <MenuItem key={cert.id} value={cert.id}>
                        {cert.certificateNumber} - {cert.serviceType} 
                        {' '}(Expires: {format(cert.expiryDate, 'MMM dd, yyyy')})
                        {certEligibility.isEligible && ' ✓ Eligible'}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {selectedCert && eligibility && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                    <Box>
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {selectedCert.certificateNumber}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {selectedCert.serviceType}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      <Chip
                        label={eligibility.isExpired ? 'Expired' : eligibility.daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Active'}
                        color={eligibility.isExpired ? 'error' : eligibility.daysUntilExpiry <= 30 ? 'warning' : 'success'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Issue Date
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {format(selectedCert.issueDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Expiry Date
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {format(selectedCert.expiryDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* CPD Status */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body1" fontWeight={600}>
                        CPD Completion Status
                      </Typography>
                      <Chip
                        icon={eligibility.cpdCompleted ? <CheckIcon /> : <WarningIcon />}
                        label={eligibility.cpdCompleted ? 'Completed' : 'Incomplete'}
                        color={eligibility.cpdCompleted ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={eligibility.cpdCompleted ? 100 : 65}
                      sx={{ height: 10, borderRadius: 2 }}
                      color={eligibility.cpdCompleted ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {eligibility.cpdCompleted ? '100% Complete' : '65% Complete - Complete CPD activities to proceed'}
                    </Typography>
                  </Box>

                  {/* Eligibility Alert */}
                  {eligibility.isEligible ? (
                    <Alert severity="success" icon={<CheckIcon />} sx={{ borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        This certificate is eligible for renewal. You can proceed with the renewal process.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {eligibility.cpdCompleted
                          ? eligibility.message
                          : 'CPD requirements not completed. Please complete required CPD activities before renewing.'}
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              )}
            </Box>
          )}

          {/* Step 2: Upload Documents */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Required Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please upload proof of payment and any other required documents
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  mb: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    borderColor: 'primary.dark',
                  },
                }}
                component="label"
              >
                <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Drag and drop files here or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: PDF, JPG, PNG (Max 10MB per file)
                </Typography>
              </Paper>

              {uploadedFiles.length > 0 && (
                <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {uploadedFiles.length} file(s) uploaded successfully
                  </Typography>
                </Alert>
              )}

              {uploadedFiles.length > 0 && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Uploaded Files:
                  </Typography>
                  <List>
                    {uploadedFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Notes (Optional)"
                placeholder="Add any additional information or special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {/* Step 3: Review & Submit */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Renewal Request
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review the details before submitting your renewal request
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Certificate Details
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedCert?.certificateNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCert?.serviceType} • Expires: {selectedCert && format(selectedCert.expiryDate, 'MMM dd, yyyy')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Uploaded Documents
                      </Typography>
                      <List dense>
                        {uploadedFiles.map((file, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={file.name} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {notes && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Additional Notes
                        </Typography>
                        <Typography variant="body2">{notes}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                Your renewal request will be reviewed by our team. You will receive a confirmation email once approved.
              </Alert>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ px: 3 }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!selectedCertificate || uploadedFiles.length === 0 || loading || !eligibility?.isEligible}
                  sx={{
                    px: 4,
                    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0e3e4e 0%, #61a270 100%)',
                    },
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && (!selectedCertificate || !eligibility?.isEligible)}
                  sx={{
                    px: 4,
                    background: activeStep === 0 && (!selectedCertificate || !eligibility?.isEligible)
                      ? 'rgba(0, 0, 0, 0.12)'
                      : 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                    color: activeStep === 0 && (!selectedCertificate || !eligibility?.isEligible)
                      ? 'rgba(0, 0, 0, 0.26)'
                      : 'white',
                    '&:hover': {
                      background: activeStep === 0 && (!selectedCertificate || !eligibility?.isEligible)
                        ? 'rgba(0, 0, 0, 0.12)'
                        : 'linear-gradient(135deg, #0e3e4e 0%, #61a270 100%)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

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

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={!!downloadMenuAnchor}
        onClose={() => setDownloadMenuAnchor(null)}
      >
        <MenuItem
          onClick={async () => {
            if (selectedCert) {
              await exportCertificateAsPDF(selectedCert);
              setDownloadMenuAnchor(null);
            }
          }}
        >
          <PdfIcon sx={{ mr: 1, fontSize: 20 }} />
          Download as PDF
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (selectedCert) {
              await exportCertificateAsImage(selectedCert);
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




