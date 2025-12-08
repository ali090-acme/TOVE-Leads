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
  Checkbox,
  OutlinedInput,
  ListItemText,
  Avatar,
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
  const [delegatedToUserIds, setDelegatedToUserIds] = useState<string[]>([]); // Changed to array for multiple selection
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
    // Load existing delegates if any
    const existingDelegates = user.delegation?.delegates?.map(d => d.userId) || [];
    // Also check legacy field for backward compatibility
    if (user.delegation?.delegatedToId && !existingDelegates.includes(user.delegation.delegatedToId)) {
      existingDelegates.push(user.delegation.delegatedToId);
    }
    setDelegatedToUserIds(existingDelegates);
    setDelegationDialogOpen(true);
  };

  const handleSaveDelegation = () => {
    if (!selectedUser || delegatedToUserIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one user to delegate to',
        severity: 'error',
      });
      return;
    }

    // Get all selected delegate users
    const delegatedToUsers = delegatedToUserIds
      .map(id => users.find(u => u.id === id))
      .filter((u): u is User => u !== undefined);

    if (delegatedToUsers.length !== delegatedToUserIds.length) {
      setSnackbar({
        open: true,
        message: 'Some selected users not found',
        severity: 'error',
      });
      return;
    }

    // Create delegates array with priority order
    const delegates = delegatedToUserIds.map((userId, index) => {
      const user = delegatedToUsers.find(u => u.id === userId)!;
      return {
        userId,
        userName: user.name,
        priority: index + 1, // 1 = first shadow, 2 = second shadow, etc.
        active: true,
      };
    });

    const delegation: Delegation = {
      delegates,
      delegatedBy: currentUser?.id || 'system',
      delegatedByName: currentUser?.name || 'System',
      active: true,
      startDate: new Date(),
      // Legacy fields for backward compatibility
      delegatedToId: delegates[0]?.userId,
      delegatedToName: delegates[0]?.userName,
    };

    const updatedUser: User = {
      ...selectedUser,
      delegation,
    };

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? updatedUser : u));
    saveUsers(updatedUsers);

    // Log delegation action
    const delegateNames = delegates.map(d => d.userName).join(', ');
    logUserAction(
      'UPDATE',
      'USER',
      selectedUser.id,
      selectedUser.name,
      `Delegation assigned: ${selectedUser.name} → ${delegateNames} (${delegates.length} shadow${delegates.length > 1 ? 's' : ''})`,
      { delegation },
      delegates[0]?.userId || null, // Actual user (first delegate)
      delegates[0]?.userName || null, // Actual user name
      delegatedToUsers[0]?.currentRole || delegatedToUsers[0]?.roles[0] || 'inspector',
      selectedUser.id, // Displayed user
      selectedUser.name, // Displayed user name
      selectedUser.currentRole || selectedUser.roles[0] || 'manager'
    );

    setSnackbar({
      open: true,
      message: `Delegation assigned: ${delegateNames} will perform actions on behalf of ${selectedUser.name} (Priority: ${delegates.map(d => `${d.priority}. ${d.userName}`).join(', ')})`,
      severity: 'success',
    });
    setDelegationDialogOpen(false);
    setSelectedUser(null);
    setDelegatedToUserIds([]);
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
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Delegated To ({user.delegation?.delegates?.length || 1} shadow{user.delegation?.delegates?.length !== 1 ? 's' : ''}):
                      </Typography>
                      {user.delegation?.delegates && user.delegation.delegates.length > 0 ? (
                        user.delegation.delegates.map((delegate, idx) => (
                          <Box key={delegate.userId} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {delegate.priority}. {delegate.userName}
                              {delegate.priority === 1 && (
                                <Chip label="Primary" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
                              )}
                              {delegate.priority === 2 && (
                                <Chip label="Secondary" size="small" color="secondary" sx={{ ml: 1, height: 20 }} />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {delegate.priority === 1 
                                ? 'Will perform actions if available'
                                : `Will perform actions if shadow ${delegate.priority - 1} is busy`}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        // Legacy: show old single delegate format
                        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                          {user.delegation?.delegatedToName || 'N/A'}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Actions will show as "{user.name}" in front end
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Activity logs will show actual delegate's name for accountability
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
                        {user.delegation.delegates && user.delegation.delegates.length > 0 ? (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Delegated to ({user.delegation.delegates.length} shadow{user.delegation.delegates.length !== 1 ? 's' : ''}):
                            </Typography>
                            {user.delegation.delegates.map((delegate) => (
                              <Typography key={delegate.userId} variant="caption" color="text.secondary" display="block">
                                {delegate.priority}. <strong>{delegate.userName}</strong>
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Delegated to: <strong>{user.delegation.delegatedToName || 'N/A'}</strong>
                          </Typography>
                        )}
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
          setDelegatedToUserIds([]);
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
                <InputLabel>Select Users to Delegate To (Multiple Selection)</InputLabel>
                <Select
                  multiple
                  value={delegatedToUserIds}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDelegatedToUserIds(typeof value === 'string' ? value.split(',') : value);
                  }}
                  input={<OutlinedInput label="Select Users to Delegate To (Multiple Selection)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((userId) => {
                        const user = availableDelegates.find((u) => u.id === userId);
                        const index = delegatedToUserIds.indexOf(userId);
                        return (
                          <Chip
                            key={userId}
                            label={`${index + 1}. ${user?.name || userId}`}
                            size="small"
                            color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {availableDelegates.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox checked={delegatedToUserIds.indexOf(user.id) > -1} />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </Avatar>
                            {user.name}
                            {delegatedToUserIds.indexOf(user.id) === 0 && (
                              <Chip label="1st Shadow" size="small" color="primary" sx={{ height: 20, ml: 'auto' }} />
                            )}
                            {delegatedToUserIds.indexOf(user.id) === 1 && (
                              <Chip label="2nd Shadow" size="small" color="secondary" sx={{ height: 20, ml: 'auto' }} />
                            )}
                            {delegatedToUserIds.indexOf(user.id) > 1 && (
                              <Chip 
                                label={`${delegatedToUserIds.indexOf(user.id) + 1}rd Shadow`} 
                                size="small" 
                                sx={{ height: 20, ml: 'auto' }} 
                              />
                            )}
                          </Box>
                        }
                        secondary={`${user.email} - ${user.roles.join(', ')}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {delegatedToUserIds.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Dual Shadow System:</strong>
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {delegatedToUserIds.map((userId, index) => {
                        const user = availableDelegates.find((u) => u.id === userId);
                        return (
                          <li key={userId}>
                            <strong>Shadow {index + 1}:</strong> {user?.name} 
                            {index === 0 && ' (Primary - will perform actions if available)'}
                            {index > 0 && ` (Will perform actions if Shadow ${index} is busy)`}
                          </li>
                        );
                      })}
                    </ul>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    All actions will be logged with the actual delegate's name for accountability, but will show as "{selectedUser.name}" in the front end.
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
              setDelegatedToUserIds([]);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDelegation}
            variant="contained"
            color="primary"
            disabled={delegatedToUserIds.length === 0}
          >
            Assign Delegation{delegatedToUserIds.length > 1 ? ` (${delegatedToUserIds.length} shadows)` : ''}
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

