import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const ApprovalsList: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders } = useAppContext();

  const pendingApprovals = jobOrders.filter((job) => job.status === 'Completed');

  const columns: Column<JobOrder>[] = [
    { id: 'id', label: 'Job ID', minWidth: 120 },
    { id: 'assignedToName', label: 'Inspector/Trainer', minWidth: 150 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'dateTime',
      label: 'Submission Date',
      minWidth: 150,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    { id: 'clientName', label: 'Client', minWidth: 170 },
  ];

  const handleRowClick = (row: JobOrder) => {
    navigate(`/supervisor/approvals/${row.id}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Approval Queue
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and approve pending inspection and assessment reports
      </Typography>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={pendingApprovals}
            onRowClick={handleRowClick}
            searchPlaceholder="Search by Job ID, Inspector, Client..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};



