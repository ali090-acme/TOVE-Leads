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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Certificate Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, manage, and download all issued certificates
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
          {certificates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Certificates Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certificates will appear here once they are issued.
              </Typography>
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={certificates}
              searchPlaceholder="Search by certificate number, client..."
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};



