import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Skeleton, Avatar } from '@mui/material';
import {
  Assignment as JobIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, User, ServiceType } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getSyncStatus, syncOfflineQueue, isOnline } from '@/utils/offlineQueue';
import { CloudOff as CloudOffIcon, CloudDone as CloudDoneIcon, Sync as SyncIcon } from '@mui/icons-material';
import { Alert, Chip, IconButton, Tooltip } from '@mui/material';
import { canCreateJobOrder } from '@/utils/permissions';
import { exportReportAsPDF, getReportType } from '@/utils/reportExport';

export const InspectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, currentUser, users } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [, forceUpdate] = useState({});

  // Listen for jobOrders updates and storage changes
  useEffect(() => {
    const handleUpdate = () => {
      console.log('InspectorDashboard - jobOrdersUpdated event received, refreshing...');
      forceUpdate({});
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobOrders') {
        console.log('InspectorDashboard - localStorage jobOrders changed, refreshing...');
        forceUpdate({});
      }
    };
    
    window.addEventListener('jobOrdersUpdated', handleUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('jobOrdersUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load users from localStorage to get latest delegation data
  const [localUsers, setLocalUsers] = React.useState<User[]>(() => {
    const stored = localStorage.getItem('users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed;
      } catch (e) {
        console.error('Failed to parse users from localStorage', e);
        return users;
      }
    }
    return users;
  });

  // Sync users from localStorage
  React.useEffect(() => {
    const loadUsers = () => {
      const stored = localStorage.getItem('users');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLocalUsers(parsed);
        } catch (e) {
          console.error('Failed to parse users from localStorage', e);
        }
      }
    };

    // Load on mount
    loadUsers();

    // Listen for storage changes (when delegation is updated)
    window.addEventListener('storage', loadUsers);
    // Listen for custom event when users are updated
    window.addEventListener('usersUpdated', loadUsers);
    
    // Also check periodically (every 3 seconds)
    const interval = setInterval(loadUsers, 3000);

    return () => {
      window.removeEventListener('storage', loadUsers);
      window.removeEventListener('usersUpdated', loadUsers);
      clearInterval(interval);
    };
  }, []);

  // Check if current inspector is delegated to perform actions on behalf of someone
  const activeDelegation = React.useMemo(() => {
    if (!currentUser) return null;
    
    // Find if any user has delegated to this inspector (check multiple delegates)
    const delegatingUser = localUsers.find((u) => {
      if (!u.delegation?.active) return false;
      
      // Check new delegates array
      if (u.delegation.delegates && u.delegation.delegates.length > 0) {
        return u.delegation.delegates.some(
          (delegate) => delegate.userId === currentUser.id && delegate.active
        );
      }
      
      // Legacy: check old delegatedToId field for backward compatibility
      return u.delegation.delegatedToId === currentUser.id;
    });
    
    if (!delegatingUser || !delegatingUser.delegation) return null;
    
    // Find which delegate this user is (priority)
    const delegateInfo = delegatingUser.delegation.delegates?.find(
      (d) => d.userId === currentUser.id
    );
    
    return {
      ...delegatingUser.delegation,
      delegatingUserName: delegatingUser.name,
      currentDelegatePriority: delegateInfo?.priority || 1,
      isPrimaryShadow: delegateInfo?.priority === 1,
    };
  }, [currentUser, localUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Monitor sync status
  useEffect(() => {
    const updateSyncStatus = () => {
      setSyncStatus(getSyncStatus());
    };

    // Update on mount
    updateSyncStatus();

    // Listen for sync events
    window.addEventListener('offlineQueueSynced', updateSyncStatus);
    window.addEventListener('online', updateSyncStatus);
    window.addEventListener('offline', updateSyncStatus);

    // Update periodically
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      window.removeEventListener('offlineQueueSynced', updateSyncStatus);
      window.removeEventListener('online', updateSyncStatus);
      window.removeEventListener('offline', updateSyncStatus);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline()) {
      return;
    }
    setSyncing(true);
    try {
      await syncOfflineQueue();
      setSyncStatus(getSyncStatus());
    } catch (error) {
      console.error('Failed to sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Filter job orders for current inspector - useMemo to ensure re-render on jobOrders change
  const assignedJobs = useMemo(() => {
    const assigned = jobOrders.filter((job) => {
      // Check if assigned via assignedTo field (legacy/single assignment)
      if (job.assignedTo === currentUser?.id || job.assignedTo === 'user-2') {
        return true;
      }
      // Check if assigned via assignments object (multiple assignments support)
      if (job.assignments?.inspector?.userId === currentUser?.id) {
        return true;
      }
      return false;
    });
    
    console.log('InspectorDashboard - Total job orders:', jobOrders.length);
    console.log('InspectorDashboard - Current user ID:', currentUser?.id);
    console.log('InspectorDashboard - Assigned jobs (all statuses):', assigned.length);
    console.log('InspectorDashboard - Job details:');
    assigned.forEach(j => {
      console.log(`  ${j.id}: status="${j.status}", assignedTo="${j.assignedTo}", client="${j.clientName}"`);
    });
    
    return assigned;
  }, [jobOrders, currentUser?.id]);

  const completedThisWeek = useMemo(() => {
    return assignedJobs.filter(
      (job) => job.status === 'Completed' || job.status === 'Approved'
    ).length;
  }, [assignedJobs]);

  const pendingApproval = useMemo(() => {
    return assignedJobs.filter(
      (job) => job.status === 'Completed'
    ).length;
  }, [assignedJobs]);

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
    {
      id: 'serviceTypes',
      label: 'Service Types',
      minWidth: 200,
      format: (value: ServiceType[]) => {
        if (!value || !Array.isArray(value)) return '-';
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {value.map((type) => (
              <Chip key={type} label={type} size="small" color="primary" />
            ))}
          </Box>
        );
      },
    },
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
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      format: (value, row: JobOrder) => {
        // Show download button only for completed jobs
        if (row.status === 'Completed' && getReportType(row)) {
          return (
            <Tooltip title={`Download ${getReportType(row)} PDF`}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
                  exportReportAsPDF(row);
                }}
                sx={{
                  backgroundColor: '#1e3c72',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#0e2c62',
                  },
                }}
              >
                <PdfIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }
        return '-';
      },
    },
  ];

  const handleRowClick = (row: JobOrder) => {
    navigate(`/inspector/jobs/${row.id}`);
  };

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
          Inspector Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
          Manage your assigned job orders and submit inspection reports
        </Typography>
      </Box>

      {/* Delegation Status */}
      {activeDelegation && (
        <Alert
          severity="info"
          icon={<SecurityIcon />}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            bgcolor: '#e3f2fd',
            border: '1px solid',
            borderColor: '#1e3c72',
            '& .MuiAlert-icon': {
              color: '#1e3c72',
            },
          }}
        >
          <Typography variant="body2" sx={{ color: '#2c3e50' }}>
            <strong>Shadow Role Active:</strong> You are performing actions on behalf of{' '}
            <strong>{(activeDelegation as any).delegatingUserName || activeDelegation.delegatedByName}</strong>.
            {activeDelegation.delegates && activeDelegation.delegates.length > 1 && (
              <> You are <strong>Shadow {(activeDelegation as any).currentDelegatePriority || 1}</strong>
                {(activeDelegation as any).isPrimaryShadow 
                  ? ' (Primary - will perform actions if available)' 
                  : ` (Will perform actions if Shadow ${((activeDelegation as any).currentDelegatePriority || 1) - 1} is busy)`}
              </>
            )}
            {' '}Your actions will appear as "{(activeDelegation as any).delegatingUserName || activeDelegation.delegatedByName}" 
            in the front end, but activity logs will show your name ({currentUser?.name}) for accountability.
          </Typography>
        </Alert>
      )}

      {/* Offline Queue Status */}
      {syncStatus.pendingItems > 0 && (
        <Alert
          severity={syncStatus.isOnline ? 'info' : 'warning'}
          icon={syncStatus.isOnline ? <CloudDoneIcon /> : <CloudOffIcon />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            bgcolor: syncStatus.isOnline ? '#e3f2fd' : '#fff3e0',
            border: '1px solid',
            borderColor: syncStatus.isOnline ? '#1e3c72' : '#e67e22',
            '& .MuiAlert-icon': {
              color: syncStatus.isOnline ? '#1e3c72' : '#e67e22',
            },
          }}
          action={
            syncStatus.isOnline && !syncing ? (
              <Button
                size="small"
                startIcon={<SyncIcon />}
                onClick={handleManualSync}
                sx={{
                  bgcolor: '#1e3c72',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#0e2c62',
                  },
                }}
              >
                Sync Now
              </Button>
            ) : syncing ? (
              <Chip label="Syncing..." size="small" sx={{ bgcolor: '#1e3c72', color: 'white' }} />
            ) : null
          }
        >
          <Typography variant="body2" sx={{ color: syncStatus.isOnline ? '#2c3e50' : '#d35400' }}>
            <strong>{syncStatus.pendingItems} job order(s)</strong> {syncStatus.isOnline ? 'pending sync' : 'saved offline'}
            {syncStatus.lastSyncTime && syncStatus.isOnline && (
              <span> • Last synced: {format(syncStatus.lastSyncTime, 'MMM dd, HH:mm')}</span>
            )}
          </Typography>
        </Alert>
      )}

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
            onClick={() => navigate('/inspector/schedule')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <CalendarIcon sx={{ fontSize: 36 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                View Schedule
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Check your calendar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
                    Assigned Jobs
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {assignedJobs.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Total assignments
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <JobIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
                    Completed This Week
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {completedThisWeek}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Successfully finished
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <CompletedIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
                    Pending Approval
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {pendingApproval}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    Awaiting review
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
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Assigned Job Orders
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {assignedJobs.length} {assignedJobs.length === 1 ? 'job' : 'jobs'} assigned to you
              </Typography>
            </Box>
            {canCreateJobOrder(currentUser) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/inspector/jobs/new')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Create New Job
              </Button>
            )}
          </Box>
        </Box>
        <CardContent sx={{ p: 4 }}>
          {assignedJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <JobIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.4 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
                No Job Orders Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                {canCreateJobOrder(currentUser) 
                  ? "You don't have any assigned job orders yet. Create a new job order to get started." 
                  : "You don't have any assigned job orders yet. Contact your supervisor to get assigned."}
              </Typography>
              {canCreateJobOrder(currentUser) && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/inspector/jobs/new')}
                  sx={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                      boxShadow: '0 6px 20px rgba(30, 60, 114, 0.4)',
                    },
                  }}
                >
                  Create Your First Job Order
                </Button>
              )}
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={assignedJobs}
              onRowClick={handleRowClick}
              searchPlaceholder="Search by Job ID, Client, Service Type..."
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};


