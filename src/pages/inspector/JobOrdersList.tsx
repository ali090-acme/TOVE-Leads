import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Skeleton } from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const JobOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, currentUser } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter jobs assigned to current inspector
  const assignedJobs = jobOrders.filter((job) => 
    job.assignedTo === currentUser?.id || job.assignedTo === 'user-2' // Fallback for mock data
  );

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
  ];

  const handleRowClick = (row: JobOrder) => {
    navigate(`/inspector/jobs/${row.id}`);
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={400} height={30} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            All Job Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your assigned job orders
          </Typography>
        </Box>
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

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          {assignedJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Job Orders Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You don't have any assigned job orders yet. Create a new job order to get started.
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
        </CardContent>
      </Card>
    </Box>
  );
};



