import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Language as WebsiteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  List as ListIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const contactInfo = {
  website: 'https://tove-leeds.example',
  email: 'support@toveleeds.com',
  phone: '+971-00-000-0000',
};

const categories = [
  'General Inquiry',
  'Technical Issue',
  'App Problem',
  'Payment Issue',
  'Certificate Issue',
  'Other',
];

const faqData = [
  {
    question: 'How do I verify my certificate?',
    answer: 'You can verify your certificate by scanning the QR code or entering the verification code manually on the Certificate Verification page.',
  },
  {
    question: 'How do I renew my certificate?',
    answer: 'Go to the Request Renewal page, select your certificate, complete the CPD requirements if needed, and submit your renewal request with required documents.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Credit/Debit Cards and Bank Transfer. You can find bank details in the Payment Methods section.',
  },
  {
    question: 'How long does certificate processing take?',
    answer: 'Certificate processing typically takes 3-5 business days after payment confirmation and document verification.',
  },
  {
    question: 'Can I download my certificate?',
    answer: 'Yes, you can download your certificate as PDF or image from the Certificate Verification page or your dashboard.',
  },
  {
    question: 'How do I update my profile information?',
    answer: 'Go to Profile Management page, click Edit Profile, make your changes, and save. Note that some fields like Name and ID Number are read-only.',
  },
];

export const ContactSupport: React.FC = () => {
  const navigate = useNavigate();
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmitTicket = () => {
    if (!ticketCategory || !ticketDescription.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      });
      return;
    }

    // Generate ticket ID
    const ticketId = Math.floor(Math.random() * 10000);
    
    // Save ticket to localStorage
    const tickets = JSON.parse(localStorage.getItem('support-tickets') || '[]');
    const newTicket = {
      id: ticketId,
      category: ticketCategory,
      description: ticketDescription,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    localStorage.setItem('support-tickets', JSON.stringify(tickets));

    setSnackbar({
      open: true,
      message: `Ticket submitted successfully! Ticket ID: #${ticketId}`,
      severity: 'success',
    });

    // Reset form
    setTicketCategory('');
    setTicketDescription('');
  };

  const handleContactClick = (type: 'email' | 'phone' | 'website') => {
    if (type === 'email') {
      window.location.href = `mailto:${contactInfo.email}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${contactInfo.phone}`;
    } else if (type === 'website') {
      window.open(contactInfo.website, '_blank');
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Contact Support
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get help with your account, certificates, or general inquiries
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Contact Methods & FAQ */}
        <Grid item xs={12} md={5}>
          {/* Contact Methods */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Contact Us
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleContactClick('website')}
                    sx={{ px: 3, py: 2 }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <WebsiteIcon sx={{ color: 'primary.main' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary="Website"
                      secondary={contactInfo.website}
                      secondaryTypographyProps={{ color: 'text.primary', fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleContactClick('email')}
                    sx={{ px: 3, py: 2 }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'info.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <EmailIcon sx={{ color: 'info.main' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={contactInfo.email}
                      secondaryTypographyProps={{ color: 'text.primary', fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleContactClick('phone')}
                    sx={{ px: 3, py: 2 }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'success.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PhoneIcon sx={{ color: 'success.main' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={contactInfo.phone}
                      secondaryTypographyProps={{ color: 'text.primary', fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <HelpIcon />
              <Typography variant="h6" fontWeight={600}>
                Frequently Asked Questions
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {faqData.map((faq, index) => (
                <Accordion key={index} elevation={0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 3, py: 2 }}
                  >
                    <Typography variant="body1" fontWeight={600}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Support Ticket Form */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Submit Support Ticket
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Report app-specific issues or general inquiries
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Describe your issue or inquiry..."
                  multiline
                  rows={6}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSubmitTicket}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                  },
                }}
              >
                Submit Ticket
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  startIcon={<ListIcon />}
                  onClick={() => navigate('/client/support/tickets')}
                  sx={{
                    color: 'primary.main',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  View My Tickets
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
    </Box>
  );
};

