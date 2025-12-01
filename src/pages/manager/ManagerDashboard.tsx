import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Alert, Button } from '@mui/material';
import {
  TrendingUp as RevenueIcon,
  Assignment as JobIcon,
  Warning as AlertIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column } from '@/components/common/DataTable';
import { mockJobOrders, mockCertificates, mockPayments } from '@/utils/mockData';
import { Certificate } from '@/types';
import { format } from 'date-fns';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

export const ManagerDashboard: React.FC = () => {
  const totalRevenue = mockPayments
    .filter((p) => p.status === 'Confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  const expiringCertificates = mockCertificates.filter((cert) => {
    const daysUntilExpiry = Math.floor(
      (cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  });

  const criticalAlerts = 2; // Mock value

  const columns: Column<Certificate>[] = [
    { id: 'certificateNumber', label: 'Certificate Number', minWidth: 150 },
    { id: 'clientName', label: 'Client', minWidth: 170 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      minWidth: 130,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    {
      id: 'expiryDate',
      label: 'Days Until Expiry',
      minWidth: 130,
      format: (value) => {
        const days = Math.floor((value.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return (
          <Typography
            variant="body2"
            color={days <= 30 ? 'error.main' : days <= 60 ? 'warning.main' : 'text.primary'}
            fontWeight={500}
          >
            {days} days
          </Typography>
        );
      },
    },
  ];

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 19000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 },
  ];

  const serviceTypeData = [
    { id: 0, value: 35, label: 'Inspection' },
    { id: 1, value: 25, label: 'Training' },
    { id: 2, value: 20, label: 'NDT' },
    { id: 3, value: 20, label: 'Assessment' },
  ];

  const regionData = [
    { region: 'North', jobs: 45 },
    { region: 'South', jobs: 38 },
    { region: 'East', jobs: 52 },
    { region: 'West', jobs: 41 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Manager Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Company-wide analytics and strategic oversight
      </Typography>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<RevenueIcon />}
            color="success.main"
            subtitle="This month"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Active Job Orders"
            value={mockJobOrders.length}
            icon={<JobIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Expiring Certificates"
            value={expiringCertificates.length}
            icon={<AlertIcon />}
            color="warning.main"
            subtitle="Next 90 days"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Critical Alerts"
            value={criticalAlerts}
            icon={<UsersIcon />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Critical Alerts */}
      {criticalAlerts > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight={500} gutterBottom>
            {criticalAlerts} Critical Issues Requiring Attention
          </Typography>
          <Typography variant="body2">
            • High number of rejected reports in Inspection department
            <br />• Client escalation: ABC Construction Ltd - Job Order JO-2025001
          </Typography>
          <Button variant="outlined" size="small" sx={{ mt: 1 }}>
            View Details
          </Button>
        </Alert>
      )}

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Revenue Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Monthly revenue over the last 6 months
              </Typography>
              <LineChart
                xAxis={[
                  {
                    scaleType: 'point',
                    data: revenueData.map((d) => d.month),
                  },
                ]}
                series={[
                  {
                    data: revenueData.map((d) => d.revenue),
                    color: '#2e7d32',
                    label: 'Revenue ($)',
                  },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Service Type Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Jobs by Service Type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Distribution of services
              </Typography>
              <PieChart
                series={[
                  {
                    data: serviceTypeData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Jobs by Region */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Jobs by Region
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Regional distribution of job orders
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: regionData.map((d) => d.region),
                  },
                ]}
                series={[
                  {
                    data: regionData.map((d) => d.jobs),
                    color: '#1976d2',
                  },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth href="/manager/certificates">
                    View All Certificates
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth href="/manager/analytics">
                    Detailed Analytics
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth href="/manager/users">
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth>
                    Generate Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificate Expiry Report */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Certificate Expiry Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Certificates expiring in the next 90 days - proactive client engagement recommended
          </Typography>
          <DataTable
            columns={columns}
            data={expiringCertificates}
            searchPlaceholder="Search by certificate number, client..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};



