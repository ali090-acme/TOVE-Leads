import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Assignment as JobIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  EventBusy as BusyIcon,
  EventAvailable as AvailableIcon,
} from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { JobOrder } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

export const InspectorSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, currentUser } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter job orders for current inspector
  const assignedJobs = useMemo(() => {
    return jobOrders.filter(
      (job) => job.assignedTo === currentUser?.id || job.assignedTo === 'user-2'
    );
  }, [jobOrders, currentUser]);

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return assignedJobs
      .filter((job) => {
        const jobDate = new Date(job.dateTime);
        return jobDate >= today && jobDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [assignedJobs]);

  // Get all busy dates
  const busyDates = useMemo(() => {
    return assignedJobs
      .filter((job) => job.status !== 'Completed' && job.status !== 'Approved')
      .map((job) => new Date(job.dateTime));
  }, [assignedJobs]);

  // Check if a date is busy
  const isDateBusy = (date: Date): boolean => {
    return busyDates.some((busyDate) => isSameDay(busyDate, date));
  };

  // Get jobs for selected date
  const jobsForSelectedDate = useMemo(() => {
    return assignedJobs.filter((job) => isSameDay(new Date(job.dateTime), selectedDate));
  }, [assignedJobs, selectedDate]);

  // Calculate availability stats
  const availabilityStats = useMemo(() => {
    const today = new Date();
    const next30Days = addDays(today, 30);
    const upcomingJobs = assignedJobs.filter(
      (job) => {
        const jobDate = new Date(job.dateTime);
        return jobDate >= today && jobDate <= next30Days;
      }
    );

    const busyDaysSet = new Set(
      upcomingJobs.map((job) => format(new Date(job.dateTime), 'yyyy-MM-dd'))
    );

    const totalDays = 30;
    const busyDays = busyDaysSet.size;
    const availableDays = totalDays - busyDays;

    return {
      totalDays,
      busyDays,
      availableDays,
      engagementRate: Math.round((busyDays / totalDays) * 100),
    };
  }, [assignedJobs]);

  // Get status color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'In Progress':
        return 'info';
      default:
        return 'default';
    }
  };

  // Custom calendar day renderer
  const renderCalendarDay = (day: Date) => {
    const isBusy = isDateBusy(day);
    const isSelected = isSameDay(day, selectedDate);
    const isTodayDate = isToday(day);
    const isPastDate = isPast(day) && !isTodayDate;

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          backgroundColor: isSelected
            ? 'primary.main'
            : isBusy
            ? 'warning.light'
            : isTodayDate
            ? 'info.light'
            : 'transparent',
          color: isSelected ? 'white' : isPastDate ? 'text.disabled' : 'text.primary',
          fontWeight: isTodayDate ? 700 : isBusy ? 600 : 400,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
          },
        }}
      >
        {format(day, 'd')}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          My Schedule
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your upcoming appointments, busy days, and availability
        </Typography>
      </Box>

      {/* Availability Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Upcoming Appointments
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {upcomingAppointments.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3, background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusyIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Busy Days (Next 30)
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {availabilityStats.busyDays}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3, background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AvailableIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Available Days
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {availabilityStats.availableDays}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimeIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Engagement Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {availabilityStats.engagementRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Calendar View */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Calendar View
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticDatePicker
                  value={selectedDate}
                  onChange={(newDate) => newDate && setSelectedDate(newDate)}
                  displayStaticWrapperAs="desktop"
                  sx={{
                    '& .MuiPickersDay-root': {
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                      '&.MuiPickersDay-today': {
                        border: '2px solid',
                        borderColor: 'info.main',
                      },
                    },
                  }}
                  slotProps={{
                    actionBar: {
                      actions: ['today'],
                    },
                  }}
                />
              </LocalizationProvider>

              {/* Legend */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Legend:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: 'info.light', borderRadius: 0.5 }} />
                    <Typography variant="caption">Today</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: 'warning.light', borderRadius: 0.5 }} />
                    <Typography variant="caption">Busy</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                    <Typography variant="caption">Selected</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments & Selected Date Jobs */}
        <Grid item xs={12} md={6}>
          {/* Selected Date Jobs */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMMM dd, yyyy')}
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {jobsForSelectedDate.length === 0 ? (
                <Alert severity="info">
                  No jobs scheduled for this date
                </Alert>
              ) : (
                <List>
                  {jobsForSelectedDate.map((job) => (
                    <ListItem
                      key={job.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => navigate(`/inspector/jobs/${job.id}`)}
                    >
                      <ListItemIcon>
                        <JobIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {job.clientName}
                            </Typography>
                            <Chip
                              label={job.status}
                              size="small"
                              color={getStatusColor(job.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon fontSize="small" sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {format(new Date(job.dateTime), 'hh:mm a')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationIcon fontSize="small" sx={{ fontSize: 14 }} />
                              <Typography variant="caption">{job.location}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {job.serviceType} • {job.id}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Upcoming Appointments (Next 7 Days)
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {upcomingAppointments.length === 0 ? (
                <Alert severity="info">
                  No upcoming appointments in the next 7 days
                </Alert>
              ) : (
                <List>
                  {upcomingAppointments.map((job) => (
                    <ListItem
                      key={job.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => navigate(`/inspector/jobs/${job.id}`)}
                    >
                      <ListItemIcon>
                        {job.status === 'Completed' || job.status === 'Approved' ? (
                          <CompletedIcon color="success" />
                        ) : (
                          <PendingIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {format(new Date(job.dateTime), 'MMM dd')}
                            </Typography>
                            <Typography variant="body2">•</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {job.clientName}
                            </Typography>
                            <Chip
                              label={job.status}
                              size="small"
                              color={getStatusColor(job.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {format(new Date(job.dateTime), 'hh:mm a')} • {job.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {job.serviceType}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

