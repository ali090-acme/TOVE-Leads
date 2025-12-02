import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { UserRole } from '@/types';
import { useAppContext } from '@/context/AppContext';

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
  notificationCount = 0,
}) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

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
    // Clear current user
    setCurrentUser(null);
    // Navigate to login page
    navigate('/login');
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
        <IconButton color="inherit" onClick={handleNotifMenuOpen}>
          <Badge badgeContent={notificationCount} color="error">
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
        >
          <MenuItem disabled>
            <Typography variant="body2">{userName}</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Profile Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
        >
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">New job assignment: JO-2025001</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">Report approved for JO-2024050</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">Payment confirmed</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};



