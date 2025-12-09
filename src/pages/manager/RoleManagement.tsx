import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Assignment as JobIcon,
  Description as CertificateIcon,
  Assessment as ReportIcon,
  Inventory as StickerIcon,
  People as UserIcon,
  Settings as SettingsIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PermissionType } from '@/types';
import {
  getAllPermissionTypes,
  getPermissionDescription,
  getDefaultPermissions,
} from '@/utils/permissions';

const STORAGE_KEY_ROLES = 'custom-roles';

// Custom Role Interface
export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: {
    [key in PermissionType]?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isSystemRole?: boolean; // System roles cannot be deleted
}

// Organize permissions into categories (same as UserManagement)
const PERMISSION_CATEGORIES = {
  'Role Information': {
    icon: <SecurityIcon />,
    permissions: [] as PermissionType[],
  },
  'Job Orders': {
    icon: <JobIcon />,
    permissions: ['createJobOrder', 'viewAllJobOrders', 'approveJobOrders', 'assignJobs'] as PermissionType[],
  },
  'Certificates & Documents': {
    icon: <CertificateIcon />,
    permissions: ['downloadCertificates', 'issueCertificates'] as PermissionType[],
  },
  'Reports & Analytics': {
    icon: <ReportIcon />,
    permissions: ['viewReports', 'downloadReports', 'viewAnalytics', 'exportData', 'viewActivityLogs'] as PermissionType[],
  },
  'Sticker Management': {
    icon: <StickerIcon />,
    permissions: ['manageStickers'] as PermissionType[],
  },
  'User Management': {
    icon: <UserIcon />,
    permissions: ['manageUsers', 'manageRegions'] as PermissionType[],
  },
  'System Settings': {
    icon: <SettingsIcon />,
    permissions: ['manageSettings', 'viewFinancialData'] as PermissionType[],
  },
};

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

export const RoleManagement: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
  });

  const [permissions, setPermissions] = useState<{ [key in PermissionType]?: boolean }>({});

  // Load roles from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_ROLES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRoles(parsed.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })));
      } catch (e) {
        console.error('Failed to parse roles from localStorage', e);
      }
    }
  }, []);

  const saveRoles = (updatedRoles: CustomRole[]) => {
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(updatedRoles));
    setRoles(updatedRoles);
  };

  const handleOpenCreateDialog = () => {
    setRoleFormData({
      name: '',
      description: '',
    });
    setPermissions({});
    setActiveTab(0);
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (role: CustomRole) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
    });
    setPermissions({ ...role.permissions });
    setActiveTab(0);
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (role: CustomRole) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleCreateRole = () => {
    if (!roleFormData.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a role name',
        severity: 'error',
      });
      return;
    }

    // Check if role name already exists
    if (roles.some((r) => r.name.toLowerCase() === roleFormData.name.toLowerCase())) {
      setSnackbar({
        open: true,
        message: 'Role with this name already exists',
        severity: 'error',
      });
      return;
    }

    const newRole: CustomRole = {
      id: `role-${Date.now()}`,
      name: roleFormData.name,
      description: roleFormData.description,
      permissions: permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedRoles = [...roles, newRole];
    saveRoles(updatedRoles);

    // Trigger event to notify UserManagement component
    window.dispatchEvent(new Event('customRolesUpdated'));

    setSnackbar({
      open: true,
      message: 'Role created successfully',
      severity: 'success',
    });
    setCreateDialogOpen(false);
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !roleFormData.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a role name',
        severity: 'error',
      });
      return;
    }

    // Check if role name already exists (excluding current role)
    if (roles.some((r) => r.id !== selectedRole.id && r.name.toLowerCase() === roleFormData.name.toLowerCase())) {
      setSnackbar({
        open: true,
        message: 'Role with this name already exists',
        severity: 'error',
      });
      return;
    }

    const updatedRole: CustomRole = {
      ...selectedRole,
      name: roleFormData.name,
      description: roleFormData.description,
      permissions: permissions,
      updatedAt: new Date(),
    };

    const updatedRoles = roles.map((r) => (r.id === selectedRole.id ? updatedRole : r));
    saveRoles(updatedRoles);

    // Trigger event to notify UserManagement component
    window.dispatchEvent(new Event('customRolesUpdated'));

    setSnackbar({
      open: true,
      message: 'Role updated successfully',
      severity: 'success',
    });
    setEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;

    if (selectedRole.isSystemRole) {
      setSnackbar({
        open: true,
        message: 'System roles cannot be deleted',
        severity: 'error',
      });
      setDeleteDialogOpen(false);
      return;
    }

    const updatedRoles = roles.filter((r) => r.id !== selectedRole.id);
    saveRoles(updatedRoles);

    // Trigger event to notify UserManagement component
    window.dispatchEvent(new Event('customRolesUpdated'));

    setSnackbar({
      open: true,
      message: 'Role deleted successfully',
      severity: 'success',
    });
    setDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const handlePermissionToggle = (permission: PermissionType) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const renderPermissionTabs = () => {
    const categoryEntries = Object.entries(PERMISSION_CATEGORIES);
    
    return (
      <Box>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {categoryEntries.map(([categoryName], index) => (
            <Tab
              key={categoryName}
              label={categoryName}
              icon={PERMISSION_CATEGORIES[categoryName as keyof typeof PERMISSION_CATEGORIES].icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {categoryEntries.map(([categoryName, category], index) => (
          <TabPanel key={categoryName} value={activeTab} index={index}>
            {index === 0 ? (
              // Role Information Tab
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Toggle individual permissions in the tabs above. Changes will be saved when you click Submit.
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name *"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              // Permission Tabs
              <Box>
                {category.permissions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No permissions in this category
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {category.permissions.map((permission) => (
                      <Grid item xs={12} sm={6} md={4} key={permission}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={permissions[permission] || false}
                              onChange={() => handlePermissionToggle(permission)}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {permission}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getPermissionDescription(permission)}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </TabPanel>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              Role Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage custom roles with specific permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
              },
            }}
          >
            Create Role
          </Button>
        </Box>
      </Box>

      {/* Roles List */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Custom Roles
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Role Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Permissions Count</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No custom roles found. Create your first role to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {role.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {role.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Object.values(role.permissions).filter(Boolean).length} / {getAllPermissionTypes().length}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Role">
                        <IconButton size="small" onClick={() => handleOpenEditDialog(role)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!role.isSystemRole && (
                        <Tooltip title="Delete Role">
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(role)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          {renderPermissionTabs()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRole}>
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
        <DialogContent>
          {renderPermissionTabs()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRole}>
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role &quot;{selectedRole?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRole}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

