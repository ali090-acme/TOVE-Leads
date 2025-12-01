import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { Payment } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const PaymentsList: React.FC = () => {
  const navigate = useNavigate();
  const { payments, jobOrders } = useAppContext();

  const columns: Column<Payment>[] = [
    { id: 'jobOrderId', label: 'Job Order ID', minWidth: 120 },
    {
      id: 'clientId',
      label: 'Client',
      minWidth: 170,
      format: (_value, row) => {
        const job = jobOrders.find((j) => j.id === row.jobOrderId);
        return job?.clientName || 'N/A';
      },
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      format: (value) => `$${value}`,
    },
    { id: 'method', label: 'Payment Method', minWidth: 150 },
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
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
  ];

  const handleRowClick = (row: Payment) => {
    if (row.status === 'Pending') {
      navigate(`/accountant/payments/${row.id}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Payment Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and verify all payment transactions
      </Typography>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={payments}
            onRowClick={handleRowClick}
            searchPlaceholder="Search by Job ID, Client..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};



