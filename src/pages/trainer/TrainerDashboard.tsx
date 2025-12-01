import React from 'react';
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
} from '@mui/material';
import { School as TrainingIcon, PendingActions as PendingIcon, Event as CalendarIcon } from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { mockTrainingSessions } from '@/utils/mockData';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const TrainerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const upcomingSessions = mockTrainingSessions.filter((s) => s.status === 'Scheduled');
  const pendingSubmissions = mockTrainingSessions.filter((s) => s.status === 'Completed' && s.approvalStatus === 'Pending');

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Trainer Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage training sessions and submit assessment results
      </Typography>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Upcoming Sessions"
            value={upcomingSessions.length}
            icon={<CalendarIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Sessions This Month"
            value={mockTrainingSessions.length}
            icon={<TrainingIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Pending Submissions"
            value={pendingSubmissions.length}
            icon={<PendingIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Training Schedule */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Training Sessions
                </Typography>
                <Button size="small" onClick={() => navigate('/trainer/schedule')}>
                  View Calendar
                </Button>
              </Box>
              <List>
                {upcomingSessions.map((session, index) => (
                  <React.Fragment key={session.id}>
                    <ListItem
                      sx={{ px: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/trainer/sessions/${session.id}`)}
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
                {upcomingSessions.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming sessions scheduled
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Assessment Submissions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Pending Assessment Submissions
                </Typography>
              </Box>
              <List>
                {mockTrainingSessions.map((session, index) => (
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
                              variant="outlined"
                              onClick={() => navigate(`/trainer/results/${session.id}`)}
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
                    {index < mockTrainingSessions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {mockTrainingSessions.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No pending submissions
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};




