import React, { useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip } from '@mui/material';
import { PendingActions as PendingIcon, CheckCircle as ApprovedIcon, TrendingUp as PerformanceIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BarChart } from '@mui/x-charts/BarChart';

export const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders } = useAppContext();

  const pendingApprovals = useMemo(() => {
    return jobOrders.filter((job) => job.status === 'Completed' || job.status === 'Pending');
  }, [jobOrders]);
  
  const approvedThisMonth = useMemo(() => {
    return jobOrders.filter((job) => job.status === 'Approved').length;
  }, [jobOrders]);
  
  const approvalRate = useMemo(() => {
    return jobOrders.length > 0 ? Math.round((approvedThisMonth / jobOrders.length) * 100) : 0;
  }, [jobOrders.length, approvedThisMonth]);

  const columns: Column<JobOrder>[] = [
    { id: 'id', label: 'Job ID', minWidth: 120 },
    { id: 'assignedToName', label: 'Inspector/Trainer', minWidth: 150 },
    {
      id: 'serviceTypes',
      label: 'Service Types',
      minWidth: 200,
      format: (value: any) => {
        if (!value || !Array.isArray(value)) return '-';
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {value.map((type: string) => (
              <Chip key={type} label={type} size="small" color="primary" />
            ))}
          </Box>
        );
      },
    },
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Supervisor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve inspection reports and monitor team performance
        </Typography>
      </Box>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
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
                    Pending Approvals
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {pendingApprovals.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Awaiting your review
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PendingIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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
                    Approved This Month
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {approvedThisMonth}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <ApprovedIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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
                    Approval Rate
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {approvalRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PerformanceIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Approval Queue */}
        <Grid item xs={12} lg={8}>
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
          <Card elevation={2} sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
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



