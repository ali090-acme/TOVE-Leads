import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format } from 'date-fns';
import { Download as DownloadIcon } from '@mui/icons-material';

export const InvoiceManagement: React.FC = () => {
  const { jobOrders } = useAppContext();

  const paidJobs = jobOrders.filter((job) => job.status === 'Paid');

  const columns: Column<JobOrder>[] = [
    { id: 'id', label: 'Job ID', minWidth: 120 },
    { id: 'clientName', label: 'Client', minWidth: 170 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      format: (value) => value ? `$${value}` : 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => getStatusChip(value),
    },
    {
      id: 'dateTime',
      label: 'Date',
      minWidth: 130,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 150,
      format: (_value, row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={(e) => {
            e.stopPropagation();
            alert(`Generating invoice for ${row.id}`);
          }}
        >
          Generate Invoice
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Invoice Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate and manage invoices for completed services
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
          {paidJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Paid Jobs Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoices can be generated once jobs are marked as paid.
              </Typography>
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={paidJobs}
              searchPlaceholder="Search by Job ID, Client..."
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};



