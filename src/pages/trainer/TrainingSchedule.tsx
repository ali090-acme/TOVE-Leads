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
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            Training Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your scheduled training sessions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
            },
          }}
        >
          Schedule New Session
        </Button>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
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



