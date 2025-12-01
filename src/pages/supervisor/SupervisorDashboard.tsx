import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { PendingActions as PendingIcon, CheckCircle as ApprovedIcon, TrendingUp as PerformanceIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column } from '@/components/common/DataTable';
import { mockJobOrders } from '@/utils/mockData';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BarChart } from '@mui/x-charts/BarChart';

export const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const pendingApprovals = mockJobOrders.filter((job) => job.status === 'Completed');
  const approvedThisMonth = mockJobOrders.filter((job) => job.status === 'Approved').length;
  const approvalRate = Math.round((approvedThisMonth / mockJobOrders.length) * 100);

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

  // Mock team performance data
  const teamPerformanceData = [
    { inspector: 'Jane I.', completed: 12 },
    { inspector: 'John D.', completed: 8 },
    { inspector: 'Mike T.', completed: 10 },
    { inspector: 'Sarah L.', completed: 15 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Supervisor Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and approve inspection reports and monitor team performance
      </Typography>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Pending Approvals"
            value={pendingApprovals.length}
            icon={<PendingIcon />}
            color="warning.main"
            subtitle="Awaiting your review"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Approved This Month"
            value={approvedThisMonth}
            icon={<ApprovedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Approval Rate"
            value={`${approvalRate}%`}
            icon={<PerformanceIcon />}
            color="primary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Approval Queue */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Approval Queue
              </Typography>
              <Box sx={{ mt: 2 }}>
                <DataTable
                  columns={columns}
                  data={pendingApprovals}
                  onRowClick={handleRowClick}
                  searchPlaceholder="Search by Job ID, Inspector, Service Type..."
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Team Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Jobs completed this month
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: teamPerformanceData.map((d) => d.inspector),
                  },
                ]}
                series={[
                  {
                    data: teamPerformanceData.map((d) => d.completed),
                    color: '#1976d2',
                  },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



