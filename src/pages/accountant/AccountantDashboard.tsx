import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Payment as PaymentIcon, Receipt as InvoiceIcon, TrendingUp as RevenueIcon, Error as ErrorIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { mockPayments, mockJobOrders } from '@/utils/mockData';
import { Payment } from '@/types';
import { format } from 'date-fns';
// Navigation not used in this component

export const AccountantDashboard: React.FC = () => {

  const pendingPayments = mockPayments.filter((p) => p.status === 'Pending');
  const confirmedThisMonth = mockPayments.filter((p) => p.status === 'Confirmed');
  const totalRevenue = confirmedThisMonth.reduce((sum, p) => sum + p.amount, 0);
  const failedPayments = mockPayments.filter((p) => p.status === 'Failed').length;

  const columns: Column<Payment>[] = [
    { id: 'jobOrderId', label: 'Job Order ID', minWidth: 120 },
    {
      id: 'clientId',
      label: 'Client',
      minWidth: 170,
      format: (_value, row) => {
        const job = mockJobOrders.find((j) => j.id === row.jobOrderId);
        return job?.clientName || 'N/A';
      },
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      format: (value: number) => `$${value}`,
    },
    {
      id: 'method',
      label: 'Payment Method',
      minWidth: 150,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => getStatusChip(value),
    },
    {
      id: 'createdAt',
      label: 'Date',
      minWidth: 130,
      format: (value: Date) => format(value, 'MMM dd, yyyy'),
    },
  ];

  const handleRowClick = (_row: Payment) => {
    // Navigate to payment detail if needed
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Accountant Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage payment verification and invoice generation
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
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Pending Verifications
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {pendingPayments.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Awaiting confirmation
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PaymentIcon sx={{ fontSize: 32 }} />
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
              background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Confirmed This Month
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {confirmedThisMonth.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <InvoiceIcon sx={{ fontSize: 32 }} />
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
              background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Failed Payments
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {failedPayments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <ErrorIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Verification Queue */}
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
            Payment Verification Queue
          </Typography>
          <Box sx={{ mt: 2 }}>
            <DataTable
              columns={columns}
              data={mockPayments}
              onRowClick={handleRowClick}
              searchPlaceholder="Search by Job ID, Client..."
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};



