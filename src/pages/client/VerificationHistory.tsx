import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  CheckCircle as ValidIcon,
  Cancel as InvalidIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  FilterList as FilterIcon,
  QrCodeScanner as QrIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Certificate } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { exportCertificateAsPDF, exportCertificateAsImage } from '@/utils/certificateExport';

interface VerificationRecord {
  id: string;
  certificateNumber: string;
  certificate?: Certificate;
  verifiedAt: Date;
  status: 'Valid' | 'Invalid' | 'Expired';
  method: 'QR Code' | 'Manual Entry';
  verifiedBy?: string;
}

const mockVerificationHistory: VerificationRecord[] = [
  {
    id: 'v1',
    certificateNumber: 'CERT-MC-2024-001',
    verifiedAt: new Date('2025-01-15T10:30:00'),
    status: 'Valid',
    method: 'QR Code',
    verifiedBy: 'John Doe',
  },
  {
    id: 'v2',
    certificateNumber: 'CERT-FL-2024-005',
    verifiedAt: new Date('2025-01-14T14:20:00'),
    status: 'Valid',
    method: 'Manual Entry',
    verifiedBy: 'John Doe',
  },
  {
    id: 'v3',
    certificateNumber: 'CERT-RG-2023-012',
    verifiedAt: new Date('2025-01-13T09:15:00'),
    status: 'Expired',
    method: 'QR Code',
    verifiedBy: 'John Doe',
  },
  {
    id: 'v4',
    certificateNumber: 'INVALID-123',
    verifiedAt: new Date('2025-01-12T16:45:00'),
    status: 'Invalid',
    method: 'Manual Entry',
    verifiedBy: 'John Doe',
  },
];

export const VerificationHistory: React.FC = () => {
  const navigate = useNavigate();
  const { certificates } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Valid' | 'Invalid' | 'Expired'>('All');
  const [methodFilter, setMethodFilter] = useState<'All' | 'QR Code' | 'Manual Entry'>('All');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<{ anchor: HTMLElement; cert: Certificate } | null>(null);

  // Load verification history from localStorage
  const [verificationHistory, setVerificationHistory] = useState<VerificationRecord[]>(() => {
    const stored = localStorage.getItem('verification-history');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((v: any) => ({
        ...v,
        verifiedAt: new Date(v.verifiedAt),
        certificate: v.certificateId ? certificates.find((c) => c.id === v.certificateId) : undefined,
      }));
    }
    return mockVerificationHistory.map((v) => ({
      ...v,
      certificate: certificates.find((c) => c.certificateNumber === v.certificateNumber),
    }));
  });

  useEffect(() => {
    // Save to localStorage whenever history changes
    const toStore = verificationHistory.map((v) => ({
      ...v,
      verifiedAt: v.verifiedAt.toISOString(),
      certificateId: v.certificate?.id,
    }));
    localStorage.setItem('verification-history', JSON.stringify(toStore));
  }, [verificationHistory]);

  const filteredHistory = verificationHistory.filter((record) => {
    const matchesSearch =
      record.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.certificate?.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesMethod = methodFilter === 'All' || record.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Valid':
        return (
          <Chip
            icon={<ValidIcon />}
            label="Valid"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'Expired':
        return (
          <Chip
            icon={<InvalidIcon />}
            label="Expired"
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'Invalid':
        return (
          <Chip
            icon={<InvalidIcon />}
            label="Invalid"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      default:
        return null;
    }
  };

  const handleVerifyAgain = (certificateNumber: string) => {
    navigate('/client/verify', { state: { certificateNumber } });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/client/verify')} sx={{ mb: 2 }}>
          Back to Verification
        </Button>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
          Verification History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your certificate verification history and track verification records
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by certificate number or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={statusFilter === 'All' ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter('All')}
                  size="small"
                >
                  All Status
                </Button>
                <Button
                  variant={statusFilter === 'Valid' ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter('Valid')}
                  color="success"
                  size="small"
                >
                  Valid
                </Button>
                <Button
                  variant={statusFilter === 'Invalid' ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter('Invalid')}
                  color="error"
                  size="small"
                >
                  Invalid
                </Button>
                <Button
                  variant={statusFilter === 'Expired' ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter('Expired')}
                  color="warning"
                  size="small"
                >
                  Expired
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  size="small"
                >
                  Method
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Method Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setMethodFilter('All'); setFilterMenuAnchor(null); }}>
          All Methods
        </MenuItem>
        <MenuItem onClick={() => { setMethodFilter('QR Code'); setFilterMenuAnchor(null); }}>
          QR Code
        </MenuItem>
        <MenuItem onClick={() => { setMethodFilter('Manual Entry'); setFilterMenuAnchor(null); }}>
          Manual Entry
        </MenuItem>
      </Menu>

      {/* Verification History Table */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Verification Records ({filteredHistory.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Certificate Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Client Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Verified At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Verified By</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {record.certificateNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.certificate?.clientName || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={record.method === 'QR Code' ? <QrIcon /> : undefined}
                        label={record.method}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(record.verifiedAt, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{record.verifiedBy || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {record.certificate && (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                setDownloadMenuAnchor({ anchor: e.currentTarget, cert: record.certificate! })
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleVerifyAgain(record.certificateNumber)}
                            >
                              Verify Again
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No verification records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor?.anchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={() => setDownloadMenuAnchor(null)}
      >
        <MenuItem
          onClick={async () => {
            if (downloadMenuAnchor) {
              await exportCertificateAsPDF(downloadMenuAnchor.cert);
              setDownloadMenuAnchor(null);
            }
          }}
        >
          <PdfIcon sx={{ mr: 1 }} />
          Download as PDF
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (downloadMenuAnchor) {
              await exportCertificateAsImage(downloadMenuAnchor.cert);
              setDownloadMenuAnchor(null);
            }
          }}
        >
          <ImageIcon sx={{ mr: 1 }} />
          Download as Image
        </MenuItem>
      </Menu>
    </Box>
  );
};

