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
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          fontWeight={700} 
          sx={{ 
            color: 'text.primary',
            mb: 1,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Contact Support
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.0625rem' }}>
          Get help with your account, certificates, or general inquiries
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Contact Methods & FAQ */}
        <Grid item xs={12} md={5}>
          {/* Contact Methods */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
                Contact Us
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card
                  elevation={0}
                  onClick={() => handleContactClick('website')}
                  sx={{
                    p: 2.5,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: 'white',
                    '&:hover': {
                      borderColor: '#1e3c72',
                      bgcolor: '#f0f7ff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(30, 60, 114, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        bgcolor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <WebsiteIcon sx={{ fontSize: 28, color: '#1e3c72' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5, color: '#2c3e50' }}>
                        Website
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e3c72', fontWeight: 600, wordBreak: 'break-all' }}>
                        {contactInfo.website}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card
                  elevation={0}
                  onClick={() => handleContactClick('email')}
                  sx={{
                    p: 2.5,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: 'white',
                    '&:hover': {
                      borderColor: '#1e3c72',
                      bgcolor: '#f0f7ff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(30, 60, 114, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        bgcolor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 28, color: '#1e3c72' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5, color: '#2c3e50' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e3c72', fontWeight: 600, wordBreak: 'break-all' }}>
                        {contactInfo.email}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card
                  elevation={0}
                  onClick={() => handleContactClick('phone')}
                  sx={{
                    p: 2.5,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: 'white',
                    '&:hover': {
                      borderColor: '#1e3c72',
                      bgcolor: '#f0f7ff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(30, 60, 114, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        bgcolor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <PhoneIcon sx={{ fontSize: 28, color: '#1e3c72' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5, color: '#2c3e50' }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e3c72', fontWeight: 600 }}>
                        {contactInfo.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HelpIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
                Frequently Asked Questions
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {faqData.map((faq, index) => (
                <Accordion 
                  key={index} 
                  elevation={0}
                  sx={{
                    border: 'none',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      margin: 0,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#1e3c72' }} />}
                    sx={{ 
                      px: 3, 
                      py: 2.5,
                      minHeight: 56,
                      '&:hover': {
                        bgcolor: '#f5f7fa',
                      },
                    }}
                  >
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#2c3e50', fontSize: '0.9375rem' }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography variant="body2" sx={{ color: '#5a6c7d', lineHeight: 1.7, fontSize: '0.9375rem' }}>
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
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem', mb: 0.5 }}>
                Submit Support Ticket
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.9375rem' }}>
                Report app-specific issues or general inquiries
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 500 }}>Category</InputLabel>
                  <Select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    label="Category"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1e3c72',
                      },
                    }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Describe your issue or inquiry in detail..."
                  multiline
                  rows={8}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1e3c72',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1e3c72',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSubmitTicket}
                disabled={!ticketCategory || !ticketDescription.trim()}
                sx={{
                  py: 1.75,
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(30, 60, 114, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                    boxShadow: '0 6px 20px rgba(30, 60, 114, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#bdbdbd',
                    color: '#757575',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Submit Ticket
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  startIcon={<ListIcon />}
                  onClick={() => navigate('/client/support/tickets')}
                  sx={{
                    color: '#1e3c72',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    '&:hover': {
                      bgcolor: '#f0f7ff',
                    },
                    px: 2,
                    py: 1,
                    borderRadius: 2,
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

