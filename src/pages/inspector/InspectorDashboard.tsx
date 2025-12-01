import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Assignment as JobIcon, CheckCircle as CompletedIcon, PendingActions as PendingIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const InspectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders } = useAppContext();

  // Filter job orders for inspector
  const assignedJobs = jobOrders.filter(
    (job) => job.assignedTo === 'user-2' // Mock inspector user
  );

  const completedThisWeek = assignedJobs.filter(
    (job) => job.status === 'Completed' || job.status === 'Approved'
  ).length;

  const pendingApproval = assignedJobs.filter(
    (job) => job.status === 'Completed'
  ).length;

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
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (value) => getStatusChip(value || 'Medium', {
        High: 'error',
        Medium: 'warning',
        Low: 'success',
      }),
    },
  ];

  const handleRowClick = (row: JobOrder) => {
    navigate(`/inspector/jobs/${row.id}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Inspector Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your assigned job orders and submit inspection reports
      </Typography>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Assigned Jobs"
            value={assignedJobs.length}
            icon={<JobIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Completed This Week"
            value={completedThisWeek}
            icon={<CompletedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Pending Approval"
            value={pendingApproval}
            icon={<PendingIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Job Orders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Assigned Job Orders
          </Typography>
          <Box sx={{ mt: 2 }}>
            <DataTable
              columns={columns}
              data={assignedJobs}
              onRowClick={handleRowClick}
              searchPlaceholder="Search by Job ID, Client, Service Type..."
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

