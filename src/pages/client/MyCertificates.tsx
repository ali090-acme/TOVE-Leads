import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Checkbox,
  Chip,
  Grid,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { Certificate } from '@/types';
import { bulkDownloadCertificates } from '@/utils/bulkDownload';
import { exportCertificateAsPDF, exportCertificateAsImage } from '@/utils/certificateExport';
import { logUserAction } from '@/utils/activityLogger';

export const MyCertificates: React.FC = () => {
  const navigate = useNavigate();
  const { certificates, currentUser } = useAppContext();
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);
  const [singleMenuAnchor, setSingleMenuAnchor] = useState<{ anchor: HTMLElement; cert: Certificate } | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter certificates based on search
  const filteredCertificates = certificates.filter((cert) => {
    const searchLower = searchText.toLowerCase();
    return (
      cert.certificateNumber.toLowerCase().includes(searchLower) ||
      cert.serviceType.toLowerCase().includes(searchLower) ||
      cert.clientName.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectAll = () => {
    if (selectedCertificates.size === filteredCertificates.length) {
      setSelectedCertificates(new Set());
    } else {
      setSelectedCertificates(new Set(filteredCertificates.map((c) => c.id)));
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
    setSingleMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'success';
      case 'Expired':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/client')} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              My Certificates
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and download all your certificates
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
      </Box>

      {/* Search and Select All */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search certificates..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
              <Checkbox
                checked={filteredCertificates.length > 0 && selectedCertificates.size === filteredCertificates.length}
                indeterminate={selectedCertificates.size > 0 && selectedCertificates.size < filteredCertificates.length}
                onChange={handleSelectAll}
              />
              <Typography variant="body2" color="text.secondary">
                Select All ({filteredCertificates.length})
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Certificates List */}
      {filteredCertificates.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Certificates Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText ? 'No certificates match your search.' : 'You don\'t have any certificates yet.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredCertificates.map((cert) => {
            const daysUntilExpiry = Math.floor(
              (cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const isExpired = daysUntilExpiry < 0;

            return (
              <Grid item xs={12} md={6} key={cert.id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: selectedCertificates.has(cert.id) ? '2px solid' : '1px solid',
                    borderColor: selectedCertificates.has(cert.id) ? 'primary.main' : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      background: isExpired
                        ? 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)'
                        : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        checked={selectedCertificates.has(cert.id)}
                        onChange={() => handleSelectCertificate(cert.id)}
                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {cert.certificateNumber}
                      </Typography>
                    </Box>
                    <Chip
                      label={cert.status}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Service Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {cert.serviceType}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Holder Name
                      </Typography>
                      <Typography variant="body1">{cert.clientName}</Typography>
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Issue Date
                        </Typography>
                        <Typography variant="body2">{format(cert.issueDate, 'MMM dd, yyyy')}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Expiry Date
                        </Typography>
                        <Typography variant="body2" color={isExpired ? 'error.main' : 'text.primary'}>
                          {format(cert.expiryDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                    </Grid>
                    {!isExpired && (
                      <Typography variant="caption" color="text.secondary">
                        Expires in {daysUntilExpiry} days
                      </Typography>
                    )}
                    {isExpired && (
                      <Typography variant="caption" color="error.main" fontWeight={600}>
                        EXPIRED
                      </Typography>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSingleMenuAnchor({ anchor: e.currentTarget, cert });
                        }}
                        fullWidth
                      >
                        Download
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Bulk Download Menu */}
      <Menu anchorEl={bulkMenuAnchor} open={Boolean(bulkMenuAnchor)} onClose={() => setBulkMenuAnchor(null)}>
        <MenuItem onClick={() => handleBulkDownload('PDF')}>
          <PdfIcon sx={{ mr: 1 }} />
          Download Selected as PDF (ZIP)
        </MenuItem>
        <MenuItem onClick={() => handleBulkDownload('IMAGE')}>
          <ImageIcon sx={{ mr: 1 }} />
          Download Selected as Image (ZIP)
        </MenuItem>
      </Menu>

      {/* Single Download Menu */}
      <Menu
        anchorEl={singleMenuAnchor?.anchor}
        open={Boolean(singleMenuAnchor)}
        onClose={() => setSingleMenuAnchor(null)}
      >
        <MenuItem onClick={() => singleMenuAnchor && handleSingleDownload(singleMenuAnchor.cert, 'PDF')}>
          <PdfIcon sx={{ mr: 1 }} />
          Download as PDF
        </MenuItem>
        <MenuItem onClick={() => singleMenuAnchor && handleSingleDownload(singleMenuAnchor.cert, 'IMAGE')}>
          <ImageIcon sx={{ mr: 1 }} />
          Download as Image
        </MenuItem>
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

