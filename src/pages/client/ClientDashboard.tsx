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
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your certifications, services, and compliance requirements
        </Typography>
      </Box>

      {/* Quick Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/client/verify')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <VerifyIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Verify Certificate
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Verify the authenticity of a certificate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/client/renewal')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <RenewIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Request Renewal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Renew your expiring certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              color: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
              cursor: 'pointer',
            }}
            onClick={() => window.location.href = '/client/new-service'}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <NewServiceIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                New Service Request
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Request inspection, training, or NDT services
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Service History Widget */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon />
                  <Typography variant="h6" fontWeight={600}>
                    Recent Service History
                  </Typography>
                </Box>
                <Button
                  size="small"
                  href="/client/history"
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  View All
                </Button>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {recentServices.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent service history
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'grey.50' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar
                            sx={{
                              bgcolor:
                                service.status === 'Completed' || service.status === 'Approved'
                                  ? 'success.light'
                                  : service.status === 'In Progress'
                                  ? 'info.light'
                                  : 'warning.light',
                              width: 40,
                              height: 40,
                            }}
                          >
                            <AssignmentIcon
                              sx={{
                                color:
                                  service.status === 'Completed' || service.status === 'Approved'
                                    ? 'success.dark'
                                    : service.status === 'In Progress'
                                    ? 'info.dark'
                                    : 'warning.dark',
                              }}
                            />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                {service.serviceTypes?.map((type) => (
                                  <Chip key={type} label={type} size="small" color="primary" />
                                ))}
                              </Box>
                              <Chip
                                label={service.status}
                                size="small"
                                color={
                                  service.status === 'Completed' || service.status === 'Approved'
                                    ? 'success'
                                    : service.status === 'In Progress'
                                    ? 'info'
                                    : 'warning'
                                }
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Job ID: {service.id} • {format(service.dateTime, 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < recentServices.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Expiries Widget */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                color: 'white',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClockIcon />
                <Typography variant="h6" fontWeight={600}>
                  Certificates Expiring Soon
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {expiringCertificates.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {expiringCertificates.map((cert, index) => {
                    const daysUntilExpiry = Math.floor(
                      (cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <React.Fragment key={cert.id}>
                        <ListItem
                          sx={{
                            px: 0,
                            py: 1.5,
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'grey.50' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar
                              sx={{
                                bgcolor: 'warning.light',
                                width: 40,
                                height: 40,
                              }}
                            >
                              <ScheduleIcon sx={{ color: 'warning.dark' }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" fontWeight={600} gutterBottom>
                                {cert.certificateNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cert.serviceType} • Expires in {daysUntilExpiry} days
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => setDownloadMenuAnchor({ anchor: e.currentTarget, cert })}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'primary.light', color: 'white' },
                                }}
                              >
                                <DownloadIcon />
                              </IconButton>
                              <Button
                                size="small"
                                variant="contained"
                                href="/client/renewal"
                                sx={{
                                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #e08a0a 0%, #d56e12 100%)',
                                  },
                                }}
                              >
                                Renew
                              </Button>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < expiringCertificates.length - 1 && <Divider sx={{ my: 1 }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No certificates expiring in the next 90 days
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Payments Widget */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                color: 'white',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                <Typography variant="h6" fontWeight={600}>
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
                            p: 2,
                            mb: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'error.light',
                                width: 48,
                                height: 48,
                              }}
                            >
                              <PaymentIcon sx={{ color: 'error.dark' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={600} gutterBottom>
                                Job Order: {payment.jobOrderId}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {jobOrder ? `${jobOrder.serviceTypes?.join(', ') || 'N/A'} • ${format(jobOrder.dateTime, 'MMM dd, yyyy')}` : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h5" fontWeight={700} color="error.main">
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
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #b0291b 0%, #d73c2c 100%)',
                                },
                                px: 3,
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
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
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

