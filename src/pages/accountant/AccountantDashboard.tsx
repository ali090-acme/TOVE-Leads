import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Payment as PaymentIcon, Receipt as InvoiceIcon, TrendingUp as RevenueIcon } from '@mui/icons-material';
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
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Accountant Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage payment verification and invoice generation
      </Typography>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Pending Verifications"
            value={pendingPayments.length}
            icon={<PaymentIcon />}
            color="warning.main"
            subtitle="Awaiting confirmation"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Confirmed This Month"
            value={confirmedThisMonth.length}
            icon={<InvoiceIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<RevenueIcon />}
            color="primary.main"
            subtitle="This month"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Failed Payments"
            value={failedPayments}
            icon={<PaymentIcon />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Payment Verification Queue */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
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



