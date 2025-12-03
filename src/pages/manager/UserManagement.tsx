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
} from '@mui/material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { User, PermissionLevel, PermissionType } from '@/types';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  getAllPermissionTypes,
  getPermissionDescription,
  getDefaultPermissions,
} from '@/utils/permissions';

const STORAGE_KEY_USERS = 'users';

export const UserManagement: React.FC = () => {
  const { users: contextUsers, setCurrentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>(contextUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
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
      // Initialize with context users
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
          ...selectedUser.permissions?.permissions, // Keep existing overrides
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

    // If editing current user, update context
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
      label: 'Permission Level',
      minWidth: 150,
      format: (value, row) => {
        const level = row.permissions?.level || 'Basic';
        const colorMap: Record<PermissionLevel, 'default' | 'primary' | 'secondary'> = {
          Basic: 'default',
          Moderate: 'primary',
          Advanced: 'secondary',
        };
        return (
          <Chip
            label={level}
            size="small"
            color={colorMap[level]}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 150,
      format: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit Permissions">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditPermissions(row);
              }}
            >
              <SecurityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="text"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              alert('Edit user dialog would open here');
            }}
          >
            Edit
          </Button>
        </Box>
      ),
    },
  ];

  const allPermissions = getAllPermissionTypes();

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

      {/* Permission Management Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => {
          setPermissionDialogOpen(false);
          setSelectedUser(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">Manage Permissions</Typography>
          </Box>
          {selectedUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedUser.name} ({selectedUser.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Permission Levels:</strong>
                  <br />
                  <strong>Basic:</strong> Limited access, can only view assigned items
                  <br />
                  <strong>Moderate:</strong> Standard access, can view reports and download certificates
                  <br />
                  <strong>Advanced:</strong> Full access, can manage users, approve jobs, and access all features
                </Typography>
              </Alert>

              <FormControl component="fieldset" sx={{ mb: 4 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
                  Permission Level
                </FormLabel>
                <RadioGroup
                  value={selectedUser.permissions?.level || 'Basic'}
                  onChange={(e) => handlePermissionLevelChange(e.target.value as PermissionLevel)}
                >
                  <FormControlLabel value="Basic" control={<Radio />} label="Basic" />
                  <FormControlLabel value="Moderate" control={<Radio />} label="Moderate" />
                  <FormControlLabel value="Advanced" control={<Radio />} label="Advanced" />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Custom Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Override default permissions for this user. Toggle individual permissions on/off.
              </Typography>

              <Grid container spacing={2}>
                {allPermissions.map((permission) => {
                  const isEnabled =
                    selectedUser.permissions?.permissions[permission] !== undefined
                      ? selectedUser.permissions.permissions[permission] === true
                      : getDefaultPermissions(
                          selectedUser.currentRole || selectedUser.roles[0] || 'inspector',
                          selectedUser.permissions?.level || 'Basic'
                        ).permissions[permission] === true;

                  return (
                    <Grid item xs={12} sm={6} key={permission}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {permission}
                          </Typography>
                          <Tooltip title={getPermissionDescription(permission)}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'help',
                              }}
                            >
                              <InfoIcon fontSize="inherit" />
                              {getPermissionDescription(permission)}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <Switch
                          checked={isEnabled}
                          onChange={(e) => handlePermissionToggle(permission, e.target.checked)}
                          size="small"
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {selectedUser.roles.includes('inspector') && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Note for Inspectors:</strong> The "Create Job Order" permission controls whether this
                    inspector can create job orders independently. If disabled, they can only work on assigned jobs.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setPermissionDialogOpen(false);
            setSelectedUser(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleSavePermissions} variant="contained" color="primary">
            Save Permissions
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
