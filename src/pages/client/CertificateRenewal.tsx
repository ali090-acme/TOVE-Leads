import React, { useState } from 'react';
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
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { mockCertificates } from '@/utils/mockData';
import { format } from 'date-fns';

const steps = ['Select Certificate', 'Upload Documents', 'Review & Submit'];

export const CertificateRenewal: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');

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

  const handleSubmit = () => {
    alert('Renewal request submitted successfully! You will receive a confirmation email shortly.');
    // Reset form
    setActiveStep(0);
    setSelectedCertificate('');
    setUploadedFiles([]);
    setNotes('');
  };

  const selectedCert = mockCertificates.find((c) => c.id === selectedCertificate);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Certificate Renewal Request
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Request renewal for your expiring or expired certificates
      </Typography>

      <Card>
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
                  {mockCertificates.map((cert) => (
                    <MenuItem key={cert.id} value={cert.id}>
                      {cert.certificateNumber} - {cert.serviceType} (Expires: {format(cert.expiryDate, 'MMM dd, yyyy')})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCert && (
                <Alert severity="info">
                  Selected: {selectedCert.certificateNumber} - {selectedCert.serviceType}
                </Alert>
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

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{ mb: 2, py: 2 }}
              >
                Upload Files (PDF, JPG, PNG)
                <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
              </Button>

              {uploadedFiles.length > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {uploadedFiles.length} file(s) uploaded
                </Alert>
              )}

              <List>
                {uploadedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                  </ListItem>
                ))}
              </List>

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
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!selectedCertificate || uploadedFiles.length === 0}
                >
                  Submit Request
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} disabled={activeStep === 0 && !selectedCertificate}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};




