import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Alert, Button, Avatar } from '@mui/material';
import {
  TrendingUp as RevenueIcon,
  Assignment as JobIcon,
  Warning as AlertIcon,
  People as UsersIcon,
  Inventory as InventoryIcon,
  RequestQuote as RequestIcon,
} from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column } from '@/components/common/DataTable';
import { mockJobOrders, mockCertificates, mockPayments } from '@/utils/mockData';
import { Certificate } from '@/types';
import { format } from 'date-fns';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useNavigate } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
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

  // Get sticker inventory stats
  const getStickerStats = () => {
    const storedLots = localStorage.getItem('sticker-lots');
    const storedStock = localStorage.getItem('sticker-stock');
    const storedRequests = localStorage.getItem('sticker-requests');

    let totalAvailable = 0;
    let totalIssued = 0;
    let pendingRequests = 0;

    if (storedLots) {
      const lots = JSON.parse(storedLots);
      totalAvailable = lots.reduce((sum: number, lot: any) => sum + (lot.availableQuantity || 0), 0);
      totalIssued = lots.reduce((sum: number, lot: any) => sum + (lot.issuedQuantity || 0), 0);
    }

    if (storedRequests) {
      const requests = JSON.parse(storedRequests);
      pendingRequests = requests.filter((r: any) => r.status === 'Pending').length;
    }

    return { totalAvailable, totalIssued, pendingRequests };
  };

  const stickerStats = getStickerStats();
  const lowStockAlert = stickerStats.totalAvailable < 100; // Alert if less than 100 stickers available

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Manager Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Company-wide analytics and strategic oversight
        </Typography>
      </Box>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    ${totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    This month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <RevenueIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Active Job Orders
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {mockJobOrders.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <JobIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Expiring Certificates
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {expiringCertificates.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Next 90 days
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <AlertIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Critical Alerts
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {criticalAlerts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <UsersIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sticker Management Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: lowStockAlert || stickerStats.pendingRequests > 0 ? '2px solid' : 'none',
              borderColor: lowStockAlert ? 'error.main' : stickerStats.pendingRequests > 0 ? 'warning.main' : 'transparent',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                p: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InventoryIcon sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Sticker Management
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Monitor sticker inventory and stock requests
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/manager/stickers')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                Manage Stickers
              </Button>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight={700} color={lowStockAlert ? 'error.main' : 'text.primary'}>
                      {stickerStats.totalAvailable}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available Stickers
                    </Typography>
                    {lowStockAlert && (
                      <Typography variant="caption" color="error.main" fontWeight={600} sx={{ mt: 1, display: 'block' }}>
                        Low Stock Alert
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight={700}>
                      {stickerStats.totalIssued}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issued to Inspectors
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: stickerStats.pendingRequests > 0 ? 'warning.light' : 'grey.50',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} color={stickerStats.pendingRequests > 0 ? 'warning.dark' : 'text.primary'}>
                      {stickerStats.pendingRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Requests
                    </Typography>
                    {stickerStats.pendingRequests > 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<RequestIcon />}
                        onClick={() => navigate('/manager/stickers')}
                        sx={{ mt: 1 }}
                      >
                        Review Requests
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
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
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
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
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
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
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth href="/manager/certificates" sx={{ py: 1.5 }}>
                    View All Certificates
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth href="/manager/analytics" sx={{ py: 1.5 }}>
                    Detailed Analytics
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth href="/manager/users" sx={{ py: 1.5 }}>
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                      },
                    }}
                  >
                    Generate Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificate Expiry Report */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
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



