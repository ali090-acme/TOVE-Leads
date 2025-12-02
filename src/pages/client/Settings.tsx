import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Description as LegalIcon,
  PrivacyTip as PrivacyIcon,
  Logout as LogoutIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppContext();
  
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('app-language') || 'English';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark' | 'auto') || 'auto';
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('two-factor-enabled') === 'true';
  });
  
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileUpdateDialog, setMobileUpdateDialog] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const languages = ['English', 'Arabic', 'Urdu', 'Bangla', 'Hindi'];
  const themes = [
    { label: 'Light', value: 'light' as const },
    { label: 'Dark', value: 'dark' as const },
    { label: 'Auto', value: 'auto' as const },
  ];

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
    setLanguageMenuAnchor(null);
    setSnackbar({
      open: true,
      message: `Language changed to ${lang}`,
      severity: 'success',
    });
  };

  const handleThemeSelect = (themeValue: 'light' | 'dark' | 'auto') => {
    setTheme(themeValue);
    localStorage.setItem('app-theme', themeValue);
    setThemeMenuAnchor(null);
    setSnackbar({
      open: true,
      message: `Theme changed to ${themes.find(t => t.value === themeValue)?.label}`,
      severity: 'success',
    });
    // Apply theme (in real app, this would update the theme provider)
    if (themeValue === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (themeValue === 'light') {
      document.body.classList.remove('dark-theme');
    } else {
      // Auto - use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    localStorage.setItem('two-factor-enabled', enabled.toString());
    setSnackbar({
      open: true,
      message: enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
      severity: 'success',
    });
  };

  const handleMobileUpdate = () => {
    if (!newMobileNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid mobile number',
        severity: 'error',
      });
      return;
    }
    
    // Simulate SMS verification
    setSnackbar({
      open: true,
      message: `SMS verification code will be sent to ${newMobileNumber}`,
      severity: 'success',
    });
    setMobileUpdateDialog(false);
    setNewMobileNumber('');
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to sign out?')) {
      setCurrentUser(null);
      navigate('/login');
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your preferences and account settings
        </Typography>
      </Box>

      {/* Language & Region */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Language & Region
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <LanguageIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Language"
                  secondary={language}
                  secondaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }}
                />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Appearance
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <ThemeIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Theme"
                  secondary={themes.find(t => t.value === theme)?.label}
                  secondaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }}
                />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Security */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Security
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemIcon>
                <SecurityIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security"
              />
              <Switch
                checked={twoFactorEnabled}
                onChange={(e) => handleTwoFactorToggle(e.target.checked)}
                color="primary"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Account */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Account
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setMobileUpdateDialog(true)}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <PhoneIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Update Mobile Number"
                  secondary="Via SMS verification"
                />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Profile
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate('/client/profile')}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <PersonIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Change Profile Picture"
                  secondary="Update your profile photo"
                />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate('/client/communication-preferences')}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <NotificationsIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Communication Preferences"
                  secondary="Notification settings"
                />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Legal
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate('/client/legal')}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <LegalIcon sx={{ color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText primary="Legal Information" />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate('/client/privacy')}
                sx={{ px: 3, py: 2 }}
              >
                <ListItemIcon>
                  <PrivacyIcon sx={{ color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText primary="Privacy Policy" />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  px: 3,
                  py: 2,
                  '&:hover': {
                    bgcolor: 'error.light',
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out / Switch user"
                  primaryTypographyProps={{ color: 'error.main', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Language Menu */}
      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={() => setLanguageMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: languageMenuAnchor ? languageMenuAnchor.clientWidth : undefined,
            borderRadius: 2,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang}
            onClick={() => handleLanguageSelect(lang)}
            selected={lang === language}
          >
            {lang}
          </MenuItem>
        ))}
      </Menu>

      {/* Theme Menu */}
      <Menu
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={() => setThemeMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: themeMenuAnchor ? themeMenuAnchor.clientWidth : undefined,
            borderRadius: 2,
          },
        }}
      >
        {themes.map((t) => (
          <MenuItem
            key={t.value}
            onClick={() => handleThemeSelect(t.value)}
            selected={t.value === theme}
          >
            {t.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Update Dialog */}
      <Dialog
        open={mobileUpdateDialog}
        onClose={() => setMobileUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
          Update Mobile Number
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            We will send an SMS verification code to your new number.
          </Alert>
          <TextField
            fullWidth
            label="New Mobile Number"
            placeholder="+971 50 123 4567"
            value={newMobileNumber}
            onChange={(e) => setNewMobileNumber(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMobileUpdateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleMobileUpdate}
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
              },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

