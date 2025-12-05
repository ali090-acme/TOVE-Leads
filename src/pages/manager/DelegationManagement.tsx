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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { User, Delegation } from '@/types';
import { logUserAction } from '@/utils/activityLogger';

const STORAGE_KEY_USERS = 'users';

export const DelegationManagement: React.FC = () => {
  const { users: contextUsers, currentUser, setCurrentUser, setUsers: setContextUsers } = useAppContext();
  const [users, setUsers] = useState<User[]>(contextUsers);
  const [delegationDialogOpen, setDelegationDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [delegatedToUserId, setDelegatedToUserId] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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
    }
  }, [contextUsers]);

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    // Also update AppContext's users state
    if (setContextUsers) {
      setContextUsers(updatedUsers);
    }
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('usersUpdated'));
  };

  const handleOpenDelegation = (user: User) => {
    setSelectedUser(user);
    setDelegatedToUserId(user.delegation?.delegatedToId || '');
    setDelegationDialogOpen(true);
  };

  const handleSaveDelegation = () => {
    if (!selectedUser || !delegatedToUserId) {
      setSnackbar({
        open: true,
        message: 'Please select a user to delegate to',
        severity: 'error',
      });
      return;
    }

    const delegatedToUser = users.find((u) => u.id === delegatedToUserId);
    if (!delegatedToUser) {
      setSnackbar({
        open: true,
        message: 'Selected user not found',
        severity: 'error',
      });
      return;
    }

    const delegation: Delegation = {
      delegatedToId: delegatedToUserId,
      delegatedToName: delegatedToUser.name,
      delegatedBy: currentUser?.id || 'system',
      delegatedByName: currentUser?.name || 'System',
      active: true,
      startDate: new Date(),
    };

    const updatedUser: User = {
      ...selectedUser,
      delegation,
    };

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? updatedUser : u));
    saveUsers(updatedUsers);

    // Log delegation action
    logUserAction(
      'UPDATE',
      'USER',
      selectedUser.id,
      selectedUser.name,
      `Delegation assigned: ${selectedUser.name} → ${delegatedToUser.name}`,
      { delegation },
      delegatedToUser.id, // Actual user (Fatima)
      delegatedToUser.name, // Actual user name
      delegatedToUser.currentRole || delegatedToUser.roles[0] || 'inspector',
      selectedUser.id, // Displayed user (Salman)
      selectedUser.name, // Displayed user name
      selectedUser.currentRole || selectedUser.roles[0] || 'manager'
    );

    setSnackbar({
      open: true,
      message: `Delegation assigned: ${delegatedToUser.name} will perform actions on behalf of ${selectedUser.name}`,
      severity: 'success',
    });
    setDelegationDialogOpen(false);
    setSelectedUser(null);
    setDelegatedToUserId('');
  };

  const handleRemoveDelegation = (user: User) => {
    if (!confirm(`Remove delegation for ${user.name}?`)) return;

    const updatedUser: User = {
      ...user,
      delegation: undefined,
    };

    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    saveUsers(updatedUsers);

    logUserAction(
      'UPDATE',
      'USER',
      user.id,
      user.name,
      `Delegation removed for ${user.name}`,
      {},
      currentUser?.id || null,
      currentUser?.name || null,
      currentUser?.currentRole || null
    );

    setSnackbar({
      open: true,
      message: `Delegation removed for ${user.name}`,
      severity: 'success',
    });
  };

  // Get users who can be delegated to (not managers/supervisors themselves)
  const availableDelegates = users.filter(
    (u) =>
      u.id !== selectedUser?.id &&
      (u.roles.includes('inspector') || u.roles.includes('trainer') || u.roles.includes('accountant'))
  );

  // Get users with active delegations
  const usersWithDelegation = users.filter((u) => u.delegation?.active);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            Shadow Role / Delegation Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign users to perform actions on behalf of technical managers. Activity logs will show actual user for accountability.
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> When you delegate actions to another user (e.g., Shahid), they will perform the action,
          but the front end will show your name (e.g., Jane). Activity logs will show Shahid's name for accountability.
        </Typography>
      </Alert>

      {/* Active Delegations */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Active Delegations
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          {usersWithDelegation.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No active delegations
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {usersWithDelegation.map((user) => (
                <Grid item xs={12} md={6} key={user.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Chip label="Active" color="success" size="small" />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Delegated To:
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {user.delegation?.delegatedToName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Actions will show as "{user.name}" in front end
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Activity logs will show "{user.delegation?.delegatedToName}" for accountability
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveDelegation(user)}
                    >
                      Remove Delegation
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Assign Delegation */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Assign Delegation
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={2}>
            {users
              .filter((u) => u.roles.includes('manager') || u.roles.includes('supervisor') || u.roles.includes('gm'))
              .map((user) => (
                <Grid item xs={12} md={6} key={user.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      {user.delegation?.active ? (
                        <Chip label="Delegated" color="success" size="small" />
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleOpenDelegation(user)}
                        >
                          Assign
                        </Button>
                      )}
                    </Box>
                    {user.delegation?.active && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Delegated to: <strong>{user.delegation.delegatedToName}</strong>
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Delegation Dialog */}
      <Dialog
        open={delegationDialogOpen}
        onClose={() => {
          setDelegationDialogOpen(false);
          setSelectedUser(null);
          setDelegatedToUserId('');
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Assign Shadow Role
            </Typography>
          </Box>
          {selectedUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Assign a user to perform actions on behalf of {selectedUser.name}
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  When actions are performed by the delegated user, they will appear as "{selectedUser.name}" in the front end,
                  but activity logs will show the actual user's name for accountability.
                </Typography>
              </Alert>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select User to Delegate To</InputLabel>
                <Select
                  value={delegatedToUserId}
                  onChange={(e) => setDelegatedToUserId(e.target.value)}
                  label="Select User to Delegate To"
                >
                  {availableDelegates.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.roles.join(', ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {delegatedToUserId && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> The selected user will be able to perform actions on behalf of {selectedUser.name}.
                    All actions will be logged with the actual user's name for accountability.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setDelegationDialogOpen(false);
              setSelectedUser(null);
              setDelegatedToUserId('');
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDelegation}
            variant="contained"
            color="primary"
            disabled={!delegatedToUserId}
          >
            Assign Delegation
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

