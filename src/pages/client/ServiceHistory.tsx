import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';

export const ServiceHistory: React.FC = () => {
  const { jobOrders } = useAppContext();

  const columns: Column<JobOrder>[] = [
    { id: 'id', label: 'Job ID', minWidth: 120 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => getStatusChip(value),
    },
    {
      id: 'dateTime',
      label: 'Date',
      minWidth: 150,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      format: (value) => value ? `$${value}` : 'N/A',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Service History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View all your past inspections, assessments, and training sessions
      </Typography>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={jobOrders}
            searchPlaceholder="Search by Job ID, Service Type..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};



