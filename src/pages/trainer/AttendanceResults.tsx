import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Select,
  MenuItem,
  Button,
  Alert,
  TextField,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { mockTrainingSessions } from '@/utils/mockData';
import { format } from 'date-fns';
// Types are defined inline for this component

export const AttendanceResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = mockTrainingSessions.find((s) => s.id === sessionId);

  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Pending'>>(
    session?.attendanceList.reduce((acc, p) => ({ ...acc, [p.id]: p.attendance }), {}) || {}
  );

  const [assessments, setAssessments] = useState<Record<string, { outcome: string; score?: number }>>(
    session?.assessmentResults.reduce(
      (acc, a) => ({ ...acc, [a.participantId]: { outcome: a.outcome, score: a.score } }),
      {}
    ) || {}
  );

  const [notes, setNotes] = useState('');

  if (!session) {
    return <Alert severity="error">Training session not found</Alert>;
  }

  const handleAttendanceChange = (participantId: string, status: 'Present' | 'Absent') => {
    setAttendance({ ...attendance, [participantId]: status });
  };

  const handleAssessmentChange = (participantId: string, field: 'outcome' | 'score', value: any) => {
    setAssessments({
      ...assessments,
      [participantId]: { ...assessments[participantId], [field]: value },
    });
  };

  const handleSubmit = () => {
    // Validate that all present participants have assessments
    const presentParticipants = Object.entries(attendance).filter(([_, status]) => status === 'Present');
    const missingAssessments = presentParticipants.filter(
      ([id]) => !assessments[id] || !assessments[id].outcome
    );

    if (missingAssessments.length > 0) {
      alert('Please provide assessment results for all present participants');
      return;
    }

    alert('Results submitted for approval!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Attendance & Assessment Results
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Record attendance and submit assessment results for this training session
      </Typography>

      {/* Session Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Session Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Session ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {session.id}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Date & Time
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {format(session.scheduledDateTime, 'MMM dd, yyyy - hh:mm a')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {session.location}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total Participants
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {session.attendanceList.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance & Assessment Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Attendance & Assessment
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Participant Name</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell>Assessment Outcome</TableCell>
                  <TableCell>Score (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {session.attendanceList.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.employeeId || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={attendance[participant.id] === 'Present'}
                        onChange={() => handleAttendanceChange(participant.id, 'Present')}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={attendance[participant.id] === 'Absent'}
                        onChange={() => handleAttendanceChange(participant.id, 'Absent')}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={assessments[participant.id]?.outcome || ''}
                        onChange={(e) =>
                          handleAssessmentChange(participant.id, 'outcome', e.target.value)
                        }
                        disabled={attendance[participant.id] !== 'Present'}
                      >
                        <MenuItem value="">-</MenuItem>
                        <MenuItem value="Pass">Pass</MenuItem>
                        <MenuItem value="Fail">Fail</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        value={assessments[participant.id]?.score || ''}
                        onChange={(e) =>
                          handleAssessmentChange(participant.id, 'score', parseInt(e.target.value))
                        }
                        disabled={attendance[participant.id] !== 'Present'}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Additional Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Add any additional notes about the training session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Certificates will be generated for participants who passed the assessment after approval.
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" startIcon={<SendIcon />} onClick={handleSubmit}>
              Submit Results for Approval
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};



