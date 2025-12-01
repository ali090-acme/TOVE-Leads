import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export const NewServiceRequest: React.FC = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    location: '',
    preferredDate: '',
    description: '',
  });

  const handleSubmit = () => {
    alert('Service request submitted! You will be contacted soon.');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        New Service Request
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Request a new inspection, assessment, training, or NDT service
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Fill out the form below and our team will contact you to schedule the service.
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Service Type"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <MenuItem value="Inspection">Equipment Inspection</MenuItem>
                <MenuItem value="Assessment">Operator Assessment</MenuItem>
                <MenuItem value="Training">Training Session</MenuItem>
                <MenuItem value="NDT">NDT Testing</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter service location"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Preferred Date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description / Additional Requirements"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide any additional details about your service request..."
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" size="large" startIcon={<SendIcon />} onClick={handleSubmit}>
                  Submit Request
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};



