import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip, Button } from '@mui/material';
import { PendingActions as PendingIcon, CheckCircle as ApprovedIcon, TrendingUp as PerformanceIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BarChart } from '@mui/x-charts/BarChart';

export const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, approveJobOrder, rejectJobOrder } = useAppContext();
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for jobOrders updates and force refresh
  useEffect(() => {
    const handleUpdate = () => {
      // Force component to re-read from context
      console.log('SupervisorDashboard - jobOrdersUpdated event received, refreshing...');
      setRefreshKey(prev => prev + 1);
    };
    
    const handleNotificationsUpdate = () => {
      // Also refresh when notifications are updated (new service request creates notifications)
      console.log('SupervisorDashboard - notificationsUpdated event received, refreshing...');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('jobOrdersUpdated', handleUpdate);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
    
    // Also listen for storage events (in case localStorage is updated from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobOrders' || e.key === 'notifications') {
        console.log('SupervisorDashboard - Storage event received for', e.key);
        setRefreshKey(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('jobOrdersUpdated', handleUpdate);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const pendingApprovals = useMemo(() => {
    const filtered = jobOrders.filter((job) => job.status === 'Completed' || job.status === 'Pending');
    console.log('SupervisorDashboard - Filtered pending approvals:', filtered.length, 'out of', jobOrders.length, 'total jobs');
    console.log('SupervisorDashboard - Job statuses:', jobOrders.map(j => ({ id: j.id, status: j.status, createdBy: j.assignedToName })));
    return filtered;
  }, [jobOrders, refreshKey]);
  
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
      id: 'status',
      label: 'Status',
      minWidth: 150,
      format: (value: any, row: JobOrder) => {
        // Determine approval type based on status and reportData
        if (row.status === 'Pending' && !row.reportData) {
          // Job Order needs approval (before execution)
          return (
            <Chip 
              label="Job Order Approval" 
              size="small" 
              sx={{
                bgcolor: '#3498db',
                color: 'white',
                fontWeight: 600,
              }}
            />
          );
        } else if (row.status === 'Completed' && row.reportData) {
          // Report needs approval (after execution)
          return (
            <Chip 
              label="Report Approval" 
              size="small" 
              sx={{
                bgcolor: '#1e3c72',
                color: 'white',
                fontWeight: 600,
              }}
            />
          );
        } else {
          return <Chip label={value} size="small" />;
        }
      },
    },
    {
      id: 'dateTime',
      label: 'Submission Date',
      minWidth: 150,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    { id: 'clientName', label: 'Client', minWidth: 170 },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      align: 'center' as const,
      format: (value: any, row: JobOrder) => {
        const isJobOrderApproval = row.status === 'Pending' && !row.reportData;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {isJobOrderApproval ? (
              // Job Order Approval Actions
              <>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(row);
                  }}
                  sx={{
                    bgcolor: '#1e3c72',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#0e2c62',
                    },
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RejectIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(row);
                  }}
                  sx={{
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': {
                      borderColor: '#c62828',
                      bgcolor: 'rgba(211, 47, 47, 0.04)',
                    },
                  }}
                >
                  Reject
                </Button>
              </>
            ) : (
              // Report Approval - View Details
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/supervisor/approvals/${row.id}`);
                }}
                sx={{
                  borderColor: '#1e3c72',
                  color: '#1e3c72',
                  '&:hover': {
                    borderColor: '#0e2c62',
                    bgcolor: 'rgba(30, 60, 114, 0.04)',
                  },
                }}
              >
                View Report
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const handleApprove = (job: JobOrder) => {
    if (confirm(`Are you sure you want to approve job order ${job.id}?`)) {
      if (approveJobOrder) {
        approveJobOrder(job.id);
        setRefreshKey(prev => prev + 1);
      }
    }
  };

  const handleReject = (job: JobOrder) => {
    const reason = prompt(`Enter reason for rejecting job order ${job.id}:`);
    if (reason && rejectJobOrder) {
      rejectJobOrder(job.id, reason);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRowClick = (row: JobOrder) => {
    // Only navigate for report approvals
    if (row.status === 'Completed' && row.reportData) {
      navigate(`/supervisor/approvals/${row.id}`);
    }
  };

  // Mock team performance data
  const teamPerformanceData = [
    { inspector: 'Jane I.', completed: 12 },
    { inspector: 'John D.', completed: 8 },
    { inspector: 'Mike T.', completed: 10 },
    { inspector: 'Sarah L.', completed: 15 },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          fontWeight={700} 
          sx={{ 
            color: 'text.primary',
            mb: 1,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Supervisor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
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
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.875rem' }}>
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
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.875rem' }}>
                    Approved This Month
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {approvedThisMonth}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Successfully approved
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
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.875rem' }}>
                    Approval Rate
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {approvalRate}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Overall performance
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
                p: 3,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  Approval Queue
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {pendingApprovals.length} {pendingApprovals.length === 1 ? 'item' : 'items'} pending review
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 4 }}>
              {pendingApprovals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <PendingIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.4 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
                    No Pending Approvals
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All job orders and reports have been reviewed
                  </Typography>
                </Box>
              ) : (
                <DataTable
                  columns={columns}
                  data={pendingApprovals}
                  onRowClick={handleRowClick}
                  searchPlaceholder="Search by Job ID, Inspector, Service Type..."
                />
              )}
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
                p: 3,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  Team Performance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Jobs completed this month
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 4 }}>
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
                    color: '#1e3c72',
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



