import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, IconButton } from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const ApprovalsList: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, approveJobOrder, rejectJobOrder } = useAppContext();
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for jobOrders updates and force refresh
  useEffect(() => {
    const handleUpdate = () => {
      // Force component to re-read from context
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('jobOrdersUpdated', handleUpdate);
    
    // Also listen for storage events (in case localStorage is updated from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobOrders') {
        setRefreshKey(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('jobOrdersUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Show job orders that need approval: Pending (newly created) or Completed (report submitted)
  // useMemo ensures re-render when jobOrders changes
  const pendingApprovals = useMemo(() => {
    const filtered = jobOrders.filter((job) => 
      job.status === 'Pending' || job.status === 'Completed'
    );
    console.log('ApprovalsList - Filtered pending approvals:', filtered.length, 'out of', jobOrders.length, 'total jobs');
    console.log('ApprovalsList - All job statuses:');
    jobOrders.forEach(j => {
      console.log(`  ${j.id}: status="${j.status}", assignedTo="${j.assignedToName}", client="${j.clientName}"`);
    });
    console.log('ApprovalsList - Showing these jobs (Pending or Completed):');
    filtered.forEach(j => {
      console.log(`  ✅ ${j.id}: status="${j.status}", assignedTo="${j.assignedToName}"`);
    });
    return filtered;
  }, [jobOrders, refreshKey]);

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
          return <Chip label="Job Order Approval" size="small" color="warning" />;
        } else if (row.status === 'Completed' && row.reportData) {
          // Report needs approval (after execution)
          return <Chip label="Report Approval" size="small" color="info" />;
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
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(row);
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(row);
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



