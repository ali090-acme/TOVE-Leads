import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  List,
  ListItem,
  Chip,
  Divider,
  Skeleton,
  Avatar,
  Paper,
} from '@mui/material';
import {
  VerifiedUser as VerifyIcon,
  Refresh as RenewIcon,
  Add as NewServiceIcon,
  AccessTime as ClockIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { QuickActionCard } from '@/components/common/QuickActionCard';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { exportCertificateAsPDF, exportCertificateAsImage } from '@/utils/certificateExport';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Certificate } from '@/types';

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, certificates, payments } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<{ anchor: HTMLElement; cert: Certificate } | null>(null);

  // Simulate loading state (in real app, this would be API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get recent service history (last 5)
  const recentServices = jobOrders.slice(0, 5);
  
  // Get certificates expiring soon (next 90 days)
  const expiringCertificates = certificates.filter(cert => {
    const daysUntilExpiry = Math.floor(
      (cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  }).slice(0, 3);

  // Get pending payments
  const pendingPayments = payments.filter(p => p.status === 'Pending');

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={400} height={30} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Welcome Header */}
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
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.0625rem' }}>
          Manage your certifications, services, and compliance requirements
        </Typography>
      </Box>

      {/* Quick Action Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              minHeight: 220,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(30, 60, 114, 0.4)',
                '& .card-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              },
            }}
            onClick={() => navigate('/client/verify')}
          >
            <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Avatar
                className="card-icon"
                sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2.5,
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                <VerifyIcon sx={{ fontSize: 36, color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1, fontSize: '1.125rem' }}>
                Verify Certificate
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Verify the authenticity of a certificate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              minHeight: 220,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(44, 62, 80, 0.4)',
                '& .card-icon': {
                  transform: 'scale(1.1) rotate(-5deg)',
                },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              },
            }}
            onClick={() => navigate('/client/renewal')}
          >
            <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Avatar
                className="card-icon"
                sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2.5,
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                <RenewIcon sx={{ fontSize: 36, color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1, fontSize: '1.125rem' }}>
                Request Renewal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Renew your expiring certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              minHeight: 220,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(44, 62, 80, 0.4)',
                '& .card-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              },
            }}
            onClick={() => window.location.href = '/client/new-service'}
          >
            <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Avatar
                className="card-icon"
                sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2.5,
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                <NewServiceIcon sx={{ fontSize: 36, color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1, fontSize: '1.125rem' }}>
                New Service Request
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Request inspection, training, or NDT services
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Service History Widget */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(30, 60, 114, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
                    Recent Service History
                  </Typography>
                </Box>
                <Button
                  size="small"
                  href="/client/history"
                  sx={{ 
                    color: 'white', 
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  View All
                </Button>
              </Box>
            </Box>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {recentServices.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                      No recent service history
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <List sx={{ p: 0, flexGrow: 1 }}>
                  {recentServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'grey.50',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar
                            sx={{
                              bgcolor:
                                service.status === 'Completed' || service.status === 'Approved'
                                  ? '#1e3c72'
                                  : service.status === 'In Progress'
                                  ? '#3498db'
                                  : '#e67e22',
                              width: 48,
                              height: 48,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <AssignmentIcon
                              sx={{
                                color: 'white',
                                fontSize: 24,
                              }}
                            />
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', flexGrow: 1 }}>
                                {service.serviceTypes?.map((type) => (
                                  <Chip 
                                    key={type} 
                                    label={type} 
                                    size="small" 
                                    color="primary"
                                    sx={{ 
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                      height: 24,
                                    }}
                                  />
                                ))}
                              </Box>
                              <Chip
                                label={service.status}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 24,
                                  bgcolor:
                                    service.status === 'Completed' || service.status === 'Approved'
                                      ? '#1e3c72'
                                      : service.status === 'In Progress'
                                      ? '#3498db'
                                      : '#e67e22',
                                  color: 'white',
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              Job ID: {service.id} • {format(service.dateTime, 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < recentServices.length - 1 && <Divider sx={{ my: 0.5, opacity: 0.5 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Expiries Widget */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(243, 156, 18, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ClockIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
                  Certificates Expiring Soon
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {expiringCertificates.length > 0 ? (
                <List sx={{ p: 0, flexGrow: 1 }}>
                  {expiringCertificates.map((cert, index) => {
                    const daysUntilExpiry = Math.floor(
                      (cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <React.Fragment key={cert.id}>
                        <ListItem
                          sx={{
                            px: 0,
                            py: 2,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': { 
                              bgcolor: 'grey.50',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                            <Avatar
                              sx={{
                                bgcolor: '#3498db',
                                width: 48,
                                height: 48,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            >
                              <ScheduleIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: '0.9375rem', mb: 0.5 }}>
                                {cert.certificateNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                {cert.serviceType} • Expires in {daysUntilExpiry} days
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={(e) => setDownloadMenuAnchor({ anchor: e.currentTarget, cert })}
                                sx={{
                                  color: 'primary.main',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  '&:hover': { 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s',
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                              <Button
                                size="small"
                                variant="contained"
                                href="/client/renewal"
                                sx={{
                                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  px: 2,
                                  boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                                    boxShadow: '0 4px 12px rgba(30, 60, 114, 0.4)',
                                    transform: 'translateY(-1px)',
                                  },
                                  transition: 'all 0.2s',
                                }}
                              >
                                Renew
                              </Button>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < expiringCertificates.length - 1 && <Divider sx={{ my: 0.5, opacity: 0.5 }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <CheckCircleIcon sx={{ fontSize: 56, color: '#1e3c72', mb: 2, opacity: 0.8 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                    No certificates expiring in the next 90 days
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Payments Widget */}
        <Grid item xs={12}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(192, 57, 43, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PaymentIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
                  Pending Payments
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {pendingPayments.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {pendingPayments.map((payment, index) => {
                    const jobOrder = jobOrders.find(jo => jo.id === payment.jobOrderId);
                    return (
                      <React.Fragment key={payment.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: index < pendingPayments.length - 1 ? 2 : 0,
                            bgcolor: 'grey.50',
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'white',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                              transform: 'translateY(-2px)',
                            },
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexGrow: 1, minWidth: 0 }}>
                            <Avatar
                              sx={{
                                bgcolor: '#3498db',
                                width: 56,
                                height: 56,
                                boxShadow: '0 2px 8px rgba(52, 152, 219, 0.2)',
                              }}
                            >
                              <PaymentIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: '1rem', mb: 0.5 }}>
                                Job Order: {payment.jobOrderId}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                {jobOrder ? `${jobOrder.serviceTypes?.join(', ') || 'N/A'} • ${format(jobOrder.dateTime, 'MMM dd, yyyy')}` : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                            <Typography 
                              variant="h5" 
                              fontWeight={700} 
                              sx={{ 
                                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                                whiteSpace: 'nowrap',
                                color: '#1e3c72',
                              }}
                            >
                              ${payment.amount}
                            </Typography>
                            <Button
                              variant="contained"
                              size="large"
                              onClick={() => {
                                navigate('/client/payment/methods', {
                                  state: {
                                    paymentId: payment.id,
                                    amount: payment.amount,
                                    service: jobOrder?.serviceTypes?.join(', ') || 'Service Payment',
                                  },
                                });
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.25,
                                boxShadow: '0 4px 12px rgba(192, 57, 43, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #b0291b 0%, #d73c2c 100%)',
                                  boxShadow: '0 6px 20px rgba(192, 57, 43, 0.4)',
                                  transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Pay Now
                            </Button>
                          </Box>
                        </Paper>
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <CheckCircleIcon sx={{ fontSize: 56, color: '#1e3c72', mb: 2, opacity: 0.8 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                    No pending payments
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor?.anchor}
        open={!!downloadMenuAnchor}
        onClose={() => setDownloadMenuAnchor(null)}
      >
        <MenuItem
          onClick={async () => {
            if (downloadMenuAnchor) {
              await exportCertificateAsPDF(downloadMenuAnchor.cert);
              setDownloadMenuAnchor(null);
            }
          }}
        >
          <PdfIcon sx={{ mr: 1, fontSize: 20 }} />
          Download as PDF
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (downloadMenuAnchor) {
              await exportCertificateAsImage(downloadMenuAnchor.cert);
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

