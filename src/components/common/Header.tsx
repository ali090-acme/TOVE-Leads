import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  SelectChangeEvent,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { UserRole } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { logUserAction } from '@/utils/activityLogger';
import { format } from 'date-fns';

interface HeaderProps {
  onMenuClick: () => void;
  userRole: UserRole;
  userRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  userName: string;
  notificationCount?: number;
}

const roleLabels: Record<UserRole, string> = {
  client: 'Client Portal',
  inspector: 'Inspector',
  trainer: 'Trainer',
  supervisor: 'Supervisor',
  accountant: 'Accountant',
  manager: 'Manager',
  gm: 'General Manager',
};

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  userRole,
  userRoles,
  onRoleChange,
  userName,
  notificationCount: propNotificationCount,
}) => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser, notifications, markNotificationAsRead } = useAppContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  // Get unread notification count
  const unreadCount = useMemo(() => {
    if (propNotificationCount !== undefined) return propNotificationCount;
    return notifications.filter(n => !n.read).length;
  }, [notifications, propNotificationCount]);

  // Get recent notifications (last 5, sorted by date)
  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <AssignmentIcon fontSize="small" />;
      case 'approval':
        return <CheckCircleIcon fontSize="small" />;
      case 'payment':
        return <PaymentIcon fontSize="small" />;
      case 'expiry':
        return <ScheduleIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'primary';
      case 'approval':
        return 'success';
      case 'payment':
        return 'info';
      case 'expiry':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleNotificationClick = (notification: any) => {
    handleMenuClose();
    // Mark notification as read
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    // Navigate to the link if available
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  const handleRoleChange = (event: SelectChangeEvent<UserRole>) => {
    onRoleChange(event.target.value as UserRole);
  };

  const handleLogout = () => {
    handleMenuClose();
    // Log logout action
    if (currentUser) {
      logUserAction(
        'LOGOUT',
        'USER',
        currentUser.id,
        currentUser.name,
        `User logged out from ${roleLabels[userRole]}`,
        { role: userRole },
        currentUser.id,
        currentUser.name,
        userRole
      );
    }
    // Clear current user
    setCurrentUser(null);
    // Navigate to login page
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    // Navigate to profile based on role
    const profileRoutes: Record<UserRole, string> = {
      client: '/client/profile',
      inspector: '/inspector',
      trainer: '/trainer',
      supervisor: '/supervisor',
      accountant: '/accountant',
      manager: '/manager',
      gm: '/manager',
    };
    navigate(profileRoutes[userRole] || '/client/profile');
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    // Navigate to settings based on role
    const settingsRoutes: Record<UserRole, string> = {
      client: '/client/settings',
      inspector: '/inspector',
      trainer: '/trainer',
      supervisor: '/supervisor',
      accountant: '/accountant',
      manager: '/manager',
      gm: '/manager',
    };
    navigate(settingsRoutes[userRole] || '/client/settings');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ mr: 3 }}>
          TOVE Leeds Compliance System
        </Typography>

        {/* Global Search */}
        <TextField
          size="small"
          placeholder="Search by Job ID, Client, Certificate..."
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 1,
            width: 300,
            mr: 2,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {/* Role Selector (for multi-role users) */}
        {userRoles.length > 1 && (
          <FormControl size="small" sx={{ mr: 2, minWidth: 150 }}>
            <Select
              value={userRole}
              onChange={handleRoleChange}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              {userRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {roleLabels[role]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Notifications */}
        <IconButton 
          color="inherit" 
          onClick={handleNotifMenuOpen}
          sx={{
            position: 'relative',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                minWidth: 18,
                height: 18,
                fontWeight: 600,
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* User Profile */}
        <IconButton
          edge="end"
          aria-label="account of current user"
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {userName.charAt(0)}
          </Avatar>
        </IconButton>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            },
          }}
        >
          {/* User Info Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  fontWeight: 600,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.9,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 0.25,
                  }}
                >
                  {currentUser?.email && (
                    <>
                      <EmailIcon sx={{ fontSize: 12 }} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentUser.email}
                      </span>
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={roleLabels[userRole]}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </Box>
          <Divider />
          {/* Menu Items */}
          <MenuItem
            onClick={handleProfileClick}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="View Profile"
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 500,
              }}
            />
          </MenuItem>
          <MenuItem
            onClick={handleSettingsClick}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 500,
              }}
            />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 600,
              }}
            />
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 400,
              maxHeight: 600,
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2.5,
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Notifications
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.95, fontSize: '0.8125rem' }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {unreadCount}
              </Box>
            )}
          </Box>
          
          {recentNotifications.length > 0 ? (
            <>
              <Box 
                sx={{ 
                  maxHeight: 450, 
                  overflowY: 'auto', 
                  overflowX: 'hidden',
                  p: 0,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#ccc',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#999',
                    },
                  },
                }}
              >
                {recentNotifications.map((notification, index) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      px: 2.5,
                      borderLeft: notification.read ? 'none' : '4px solid',
                      borderColor: '#1e3c72',
                      bgcolor: notification.read ? 'transparent' : '#f0f7ff',
                      '&:hover': {
                        bgcolor: notification.read ? 'grey.50' : '#e3f2fd',
                      },
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      minHeight: 'auto',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#1e3c72',
                        color: 'white',
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={notification.read ? 500 : 700}
                          sx={{ 
                            color: notification.read ? 'text.primary' : '#1e3c72',
                            flexGrow: 1,
                            pr: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: '#1e3c72',
                              color: 'white',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                          mb: 0.75,
                          fontSize: '0.8125rem',
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.disabled" 
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        {format(notification.createdAt, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
          </MenuItem>
                ))}
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/notifications');
                }}
                sx={{
                  py: 1.75,
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#1e3c72',
                  fontSize: '0.875rem',
                  '&:hover': {
                    bgcolor: 'grey.50',
                  },
                }}
              >
                View All Notifications
          </MenuItem>
            </>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.4 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                No notifications
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                You're all caught up!
              </Typography>
            </Box>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};



