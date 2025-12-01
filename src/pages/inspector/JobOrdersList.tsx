import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const JobOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders } = useAppContext();

  const assignedJobs = jobOrders.filter((job) => job.assignedTo === 'user-2');

  const columns: Column<JobOrder>[] = [
    { id: 'id', label: 'Job ID', minWidth: 120 },
    { id: 'clientName', label: 'Client Name', minWidth: 170 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      format: (value) => getStatusChip(value),
    },
    {
      id: 'dateTime',
      label: 'Scheduled Date',
      minWidth: 150,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
  ];

  const handleRowClick = (row: JobOrder) => {
    navigate(`/inspector/jobs/${row.id}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        All Job Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your assigned job orders
      </Typography>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={assignedJobs}
            onRowClick={handleRowClick}
            searchPlaceholder="Search by Job ID, Client, Service Type..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};



