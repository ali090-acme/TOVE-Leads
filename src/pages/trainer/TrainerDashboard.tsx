import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
  Skeleton,
  Avatar,
} from '@mui/material';
import { School as TrainingIcon, PendingActions as PendingIcon, Event as CalendarIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const TrainerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { trainingSessions } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const upcomingSessions = trainingSessions.filter((s) => s.status === 'Scheduled');
  const pendingSubmissions = trainingSessions.filter((s) => s.status === 'Completed' && s.approvalStatus === 'Pending');

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={400} height={30} sx={{ mb: 4 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Trainer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage training sessions and submit assessment results
        </Typography>
      </Box>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Upcoming Sessions
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {upcomingSessions.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <CalendarIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Sessions This Month
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {trainingSessions.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <TrainingIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Pending Submissions
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {pendingSubmissions.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PendingIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Training Schedule */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Training Sessions
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/trainer/schedule')}
                  sx={{
                    color: '#1e3c72',
                    fontWeight: 600,
                  }}
                >
                  View Calendar
                </Button>
              </Box>
              {upcomingSessions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No upcoming sessions scheduled
                </Typography>
              ) : (
                <List>
                  {upcomingSessions.map((session, index) => (
                    <React.Fragment key={session.id}>
                      <ListItem
                        sx={{ px: 0, cursor: 'pointer' }}
                        onClick={() => navigate(`/trainer/results/${session.id}`)}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight={500}>
                                Session {session.id}
                              </Typography>
                              <Chip label={session.status} size="small" color="info" />
                            </Box>
                          }
                          secondary={
                            <>
                              {format(session.scheduledDateTime, 'MMM dd, yyyy - hh:mm a')}
                              <br />
                              Location: {session.location}
                              <br />
                              Participants: {session.attendanceList.length}
                            </>
                          }
                        />
                      </ListItem>
                      {index < upcomingSessions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Assessment Submissions */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Pending Assessment Submissions
                </Typography>
              </Box>
              {pendingSubmissions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pending submissions
                </Typography>
              ) : (
                <List>
                  {pendingSubmissions.map((session, index) => (
                    <React.Fragment key={session.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight={500}>
                                Session {session.id}
                              </Typography>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => navigate(`/trainer/results/${session.id}`)}
                                sx={{
                                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                                  },
                                }}
                              >
                                Submit Results
                              </Button>
                            </Box>
                          }
                          secondary={
                            <>
                              Completed: {format(session.scheduledDateTime, 'MMM dd, yyyy')}
                              <br />
                              Participants: {session.attendanceList.length}
                            </>
                          }
                        />
                      </ListItem>
                      {index < pendingSubmissions.length - 1 && <Divider />}
                    </React.Fragment>
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




