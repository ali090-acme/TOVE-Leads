import React from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  VerifiedUser as VerifyIcon,
  Refresh as RenewIcon,
  Add as NewServiceIcon,
  AccessTime as ClockIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { QuickActionCard } from '@/components/common/QuickActionCard';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';

export const ClientDashboard: React.FC = () => {
  const { jobOrders, certificates, payments } = useAppContext();

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Welcome Back
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your certifications, services, and compliance requirements
      </Typography>

      {/* Quick Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            title="Verify Certificate"
            description="Verify the authenticity of a certificate"
            icon={<VerifyIcon />}
            path="/client/verify"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            title="Request Renewal"
            description="Renew your expiring certificates"
            icon={<RenewIcon />}
            path="/client/renewal"
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            title="New Service Request"
            description="Request inspection, training, or NDT services"
            icon={<NewServiceIcon />}
            path="/client/new-service"
            color="success.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Service History Widget */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Service History
                </Typography>
                <Button size="small" href="/client/history">
                  View All
                </Button>
              </Box>
              <List>
                {recentServices.map((service, index) => (
                  <React.Fragment key={service.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{service.serviceType}</Typography>
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
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            Job ID: {service.id} • {format(service.dateTime, 'MMM dd, yyyy')}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentServices.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Expiries Widget */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ClockIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Certificates Expiring Soon
                </Typography>
              </Box>
              {expiringCertificates.length > 0 ? (
                <List>
                  {expiringCertificates.map((cert, index) => {
                    const daysUntilExpiry = Math.floor(
                      (cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <React.Fragment key={cert.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={cert.certificateNumber}
                            secondary={`${cert.serviceType} • Expires in ${daysUntilExpiry} days`}
                          />
                          <Button size="small" variant="outlined" href="/client/renewal">
                            Renew
                          </Button>
                        </ListItem>
                        {index < expiringCertificates.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No certificates expiring in the next 90 days
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Payments Widget */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Pending Payments
                </Typography>
              </Box>
                {pendingPayments.length > 0 ? (
                <List>
                  {pendingPayments.map((payment, index) => {
                    const jobOrder = jobOrders.find(jo => jo.id === payment.jobOrderId);
                    return (
                      <React.Fragment key={payment.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={`Job Order: ${payment.jobOrderId}`}
                            secondary={jobOrder ? `${jobOrder.serviceType} • ${format(jobOrder.dateTime, 'MMM dd, yyyy')}` : ''}
                          />
                          <Typography variant="h6" sx={{ mr: 2 }}>
                            ${payment.amount}
                          </Typography>
                          <Button variant="contained" size="small">
                            Pay Now
                          </Button>
                        </ListItem>
                        {index < pendingPayments.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending payments
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

