import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { Notification } from '@/types';
import { format } from 'date-fns';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, currentUser } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by read/unread status
    if (filter === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter((n) => n.read);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notifications, filter, typeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        return '#3498db';
      case 'approval':
        return '#27ae60';
      case 'payment':
        return '#3498db';
      case 'expiry':
        return '#e67e22';
      default:
        return '#95a5a6';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    // Navigate to link if available
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your notifications
        </Typography>
      </Box>

      {/* Stats and Filters */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                {notifications.length} Total Notifications
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {unreadCount} unread • {notifications.length - unreadCount} read
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Button
                variant="contained"
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Mark All as Read
              </Button>
            )}
          </Box>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                label="Filter by Status"
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={typeFilter}
                label="Filter by Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="approval">Approval</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="expiry">Expiry</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {filteredNotifications.length > 0 ? (
            <Box>
              {filteredNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Box
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      p: 3,
                      borderLeft: notification.read ? 'none' : '4px solid',
                      borderColor: '#1e3c72',
                      bgcolor: notification.read ? 'transparent' : '#f0f7ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      '&:hover': {
                        bgcolor: notification.read ? 'grey.50' : '#e3f2fd',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: getNotificationColor(notification.type),
                        color: 'white',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight={notification.read ? 500 : 700}
                          sx={{
                            color: notification.read ? 'text.primary' : '#1e3c72',
                            flexGrow: 1,
                            pr: 2,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: '#1e3c72',
                                color: 'white',
                              }}
                            />
                          )}
                          <Chip
                            label={notification.type}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              bgcolor: getNotificationColor(notification.type),
                              color: 'white',
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
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
                        {notification.link && (
                          <Chip
                            label="View Details"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: '#1e3c72',
                              color: 'white',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: '#0e2c62',
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {index < filteredNotifications.length - 1 && (
                    <Divider sx={{ mx: 3 }} />
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.4 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notifications Found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? 'No read notifications found.'
                  : 'No notifications match your filters.'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

