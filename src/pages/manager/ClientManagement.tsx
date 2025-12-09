import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as JobIcon,
  Payment as PaymentIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Info as InfoIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { Client, JobOrder, Payment } from '@/types';
import { format } from 'date-fns';

const STORAGE_KEY_CLIENTS = 'clients';
const STORAGE_KEY_JOB_ORDERS = 'jobOrders';
const STORAGE_KEY_PAYMENTS = 'payments';

// Default regions with teams for testing
const getDefaultRegions = () => [
  {
    id: 'lahore',
    name: 'Lahore',
    teams: [
      { id: 'lahore-team-1', name: 'Lahore-One' },
      { id: 'lahore-team-2', name: 'Lahore-Two' },
    ],
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    teams: [
      { id: 'islamabad-team-1', name: 'Islamabad-One' },
      { id: 'islamabad-team-2', name: 'Islamabad-Two' },
    ],
  },
  {
    id: 'karachi',
    name: 'Karachi',
    teams: [
      { id: 'karachi-team-1', name: 'Karachi-One' },
      { id: 'karachi-team-2', name: 'Karachi-Two' },
    ],
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const ClientManagement: React.FC = () => {
  const { clients: contextClients, jobOrders: contextJobOrders } = useAppContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamsDetailDialogOpen, setTeamsDetailDialogOpen] = useState(false);
  const [selectedClientForTeams, setSelectedClientForTeams] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filters
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Construction' as 'Construction' | 'Engineering' | 'Individual',
    accountStatus: 'Active' as 'Active' | 'Inactive',
    regions: [] as string[],
    teams: [] as string[], // Team IDs
  });

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load clients
      const storedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);
      if (storedClients) {
        try {
          const parsed = JSON.parse(storedClients);
          setClients(parsed);
        } catch (e) {
          console.error('Error parsing clients:', e);
          setClients(contextClients);
        }
      } else {
        setClients(contextClients);
      }

      // Load job orders
      const storedJobs = localStorage.getItem(STORAGE_KEY_JOB_ORDERS);
      if (storedJobs) {
        try {
          const parsed = JSON.parse(storedJobs);
          setJobOrders(parsed.map((j: any) => ({
            ...j,
            dateTime: new Date(j.dateTime),
            createdAt: new Date(j.createdAt),
            updatedAt: new Date(j.updatedAt),
          })));
        } catch (e) {
          console.error('Error parsing job orders:', e);
          setJobOrders(contextJobOrders);
        }
      } else {
        setJobOrders(contextJobOrders);
      }

      // Load payments
      const storedPayments = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      if (storedPayments) {
        try {
          const parsed = JSON.parse(storedPayments);
          setPayments(parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt || p.date || Date.now()),
            confirmedAt: p.confirmedAt ? new Date(p.confirmedAt) : undefined,
          })));
        } catch (e) {
          console.error('Error parsing payments:', e);
        }
      }

      // Load regions
      const storedRegions = localStorage.getItem('regions');
      if (storedRegions) {
        try {
          const parsed = JSON.parse(storedRegions);
          setRegions(parsed);
        } catch (e) {
          console.error('Error parsing regions:', e);
          // Set default regions if parsing fails
          setRegions(getDefaultRegions());
        }
      } else {
        // Set default regions if no regions in localStorage
        setRegions(getDefaultRegions());
      }
    };

    loadData();

    // Listen for updates
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('clientsUpdated', handleStorageChange);
    window.addEventListener('jobOrdersUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clientsUpdated', handleStorageChange);
      window.removeEventListener('jobOrdersUpdated', handleStorageChange);
    };
  }, [contextClients, contextJobOrders]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Region filter
      if (regionFilter !== 'all') {
        const clientRegions = client.regions || (client.regionId ? [client.regionId] : []);
        if (!clientRegions.includes(regionFilter)) {
          return false;
        }
      }

      // Business type filter
      if (businessTypeFilter !== 'all' && client.businessType !== businessTypeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && client.accountStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [clients, regionFilter, businessTypeFilter, statusFilter]);

  // Get client's job orders
  const getClientJobOrders = (clientId: string): JobOrder[] => {
    return jobOrders.filter((jo) => jo.clientId === clientId);
  };

  // Get client's payments
  const getClientPayments = (clientId: string): Payment[] => {
    return payments.filter((p) => p.clientId === clientId);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
    setDetailTab(0);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    // Get teams from client.teams if available, otherwise from job orders
    let teamIds: string[] = [];
    if (client.teams && client.teams.length > 0) {
      teamIds = client.teams;
    } else {
      // Fallback: get teams from job orders
      const clientJobs = getClientJobOrders(client.id);
      const teamIdsSet = new Set<string>();
      clientJobs.forEach((job) => {
        if (job.teamId) {
          teamIdsSet.add(job.teamId);
        }
      });
      teamIds = Array.from(teamIdsSet);
    }
    
    setEditFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      businessType: client.businessType,
      accountStatus: client.accountStatus,
      regions: client.regions || (client.regionId ? [client.regionId] : []),
      teams: teamIds,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedClient) return;

    const updatedClient: Client = {
      ...selectedClient,
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      address: editFormData.address,
      businessType: editFormData.businessType,
      accountStatus: editFormData.accountStatus,
      regions: editFormData.regions,
      teams: editFormData.teams, // Always save teams array (can be empty)
      // Legacy fields
      regionId: editFormData.regions.length > 0 ? editFormData.regions[0] : undefined,
      teamId: editFormData.teams.length > 0 ? editFormData.teams[0] : undefined,
    };

    const updatedClients = clients.map((c) => (c.id === selectedClient.id ? updatedClient : c));
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updatedClients));
    setClients(updatedClients);
    window.dispatchEvent(new Event('clientsUpdated'));

    setSnackbar({
      open: true,
      message: `Client ${updatedClient.name} updated successfully`,
      severity: 'success',
    });
    setEditDialogOpen(false);
    setSelectedClient(null);
  };

  const columns: Column<Client>[] = [
    {
      id: 'name',
      label: 'Company Name',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 220,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'businessType',
      label: 'Business Type',
      minWidth: 130,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            textTransform: 'capitalize',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      id: 'regions',
      label: 'Regions',
      minWidth: 200,
      format: (value, row) => {
        const clientRegions = row.regions || (row.regionId ? [row.regionId] : []);
        if (clientRegions.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Not assigned
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {clientRegions.map((regionId: string) => {
              const region = regions.find((r) => r.id === regionId);
              return (
                <Chip
                  key={regionId}
                  label={region?.name || regionId}
                  size="small"
                  color="primary"
                  sx={{ height: 24, fontWeight: 500 }}
                />
              );
            })}
          </Box>
        );
      },
    },
    {
      id: 'teams',
      label: 'Teams',
      minWidth: 250,
      format: (value, row) => {
        // Get job orders to extract region-team mapping
        const clientJobs = getClientJobOrders(row.id);
        
        // Build region-team mapping from job orders
        const regionTeamsMap = new Map<string, Set<string>>();
        clientJobs.forEach((job) => {
          if (job.regionId && job.teamId) {
            if (!regionTeamsMap.has(job.regionId)) {
              regionTeamsMap.set(job.regionId, new Set<string>());
            }
            regionTeamsMap.get(job.regionId)!.add(job.teamId);
          }
        });
        
        // If no teams found in job orders, check client.teams
        if (regionTeamsMap.size === 0) {
          const clientTeams = row.teams || [];
          if (clientTeams.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No assigned
              </Typography>
            );
          }
          
          // Try to map teams to regions from client.regions
          const clientRegions = row.regions || (row.regionId ? [row.regionId] : []);
          clientRegions.forEach((regionId: string) => {
            const region = regions.find((r) => r.id === regionId);
            if (region) {
              region.teams.forEach((team: any) => {
                if (clientTeams.includes(team.id)) {
                  if (!regionTeamsMap.has(regionId)) {
                    regionTeamsMap.set(regionId, new Set<string>());
                  }
                  regionTeamsMap.get(regionId)!.add(team.id);
                }
              });
            }
          });
          
          if (regionTeamsMap.size === 0) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No assigned
              </Typography>
            );
          }
        }
        
        // Get all team names with region info
        const teamDisplayItems: { regionName: string; teamName: string; teamId: string }[] = [];
        const hasMultipleRegions = regionTeamsMap.size > 1;
        
        regionTeamsMap.forEach((teamIds, regionId) => {
          const region = regions.find((r) => r.id === regionId);
          const regionName = region?.name || regionId;
          
          region?.teams.forEach((team: any) => {
            if (teamIds.has(team.id)) {
              teamDisplayItems.push({
                regionName,
                teamName: team.name || team.id,
                teamId: team.id,
              });
            }
          });
        });
        
        if (teamDisplayItems.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No assigned
            </Typography>
          );
        }
        
        // Display teams as chips - include region name if multiple regions
        // Show first 3 teams, then "+X more" button if more exist
        const maxVisible = 3;
        const visibleTeams = teamDisplayItems.slice(0, maxVisible);
        const remainingCount = teamDisplayItems.length - maxVisible;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {visibleTeams.map((item, idx) => (
              <Chip
                key={idx}
                label={hasMultipleRegions ? `${item.regionName} - ${item.teamName}` : item.teamName}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ 
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: 24,
                  maxWidth: hasMultipleRegions ? 180 : 120,
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }
                }}
              />
            ))}
            {remainingCount > 0 && (
              <Tooltip title={`View all ${teamDisplayItems.length} teams and job details`}>
                <Chip
                  icon={<InfoIcon />}
                  label={`+${remainingCount} more`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClientForTeams(row);
                    setTeamsDetailDialogOpen(true);
                  }}
                  sx={{ 
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'white',
                    }
                  }}
                />
              </Tooltip>
            )}
            {teamDisplayItems.length <= maxVisible && teamDisplayItems.length > 2 && (
              <Tooltip title="View detailed region-team breakdown">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClientForTeams(row);
                    setTeamsDetailDialogOpen(true);
                  }}
                  sx={{ ml: 0.5 }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      id: 'accountStatus',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={value === 'Active' ? 'success' : 'default'}
          icon={value === 'Active' ? <ActiveIcon /> : <InactiveIcon />}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 120,
      format: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClient(row);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Client">
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClient(row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            Client Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage client accounts, view service history, and track payments
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Region</InputLabel>
                <Select
                  value={regionFilter}
                  label="Filter by Region"
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Business Type</InputLabel>
                <Select
                  value={businessTypeFilter}
                  label="Filter by Business Type"
                  onChange={(e) => setBusinessTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Construction">Construction</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Individual">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          {filteredClients.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Clients Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {clients.length === 0
                  ? 'No clients in the system yet.'
                  : 'No clients match the selected filters.'}
              </Typography>
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={filteredClients}
              searchPlaceholder="Search by company name, email, phone..."
            />
          )}
        </CardContent>
      </Card>

      {/* View Client Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedClient(null);
          setDetailTab(0);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Client Details
              </Typography>
              {selectedClient && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedClient.name}
                </Typography>
              )}
            </Box>
            {selectedClient && (
              <Chip
                label={selectedClient.accountStatus}
                color={selectedClient.accountStatus === 'Active' ? 'success' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {selectedClient && (
            <Box>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}>
                  <Tab label="Basic Information" icon={<BusinessIcon />} iconPosition="start" />
                  <Tab label="Service History" icon={<JobIcon />} iconPosition="start" />
                  <Tab label="Payment History" icon={<PaymentIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* Tab Panels */}
              <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Basic Information Tab */}
                <TabPanel value={detailTab} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Company Name
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedClient.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EmailIcon color="primary" />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Email
                        </Typography>
                      </Box>
                      <Typography variant="body1">{selectedClient.email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PhoneIcon color="primary" />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Phone
                        </Typography>
                      </Box>
                      <Typography variant="body1">{selectedClient.phone}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Business Type
                        </Typography>
                      </Box>
                      <Chip label={selectedClient.businessType} size="small" sx={{ textTransform: 'capitalize' }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocationIcon color="primary" />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Address
                        </Typography>
                      </Box>
                      <Typography variant="body1">{selectedClient.address || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocationIcon color="primary" />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Regions
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(() => {
                          const clientRegions = selectedClient.regions || (selectedClient.regionId ? [selectedClient.regionId] : []);
                          if (clientRegions.length === 0) {
                            return (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Not assigned to any region
                              </Typography>
                            );
                          }
                          return clientRegions.map((regionId: string) => {
                            const region = regions.find((r) => r.id === regionId);
                            return (
                              <Chip
                                key={regionId}
                                label={region?.name || regionId}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 500 }}
                              />
                            );
                          });
                        })()}
                      </Box>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Service History Tab */}
                <TabPanel value={detailTab} index={1}>
                  {(() => {
                    const clientJobs = getClientJobOrders(selectedClient.id);
                    if (clientJobs.length === 0) {
                      return (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <JobIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No service history found for this client
                          </Typography>
                        </Box>
                      );
                    }
                    return (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Job ID</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Service Types</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clientJobs.map((job) => {
                              const jobRegion = regions.find((r) => r.id === job.regionId);
                              const jobTeam = jobRegion?.teams?.find((t: any) => t.id === job.teamId);
                              
                              return (
                                <TableRow key={job.id} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                      {job.id}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                      {job.serviceTypes?.map((type) => (
                                        <Chip key={type} label={type} size="small" color="primary" />
                                      ))}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {job.regionId ? (
                                      <Chip
                                        label={jobRegion?.name || job.regionId}
                                        size="small"
                                        color="primary"
                                        sx={{ fontWeight: 500 }}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        Not assigned
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {job.teamId ? (
                                      <Chip
                                        label={jobTeam?.name || job.teamId}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        Not assigned
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {format(job.dateTime, 'MMM dd, yyyy')}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={job.status}
                                      size="small"
                                      color={
                                        job.status === 'Completed' || job.status === 'Approved'
                                          ? 'success'
                                          : job.status === 'In Progress'
                                          ? 'info'
                                          : 'warning'
                                      }
                                      sx={{ fontWeight: 600 }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {job.location}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </TabPanel>

                {/* Payment History Tab */}
                <TabPanel value={detailTab} index={2}>
                  {(() => {
                    const clientPayments = getClientPayments(selectedClient.id);
                    if (clientPayments.length === 0) {
                      return (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <PaymentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No payment history found for this client
                          </Typography>
                        </Box>
                      );
                    }
                    return (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Job Order</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clientPayments.map((payment) => (
                              <TableRow key={payment.id} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    {payment.id}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{payment.jobOrderId}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    ${payment.amount}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {format(payment.createdAt, 'MMM dd, yyyy')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={payment.status}
                                    size="small"
                                    color={payment.status === 'Confirmed' ? 'success' : payment.status === 'Pending' ? 'warning' : 'error'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </TabPanel>
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setSelectedClient(null);
              setDetailTab(0);
            }}
            variant="outlined"
          >
            Close
          </Button>
          {selectedClient && (
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                handleEditClient(selectedClient);
              }}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Edit Client
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedClient(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Edit Client
          </Typography>
          {selectedClient && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Update client information
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                required
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                required
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Business Type</InputLabel>
                <Select
                  value={editFormData.businessType}
                  onChange={(e) => setEditFormData({ ...editFormData, businessType: e.target.value as any })}
                  label="Business Type"
                >
                  <MenuItem value="Construction">Construction</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Individual">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account Status</InputLabel>
                <Select
                  value={editFormData.accountStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, accountStatus: e.target.value as any })}
                  label="Account Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Regions</InputLabel>
                <Select
                  multiple
                  value={editFormData.regions}
                  onChange={(e) => setEditFormData({ ...editFormData, regions: e.target.value as string[] })}
                  label="Regions"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((regionId) => {
                        const region = regions.find((r) => r.id === regionId);
                        return (
                          <Chip key={regionId} label={region?.name || regionId} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Teams</InputLabel>
                <Select
                  multiple
                  value={editFormData.teams}
                  onChange={(e) => setEditFormData({ ...editFormData, teams: e.target.value as string[] })}
                  label="Teams"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No teams selected
                        </Typography>
                      ) : (
                        selected.map((teamId) => {
                          // Find team name from all regions
                          let teamName = teamId;
                          for (const region of regions) {
                            const team = region.teams.find((t: any) => t.id === teamId);
                            if (team) {
                              teamName = team.name || team.id;
                              break;
                            }
                          }
                          return (
                            <Chip key={teamId} label={teamName} size="small" color="secondary" />
                          );
                        })
                      )}
                    </Box>
                  )}
                >
                  {regions.map((region) =>
                    region.teams.map((team: any) => (
                      <MenuItem key={team.id} value={team.id}>
                        <Checkbox checked={editFormData.teams.indexOf(team.id) > -1} />
                        <ListItemText primary={`${region.name} - ${team.name || team.id}`} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedClient(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={!editFormData.name || !editFormData.email || !editFormData.phone}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teams Detail Dialog */}
      <Dialog
        open={teamsDetailDialogOpen}
        onClose={() => {
          setTeamsDetailDialogOpen(false);
          setSelectedClientForTeams(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Region & Team Details
            </Typography>
          </Box>
          {selectedClientForTeams && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedClientForTeams.name}
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selectedClientForTeams && (() => {
            const clientJobs = getClientJobOrders(selectedClientForTeams.id);
            
            // Build region-team mapping from job orders
            const regionTeamsMap = new Map<string, { teams: Set<string>; jobs: JobOrder[] }>();
            clientJobs.forEach((job) => {
              if (job.regionId && job.teamId) {
                if (!regionTeamsMap.has(job.regionId)) {
                  regionTeamsMap.set(job.regionId, { teams: new Set<string>(), jobs: [] });
                }
                regionTeamsMap.get(job.regionId)!.teams.add(job.teamId);
                regionTeamsMap.get(job.regionId)!.jobs.push(job);
              }
            });
            
            // If no teams found in job orders, check client.teams
            if (regionTeamsMap.size === 0) {
              const clientTeams = selectedClientForTeams.teams || [];
              if (clientTeams.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <GroupsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No teams assigned to this client
                    </Typography>
                  </Box>
                );
              }
              
              // Try to map teams to regions from client.regions
              const clientRegions = selectedClientForTeams.regions || (selectedClientForTeams.regionId ? [selectedClientForTeams.regionId] : []);
              clientRegions.forEach((regionId: string) => {
                const region = regions.find((r) => r.id === regionId);
                if (region) {
                  region.teams.forEach((team: any) => {
                    if (clientTeams.includes(team.id)) {
                      if (!regionTeamsMap.has(regionId)) {
                        regionTeamsMap.set(regionId, { teams: new Set<string>(), jobs: [] });
                      }
                      regionTeamsMap.get(regionId)!.teams.add(team.id);
                    }
                  });
                }
              });
            }
            
            if (regionTeamsMap.size === 0) {
              return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <GroupsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No teams assigned to this client
                  </Typography>
                </Box>
              );
            }
            
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Array.from(regionTeamsMap.entries()).map(([regionId, data]) => {
                  const region = regions.find((r) => r.id === regionId);
                  const regionName = region?.name || regionId;
                  const teamNames: { id: string; name: string }[] = [];
                  
                  region?.teams.forEach((team: any) => {
                    if (data.teams.has(team.id)) {
                      teamNames.push({ id: team.id, name: team.name || team.id });
                    }
                  });
                  
                  return (
                    <Card key={regionId} elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                          color: 'white',
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon />
                          <Typography variant="h6" fontWeight={600}>
                            {regionName}
                          </Typography>
                          <Chip
                            label={`${teamNames.length} team${teamNames.length > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              ml: 'auto',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Teams */}
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                              Assigned Teams:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {teamNames.map((team) => (
                                <Chip
                                  key={team.id}
                                  icon={<GroupsIcon />}
                                  label={team.name}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ fontWeight: 500 }}
                                />
                              ))}
                            </Box>
                          </Box>
                          
                          {/* Job Orders for this region */}
                          {data.jobs.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                                Job Orders ({data.jobs.length}):
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {data.jobs.map((job) => {
                                  const jobTeam = region?.teams?.find((t: any) => t.id === job.teamId);
                                  return (
                                    <Box
                                      key={job.id}
                                      sx={{
                                        p: 1.5,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                          label={job.id}
                                          size="small"
                                          color="primary"
                                          sx={{ fontWeight: 600 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                          {jobTeam?.name || job.teamId}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                          {format(job.dateTime, 'MMM dd, yyyy')}
                                        </Typography>
                                        <Chip
                                          label={job.status}
                                          size="small"
                                          color={
                                            job.status === 'Completed' || job.status === 'Approved'
                                              ? 'success'
                                              : job.status === 'In Progress'
                                              ? 'info'
                                              : 'warning'
                                          }
                                          sx={{ fontWeight: 600 }}
                                        />
                                      </Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {job.location}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            );
          })()}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setTeamsDetailDialogOpen(false);
              setSelectedClientForTeams(null);
            }}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

