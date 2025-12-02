import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Skeleton, Avatar } from '@mui/material';
import { 
  Assignment as JobIcon, 
  CheckCircle as CompletedIcon, 
  PendingActions as PendingIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const InspectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, currentUser } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter job orders for current inspector
  const assignedJobs = jobOrders.filter(
    (job) => job.assignedTo === currentUser?.id || job.assignedTo === 'user-2' // Fallback for mock data
  );

  const completedThisWeek = assignedJobs.filter(
    (job) => job.status === 'Completed' || job.status === 'Approved'
  ).length;

  const pendingApproval = assignedJobs.filter(
    (job) => job.status === 'Completed'
  ).length;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={400} height={30} sx={{ mb: 4 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Inspector Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your assigned job orders and submit inspection reports
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
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Assigned Jobs
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {assignedJobs.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <JobIcon sx={{ fontSize: 32 }} />
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
                    Completed This Week
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {completedThisWeek}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <CompletedIcon sx={{ fontSize: 32 }} />
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
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Pending Approval
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {pendingApproval}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PendingIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Job Orders Table */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Assigned Job Orders
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/inspector/jobs/new')}
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                },
              }}
            >
              Create New Job
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            {assignedJobs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Job Orders Assigned
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You don't have any assigned job orders yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/inspector/jobs/new')}
                  sx={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                    },
                  }}
                >
                  Create Your First Job Order
                </Button>
              </Box>
            ) : (
              <DataTable
                columns={columns}
                data={assignedJobs}
                onRowClick={handleRowClick}
                searchPlaceholder="Search by Job ID, Client, Service Type..."
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

