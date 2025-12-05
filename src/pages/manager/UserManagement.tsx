import React, { useState, useEffect } from 'react';
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { User, PermissionLevel, PermissionType } from '@/types';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Assignment as JobIcon,
  Description as CertificateIcon,
  Assessment as ReportIcon,
  Inventory as StickerIcon,
  People as UserIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  getAllPermissionTypes,
  getPermissionDescription,
  getDefaultPermissions,
} from '@/utils/permissions';

const STORAGE_KEY_USERS = 'users';

// Organize permissions into categories
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

export const UserManagement: React.FC = () => {
  const { users: contextUsers, setCurrentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>(contextUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
  });

  // Load users from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUsers(parsed);
      } catch (e) {
        console.error('Failed to parse users from localStorage', e);
      }
    } else {
      setUsers(contextUsers);
      saveUsers(contextUsers);
    }
  }, [contextUsers]);

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleEditPermissions = (user: User) => {
    setSelectedUser({ ...user });
    setPermissionDialogOpen(true);
    setActiveTab(0);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser({ ...user });
    setEditFormData({
      name: user.name,
      email: user.email,
      employeeId: user.employeeId || '',
      department: user.department || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;

    const updatedUser: User = {
      ...selectedUser,
      name: editFormData.name,
      email: editFormData.email,
      employeeId: editFormData.employeeId || undefined,
      department: editFormData.department || undefined,
    };

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? updatedUser : u));
    saveUsers(updatedUsers);

    if (setCurrentUser && selectedUser.id === contextUsers.find((u) => u.id === selectedUser.id)?.id) {
      setCurrentUser(updatedUser);
    }

    setSnackbar({
      open: true,
      message: `User ${updatedUser.name} updated successfully`,
      severity: 'success',
    });
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePermissionLevelChange = (level: PermissionLevel) => {
    if (!selectedUser) return;

    const defaultPerms = getDefaultPermissions(
      selectedUser.currentRole || selectedUser.roles[0] || 'inspector',
      level
    );

    setSelectedUser({
      ...selectedUser,
      permissions: {
        level,
        permissions: {
          ...defaultPerms.permissions,
          ...selectedUser.permissions?.permissions,
        },
      },
    });
  };

  const handlePermissionToggle = (permission: PermissionType, enabled: boolean) => {
    if (!selectedUser) return;

    setSelectedUser({
      ...selectedUser,
      permissions: {
        level: selectedUser.permissions?.level || 'Basic',
        permissions: {
          ...selectedUser.permissions?.permissions,
          [permission]: enabled,
        },
      },
    });
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? selectedUser : u));
    saveUsers(updatedUsers);

    if (setCurrentUser && selectedUser.id === contextUsers.find((u) => u.id === selectedUser.id)?.id) {
      setCurrentUser(selectedUser);
    }

    setSnackbar({
      open: true,
      message: `Permissions updated for ${selectedUser.name}`,
      severity: 'success',
    });
    setPermissionDialogOpen(false);
    setSelectedUser(null);
    setActiveTab(0);
  };

  // Count enabled permissions for display
  const getPermissionSummary = (user: User): string => {
    if (!user.permissions) return 'No custom permissions';
    const enabledCount = Object.values(user.permissions.permissions).filter((v) => v === true).length;
    const totalCount = Object.keys(user.permissions.permissions).length;
    if (enabledCount === 0) return 'No permissions';
    return `${enabledCount} permission${enabledCount > 1 ? 's' : ''} enabled`;
  };

  const columns: Column<User>[] = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'employeeId',
      label: 'Employee ID',
      minWidth: 120,
      format: (value) => value || 'N/A',
    },
    {
      id: 'roles',
      label: 'Roles',
      minWidth: 200,
      format: (value: string[]) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </Box>
      ),
    },
    {
      id: 'permissions',
      label: 'Permissions',
      minWidth: 180,
      format: (value, row) => {
        const summary = getPermissionSummary(row);
        return (
          <Typography variant="body2" color="text.secondary">
            {summary}
          </Typography>
        );
      },
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 150,
      format: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Permissions">
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditPermissions(row);
              }}
            >
              <SecurityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const getPermissionValue = (permission: PermissionType): boolean => {
    if (!selectedUser) return false;
    
    if (selectedUser.permissions?.permissions[permission] !== undefined) {
      return selectedUser.permissions.permissions[permission] === true;
    }
    
    return getDefaultPermissions(
      selectedUser.currentRole || selectedUser.roles[0] || 'inspector',
      selectedUser.permissions?.level || 'Basic'
    ).permissions[permission] === true;
  };

  const categoryKeys = Object.keys(PERMISSION_CATEGORIES);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
            },
          }}
        >
          Add New User
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
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Users Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add users to get started.
              </Typography>
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchPlaceholder="Search by name, email, employee ID..."
            />
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
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
            Edit User
          </Typography>
          {selectedUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Update user information
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
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
                label="Employee ID"
                value={editFormData.employeeId}
                onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
              />
            </Grid>
            {selectedUser && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Roles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedUser.roles.map((role) => (
                      <Chip key={role} label={role} size="small" />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedUser(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={!editFormData.name || !editFormData.email}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Management Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => {
          setPermissionDialogOpen(false);
          setSelectedUser(null);
          setActiveTab(0);
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
                Staff Permissions List / Create Role
              </Typography>
              {selectedUser && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedUser.name} • {selectedUser.email}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 0 }}>
          {selectedUser && (
            <Box>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                  {categoryKeys.map((category, index) => (
                    <Tab
                      key={category}
                      label={category}
                      icon={PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES].icon}
                      iconPosition="start"
                      sx={{
                        minHeight: 64,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&.Mui-selected': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Tab Panels */}
              <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Role Information Tab */}
                <TabPanel value={activeTab} index={0}>
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                      Role Information
                    </Typography>

                    {/* Name Field */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <FormLabel required sx={{ mb: 1, fontWeight: 600 }}>
                        Name
                      </FormLabel>
                      <TextField
                        fullWidth
                        value={selectedUser.name}
                        disabled
                        variant="outlined"
                        size="small"
                      />
                    </FormControl>

                    {/* Permission Level - Hidden from display but used internally */}
                    <FormControl component="fieldset" fullWidth sx={{ mb: 3, display: 'none' }}>
                      <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
                        Permission Level
                      </FormLabel>
                      <RadioGroup
                        row
                        value={selectedUser.permissions?.level || 'Basic'}
                        onChange={(e) => handlePermissionLevelChange(e.target.value as PermissionLevel)}
                      >
                        <FormControlLabel
                          value="Basic"
                          control={<Radio />}
                          label="Basic"
                        />
                        <FormControlLabel
                          value="Moderate"
                          control={<Radio />}
                          label="Moderate"
                        />
                        <FormControlLabel
                          value="Advanced"
                          control={<Radio />}
                          label="Advanced"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Role */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Role</FormLabel>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedUser.roles.map((role) => (
                          <Chip key={role} label={role} size="small" />
                        ))}
                      </Box>
                    </FormControl>

                    {/* Permission Summary */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Toggle individual permissions in the tabs above. Changes will be saved when you click Submit.
                      </Typography>
                    </Alert>
                  </Box>
                </TabPanel>

                {/* Other Permission Category Tabs */}
                {categoryKeys.slice(1).map((category, tabIndex) => {
                  const categoryData = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
                  const permissions = categoryData.permissions;

                  return (
                    <TabPanel key={category} value={activeTab} index={tabIndex + 1}>
                      <Box>
                        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                          {category}
                        </Typography>

                        {permissions.length === 0 ? (
                          <Alert severity="info">
                            No permissions available in this category.
                          </Alert>
                        ) : (
                          <Grid container spacing={2}>
                            {permissions.map((permission) => {
                              const isEnabled = getPermissionValue(permission);

                              return (
                                <Grid item xs={12} key={permission}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2.5,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 2,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      bgcolor: 'background.paper',
                                      '&:hover': {
                                        bgcolor: 'action.hover',
                                      },
                                    }}
                                  >
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                                        {permission.replace(/([A-Z])/g, ' $1').trim()}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {getPermissionDescription(permission)}
                                      </Typography>
                                    </Box>
                                    <Switch
                                      checked={isEnabled}
                                      onChange={(e) => handlePermissionToggle(permission, e.target.checked)}
                                      color="primary"
                                    />
                                  </Paper>
                                </Grid>
                              );
                            })}
                          </Grid>
                        )}
                      </Box>
                    </TabPanel>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              setPermissionDialogOpen(false);
              setSelectedUser(null);
              setActiveTab(0);
            }}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            Submit
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
