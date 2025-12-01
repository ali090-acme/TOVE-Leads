import React from 'react';
import { Box, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { Certificate } from '@/types';
import { format } from 'date-fns';
import { Download as DownloadIcon } from '@mui/icons-material';

export const CertificateManagement: React.FC = () => {
  const { certificates } = useAppContext();

  const columns: Column<Certificate>[] = [
    { id: 'certificateNumber', label: 'Certificate Number', minWidth: 150 },
    { id: 'clientName', label: 'Client', minWidth: 170 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'issueDate',
      label: 'Issue Date',
      minWidth: 130,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      minWidth: 130,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          color={value === 'Valid' ? 'success' : value === 'Expired' ? 'error' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 120,
      format: (_value, row) => (
        <Button
          size="small"
          variant="text"
          startIcon={<DownloadIcon />}
          onClick={(e) => {
            e.stopPropagation();
            alert(`Downloading certificate ${row.certificateNumber}`);
          }}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Certificate Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View, manage, and download all issued certificates
      </Typography>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={certificates}
            searchPlaceholder="Search by certificate number, client..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};



