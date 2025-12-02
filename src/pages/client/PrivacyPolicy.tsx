import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PrivacyTip as PrivacyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(() => {
    return localStorage.getItem('privacy-policy-acknowledged') === 'true';
  });

  const policyVersion = 'v3.2';
  const lastUpdated = '2025-01-10';

  const handleAcknowledge = () => {
    localStorage.setItem('privacy-policy-acknowledged', 'true');
    localStorage.setItem('privacy-policy-version', policyVersion);
    localStorage.setItem('privacy-policy-date', lastUpdated);
    setAcknowledged(true);
  };

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
          <PrivacyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
            Privacy Policy
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            How we collect, use, and protect your personal information
          </Typography>
          <Chip label={`Version ${policyVersion}`} size="small" color="primary" />
        </Box>
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
            TOVE Leeds Privacy Policy
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Last updated: {lastUpdated}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          {/* Introduction */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              Introduction
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              TOVE Leeds ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our Compliance System and 
              related services.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              By using our services, you consent to the data practices described in this policy. If you do not agree 
              with our policies and practices, please do not use our services.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Information We Collect */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              1. Information We Collect
            </Typography>
            
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Personal Information
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Name, email address, phone number</li>
                <li>ID number and date of birth</li>
                <li>Address and location information</li>
                <li>Business type and company details</li>
                <li>Profile picture (if uploaded)</li>
              </ul>
            </Typography>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Usage Information
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Actions taken within the system</li>
              </ul>
            </Typography>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Certificate and Service Data
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Certificate details and verification codes</li>
                <li>Service requests and job orders</li>
                <li>Payment information and transaction history</li>
                <li>Training records and assessment results</li>
              </ul>
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* How We Use Your Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              We use the collected information for the following purposes:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>To provide and maintain our services</li>
                <li>To process and manage certificate requests and renewals</li>
                <li>To handle payments and generate receipts</li>
                <li>To send notifications and updates about your account</li>
                <li>To respond to your support requests and inquiries</li>
                <li>To improve our services and user experience</li>
                <li>To comply with legal obligations and regulatory requirements</li>
                <li>To prevent fraud and ensure security</li>
              </ul>
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Data Sharing and Disclosure */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              3. Data Sharing and Disclosure
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              We do not sell your personal information. We may share your information only in the following circumstances:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our system</li>
                <li><strong>Legal Requirements:</strong> When required by law or to comply with legal processes</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Data Security */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              4. Data Security
            </Typography>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'success.light', borderRadius: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckIcon sx={{ color: 'success.main' }} />
                <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  Security Measures
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
                We implement industry-standard security measures including encryption, secure servers, access controls, 
                and regular security audits to protect your personal information from unauthorized access, disclosure, 
                alteration, or destruction.
              </Typography>
            </Paper>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
              to protect your data, we cannot guarantee absolute security.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Data Retention */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              5. Data Retention
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.8 }}>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
              unless a longer retention period is required or permitted by law. Certificate records and transaction history 
              may be retained for compliance and audit purposes.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Your Rights */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              6. Your Rights
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You have the following rights regarding your personal information:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
              To exercise these rights, please contact us at{' '}
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                privacy@toveleeds.com
              </Typography>
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Cookies and Tracking */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              7. Cookies and Tracking Technologies
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and 
              improve our services. You can control cookie preferences through your browser settings.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Children's Privacy */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              8. Children's Privacy
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us immediately.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Changes to Privacy Policy */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              9. Changes to This Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              policy on this page and updating the "Last updated" date. You are advised to review this policy periodically 
              for any changes.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              10. Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <strong>Email:</strong> privacy@toveleeds.com<br />
              <strong>Phone:</strong> +971-00-000-0000<br />
              <strong>Address:</strong> TOVE Leeds Training Center, UAE
            </Typography>
          </Box>
        </CardContent>

        {/* Acknowledgment Section */}
        {!acknowledged && (
          <Box sx={{ p: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              By clicking "I Acknowledge," you confirm that you have read and understood this Privacy Policy.
            </Typography>
            <Button
              variant="contained"
              onClick={handleAcknowledge}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                },
              }}
            >
              I Acknowledge
            </Button>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ p: 3, bgcolor: 'action.hover', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            This Privacy Policy is effective as of {lastUpdated} and applies to all users of the TOVE Leeds Compliance System.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

