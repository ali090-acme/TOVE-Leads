import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const TrainingSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { trainingSessions } = useAppContext();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Training Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your scheduled training sessions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Schedule New Session
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Upcoming Sessions
          </Typography>
          <List>
            {trainingSessions.map((session, index) => (
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
                        {format(session.scheduledDateTime, 'EEEE, MMMM dd, yyyy - hh:mm a')}
                        <br />
                        Location: {session.location}
                        <br />
                        Participants: {session.attendanceList.length}
                      </>
                    }
                  />
                </ListItem>
                {index < trainingSessions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {trainingSessions.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No scheduled sessions
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};



