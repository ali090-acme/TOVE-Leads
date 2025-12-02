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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Approval Queue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve pending inspection and assessment reports
        </Typography>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          {pendingApprovals.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Pending Approvals
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All reports have been reviewed and approved.
              </Typography>
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={pendingApprovals}
              onRowClick={handleRowClick}
              searchPlaceholder="Search by Job ID, Inspector, Client..."
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};



