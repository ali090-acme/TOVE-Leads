import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Notifications as PushIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

export const CommunicationPreferences: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('communication-language') || 'English';
  });
  
  const [pushNotifications, setPushNotifications] = useState(() => {
    return localStorage.getItem('push-notifications') !== 'false';
  });
  
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('email-notifications') !== 'false';
  });
  
  const [smsNotifications, setSmsNotifications] = useState(() => {
    return localStorage.getItem('sms-notifications') === 'true';
  });

  // Notification types
  const [newCard, setNewCard] = useState(() => {
    return localStorage.getItem('notif-new-card') !== 'false';
  });
  const [birthday, setBirthday] = useState(() => {
    return localStorage.getItem('notif-birthday') !== 'false';
  });
  const [expiryAlerts, setExpiryAlerts] = useState(() => {
    return localStorage.getItem('notif-expiry') !== 'false';
  });
  const [discounts, setDiscounts] = useState(() => {
    return localStorage.getItem('notif-discounts') !== 'false';
  });
  const [nationalDay, setNationalDay] = useState(() => {
    return localStorage.getItem('notif-national-day') !== 'false';
  });

  // Frequency settings
  const [frequencySettings, setFrequencySettings] = useState({
    newCard: (localStorage.getItem('freq-new-card') || 'immediate') as 'immediate' | 'daily' | 'weekly',
    birthday: (localStorage.getItem('freq-birthday') || 'immediate') as 'immediate' | 'daily' | 'weekly',
    expiryAlerts: (localStorage.getItem('freq-expiry') || 'daily') as 'immediate' | 'daily' | 'weekly',
    discounts: (localStorage.getItem('freq-discounts') || 'immediate') as 'immediate' | 'daily' | 'weekly',
    nationalDay: (localStorage.getItem('freq-national-day') || 'immediate') as 'immediate' | 'daily' | 'weekly',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const languages = ['English', 'Arabic', 'Urdu', 'Bangla', 'Hindi'];
  const frequencyOptions: Array<'immediate' | 'daily' | 'weekly'> = ['immediate', 'daily', 'weekly'];

  const handleSave = () => {
    // Save all preferences to localStorage
    localStorage.setItem('communication-language', language);
    localStorage.setItem('push-notifications', pushNotifications.toString());
    localStorage.setItem('email-notifications', emailNotifications.toString());
    localStorage.setItem('sms-notifications', smsNotifications.toString());
    localStorage.setItem('notif-new-card', newCard.toString());
    localStorage.setItem('notif-birthday', birthday.toString());
    localStorage.setItem('notif-expiry', expiryAlerts.toString());
    localStorage.setItem('notif-discounts', discounts.toString());
    localStorage.setItem('notif-national-day', nationalDay.toString());
    localStorage.setItem('freq-new-card', frequencySettings.newCard);
    localStorage.setItem('freq-birthday', frequencySettings.birthday);
    localStorage.setItem('freq-expiry', frequencySettings.expiryAlerts);
    localStorage.setItem('freq-discounts', frequencySettings.discounts);
    localStorage.setItem('freq-national-day', frequencySettings.nationalDay);

    setSnackbar({
      open: true,
      message: 'Communication preferences saved successfully!',
      severity: 'success',
    });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/client/settings')}
          sx={{ mb: 2 }}
        >
          Back to Settings
        </Button>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Communication Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your notification and communication settings
        </Typography>
      </Box>

      {/* Preferred Language */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Preferred Language
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            This will affect all notifications and communications
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label="Language"
              startAdornment={<LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {languages.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Delivery Methods
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <PushIcon sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Push Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive notifications on your device
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                color="primary"
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <EmailIcon sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive notifications via email
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                color="primary"
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <SmsIcon sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    SMS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive notifications via SMS
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                color="primary"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Notification Types
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <List>
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    New Card Issued
                  </Typography>
                  <Switch
                    checked={newCard}
                    onChange={(e) => setNewCard(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={frequencySettings.newCard}
                    onChange={(e) =>
                      setFrequencySettings({
                        ...frequencySettings,
                        newCard: e.target.value as 'immediate' | 'daily' | 'weekly',
                      })
                    }
                    disabled={!newCard}
                  >
                    {frequencyOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Birthday Wishes
                  </Typography>
                  <Switch
                    checked={birthday}
                    onChange={(e) => setBirthday(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={frequencySettings.birthday}
                    onChange={(e) =>
                      setFrequencySettings({
                        ...frequencySettings,
                        birthday: e.target.value as 'immediate' | 'daily' | 'weekly',
                      })
                    }
                    disabled={!birthday}
                  >
                    {frequencyOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Certificate Expiry Alerts
                  </Typography>
                  <Switch
                    checked={expiryAlerts}
                    onChange={(e) => setExpiryAlerts(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={frequencySettings.expiryAlerts}
                    onChange={(e) =>
                      setFrequencySettings({
                        ...frequencySettings,
                        expiryAlerts: e.target.value as 'immediate' | 'daily' | 'weekly',
                      })
                    }
                    disabled={!expiryAlerts}
                  >
                    {frequencyOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Discounts & Promotions
                  </Typography>
                  <Switch
                    checked={discounts}
                    onChange={(e) => setDiscounts(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={frequencySettings.discounts}
                    onChange={(e) =>
                      setFrequencySettings({
                        ...frequencySettings,
                        discounts: e.target.value as 'immediate' | 'daily' | 'weekly',
                      })
                    }
                    disabled={!discounts}
                  >
                    {frequencyOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    National Day Greetings
                  </Typography>
                  <Switch
                    checked={nationalDay}
                    onChange={(e) => setNationalDay(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={frequencySettings.nationalDay}
                    onChange={(e) =>
                      setFrequencySettings({
                        ...frequencySettings,
                        nationalDay: e.target.value as 'immediate' | 'daily' | 'weekly',
                      })
                    }
                    disabled={!nationalDay}
                  >
                    {frequencyOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
            },
          }}
        >
          Save Preferences
        </Button>
      </Box>

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

