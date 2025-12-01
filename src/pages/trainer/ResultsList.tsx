import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const ResultsList: React.FC = () => {
  const navigate = useNavigate();
  const { trainingSessions } = useAppContext();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Pending Assessment Submissions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Submit attendance and assessment results for completed sessions
      </Typography>

      <Card>
        <CardContent>
          <List>
            {trainingSessions.map((session, index) => (
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
                {index < trainingSessions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {trainingSessions.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No pending submissions
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};



