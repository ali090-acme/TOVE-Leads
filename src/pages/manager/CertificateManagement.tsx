import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Checkbox,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { Certificate } from '@/types';
import { format } from 'date-fns';
import {
  Download as DownloadIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { bulkDownloadCertificates } from '@/utils/bulkDownload';
import { exportCertificateAsPDF, exportCertificateAsImage } from '@/utils/certificateExport';
import { logUserAction } from '@/utils/activityLogger';

export const CertificateManagement: React.FC = () => {
  const { certificates, currentUser } = useAppContext();
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSelectAll = () => {
    if (selectedCertificates.size === certificates.length) {
      setSelectedCertificates(new Set());
    } else {
      setSelectedCertificates(new Set(certificates.map((c) => c.id)));
    }
  };

  const handleSelectCertificate = (certId: string) => {
    const newSelected = new Set(selectedCertificates);
    if (newSelected.has(certId)) {
      newSelected.delete(certId);
    } else {
      newSelected.add(certId);
    }
    setSelectedCertificates(newSelected);
  };

  const handleBulkDownload = async (format: 'PDF' | 'IMAGE') => {
    if (selectedCertificates.size === 0) {
      setSnackbar({ open: true, message: 'Please select at least one certificate', severity: 'error' });
      return;
    }

    setIsDownloading(true);
    setBulkMenuAnchor(null);

    try {
      const selectedCerts = certificates.filter((c) => selectedCertificates.has(c.id));
      await bulkDownloadCertificates(selectedCerts, format);

      // Log activity
      logUserAction(
        'DOWNLOAD',
        'CERTIFICATE',
        null,
        `Bulk download of ${selectedCerts.length} certificates`,
        `Downloaded ${selectedCerts.length} certificates as ${format}`,
        { count: selectedCerts.length, format },
        currentUser?.id,
        currentUser?.name,
        currentUser?.currentRole
      );

      setSnackbar({
        open: true,
        message: `Successfully downloaded ${selectedCerts.length} certificate(s) as ${format}`,
        severity: 'success',
      });
      setSelectedCertificates(new Set());
    } catch (error) {
      console.error('Bulk download error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download certificates. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSingleDownload = async (cert: Certificate, format: 'PDF' | 'IMAGE') => {
    try {
      if (format === 'PDF') {
        await exportCertificateAsPDF(cert);
      } else {
        await exportCertificateAsImage(cert);
      }

      // Log activity
      logUserAction(
        'DOWNLOAD',
        'CERTIFICATE',
        cert.id,
        cert.certificateNumber,
        `Downloaded certificate as ${format}`,
        { format },
        currentUser?.id,
        currentUser?.name,
        currentUser?.currentRole
      );
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const columns: Column<Certificate>[] = [
    {
      id: 'id',
      label: '',
      minWidth: 50,
      format: (_value, row) => (
        <Checkbox
          checked={selectedCertificates.has(row.id)}
          onChange={() => handleSelectCertificate(row.id)}
          size="small"
        />
      ),
    },
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
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            const menuAnchor = e.currentTarget;
            setBulkMenuAnchor(menuAnchor);
            // Store certificate for single download
            (menuAnchor as any).cert = row;
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            Certificate Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, manage, and download all issued certificates
          </Typography>
        </Box>
        {selectedCertificates.size > 0 && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {selectedCertificates.size} selected
            </Typography>
            <Button
              variant="contained"
              startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
              disabled={isDownloading}
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                },
              }}
            >
              {isDownloading ? 'Downloading...' : 'Bulk Download'}
            </Button>
          </Box>
        )}
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Certificates ({certificates.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Checkbox
              checked={certificates.length > 0 && selectedCertificates.size === certificates.length}
              indeterminate={selectedCertificates.size > 0 && selectedCertificates.size < certificates.length}
              onChange={handleSelectAll}
              sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
            />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Select All
            </Typography>
          </Box>
        </Box>
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

      {/* Bulk Download Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        {selectedCertificates.size > 0 ? (
          <>
            <MenuItem onClick={() => handleBulkDownload('PDF')}>
              <DownloadIcon sx={{ mr: 1 }} />
              Download Selected as PDF (ZIP)
            </MenuItem>
            <MenuItem onClick={() => handleBulkDownload('IMAGE')}>
              <DownloadIcon sx={{ mr: 1 }} />
              Download Selected as Image (ZIP)
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              onClick={() => {
                const cert = (bulkMenuAnchor as any)?.cert;
                if (cert) {
                  handleSingleDownload(cert, 'PDF');
                }
                setBulkMenuAnchor(null);
              }}
            >
              <DownloadIcon sx={{ mr: 1 }} />
              Download as PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                const cert = (bulkMenuAnchor as any)?.cert;
                if (cert) {
                  handleSingleDownload(cert, 'IMAGE');
                }
                setBulkMenuAnchor(null);
              }}
            >
              <DownloadIcon sx={{ mr: 1 }} />
              Download as Image
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
