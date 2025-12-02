import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Description as LegalIcon,
} from '@mui/icons-material';

export const LegalInformation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/client/settings')}
          sx={{ mb: 2 }}
        >
          Back to Settings
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <LegalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
            Legal Information
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Terms of Service, Disclaimer, and Legal Notices
        </Typography>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            TOVE Leeds Compliance System
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Legal Information & Terms of Service
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          {/* Terms of Service */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              1. Terms of Service
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              By accessing and using the TOVE Leeds Compliance System, you agree to be bound by these Terms of Service. 
              If you do not agree with any part of these terms, you must not use our services.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              The services provided through this platform are subject to change without notice. We reserve the right to 
              modify, suspend, or discontinue any part of the service at any time.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* User Responsibilities */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              2. User Responsibilities
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must provide accurate and complete information when using our services</li>
                <li>You agree to use the system only for lawful purposes</li>
                <li>You must not attempt to gain unauthorized access to any part of the system</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Service Availability */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              3. Service Availability
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              While we strive to ensure the system is available 24/7, we do not guarantee uninterrupted access. 
              The service may be unavailable due to maintenance, updates, or unforeseen circumstances.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              We are not liable for any loss or damage resulting from service unavailability or interruptions.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Intellectual Property */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              4. Intellectual Property
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              All content, features, and functionality of the TOVE Leeds Compliance System, including but not limited to 
              text, graphics, logos, icons, and software, are the exclusive property of TOVE Leeds and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              You may not reproduce, distribute, modify, or create derivative works from any content without express 
              written permission from TOVE Leeds.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Disclaimer */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              5. Disclaimer
            </Typography>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'warning.light', borderRadius: 2, mb: 2 }}>
              <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                Important Notice:
              </Typography>
              <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
                The information provided through this system is for general informational purposes only. While we make 
                every effort to ensure accuracy, we do not warrant or guarantee the completeness, reliability, or accuracy 
                of any information provided.
              </Typography>
            </Paper>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              TOVE Leeds shall not be liable for any direct, indirect, incidental, special, or consequential damages 
              arising from the use or inability to use the system or its services.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Limitation of Liability */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              6. Limitation of Liability
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              To the maximum extent permitted by law, TOVE Leeds and its affiliates shall not be liable for any damages, 
              including but not limited to:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Loss of data or information</li>
                <li>Business interruption</li>
                <li>Loss of profits or revenue</li>
                <li>Indirect or consequential damages</li>
              </ul>
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Governing Law */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              7. Governing Law
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              These Terms of Service shall be governed by and construed in accordance with the laws of the United Arab Emirates. 
              Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of the UAE.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Changes to Terms */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              8. Changes to Terms
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon 
              posting. Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Last updated: January 2025
            </Typography>
          </Box>
        </CardContent>

        {/* Footer */}
        <Box sx={{ p: 3, bgcolor: 'action.hover', textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            For questions regarding these terms, please contact us at{' '}
            <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              legal@toveleeds.com
            </Typography>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

