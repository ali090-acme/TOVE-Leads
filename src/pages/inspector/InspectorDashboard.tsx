import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Skeleton, Avatar } from '@mui/material';
import {
  Assignment as JobIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, User, ServiceType } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getSyncStatus, syncOfflineQueue, isOnline } from '@/utils/offlineQueue';
import { CloudOff as CloudOffIcon, CloudDone as CloudDoneIcon, Sync as SyncIcon } from '@mui/icons-material';
import { Alert, Chip } from '@mui/material';

export const InspectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, currentUser, users } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [, forceUpdate] = useState({});

  // Listen for jobOrders updates
  useEffect(() => {
    const handleUpdate = () => {
      forceUpdate({});
    };
    window.addEventListener('jobOrdersUpdated', handleUpdate);
    return () => window.removeEventListener('jobOrdersUpdated', handleUpdate);
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
    return jobOrders.filter((job) => {
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

      {/* Delegation Status */}
      {activeDelegation && (
        <Alert
          severity="info"
          icon={<SecurityIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2">
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
          sx={{ mb: 3 }}
          action={
            syncStatus.isOnline && !syncing ? (
              <Button
                color="inherit"
                size="small"
                startIcon={<SyncIcon />}
                onClick={handleManualSync}
              >
                Sync Now
              </Button>
            ) : syncing ? (
              <Chip label="Syncing..." size="small" />
            ) : null
          }
        >
          <Typography variant="body2">
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s',
              },
            }}
            onClick={() => navigate('/inspector/schedule')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    View Schedule
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    Calendar
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <CalendarIcon sx={{ fontSize: 32 }} />
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

