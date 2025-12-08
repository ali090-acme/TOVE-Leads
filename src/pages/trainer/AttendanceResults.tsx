import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Snackbar,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Send as SendIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { TrainingSession, Participant, AssessmentResult } from '@/types';
import { format } from 'date-fns';

export const AttendanceResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { trainingSessions, currentUser, updateTrainingSession } = useAppContext();
  
  const session = trainingSessions.find((s) => s.id === sessionId);

  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Pending'>>({});
  const [assessments, setAssessments] = useState<Record<string, { outcome: 'Pass' | 'Fail' | 'Pending'; score?: number }>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', employeeId: '' });
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Initialize state from session data
  useEffect(() => {
    if (session) {
      // Always use session.attendanceList (it should be updated from localStorage)
      setParticipants(session.attendanceList || []);
      
      const initialAttendance = (session.attendanceList || []).reduce(
        (acc: Record<string, 'Present' | 'Absent' | 'Pending'>, p: any) => ({ ...acc, [p.id]: p.attendance }),
        {} as Record<string, 'Present' | 'Absent' | 'Pending'>
      );
      setAttendance(initialAttendance);

      const initialAssessments = session.assessmentResults.reduce(
        (acc, a) => ({ ...acc, [a.participantId]: { outcome: a.outcome, score: a.score } }),
        {} as Record<string, { outcome: 'Pass' | 'Fail' | 'Pending'; score?: number }>
      );
      setAssessments(initialAssessments);
    }
  }, [session]);

  if (!session) {
    return (
      <Box>
        <Alert severity="error">Training session not found</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/trainer/results')}>
          Back to Results List
        </Button>
      </Box>
    );
  }

  const handleAttendanceChange = (participantId: string, status: 'Present' | 'Absent') => {
    const newAttendance = { ...attendance, [participantId]: status };
    setAttendance(newAttendance);

    // If marked as Absent, clear assessment
    if (status === 'Absent') {
      const newAssessments = { ...assessments };
      delete newAssessments[participantId];
      setAssessments(newAssessments);
    }

    // Clear errors for this participant
    if (errors[participantId]) {
      const newErrors = { ...errors };
      delete newErrors[participantId];
      setErrors(newErrors);
    }
  };

  const handleAssessmentChange = (participantId: string, field: 'outcome' | 'score', value: any) => {
    setAssessments({
      ...assessments,
      [participantId]: { 
        ...assessments[participantId], 
        [field]: field === 'score' ? (value ? parseInt(value) : undefined) : value 
      },
    });

    // Clear errors for this participant
    if (errors[participantId]) {
      const newErrors = { ...errors };
      delete newErrors[participantId];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const presentParticipants = Object.entries(attendance).filter(([_, status]) => status === 'Present');

    // Check if at least one participant is marked
    if (presentParticipants.length === 0 && Object.values(attendance).filter(v => v === 'Absent').length === 0) {
      setSnackbar({
        open: true,
        message: 'Please mark attendance for at least one participant',
        severity: 'error',
      });
      return false;
    }

    // Validate assessments for present participants
    presentParticipants.forEach(([id]) => {
      const assessment = assessments[id];
      if (!assessment || !assessment.outcome || assessment.outcome === 'Pending') {
        const participant = participants.find((p) => p.id === id);
        newErrors[id] = `${participant?.name || 'Participant'}: Assessment outcome required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Save to localStorage
      const draftData = {
        sessionId: session.id,
        attendance,
        assessments,
        notes,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`training-draft-${session.id}`, JSON.stringify(draftData));

      setSnackbar({
        open: true,
        message: 'Draft saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save draft. Please try again.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors before submitting',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update training session (mock - in real app, this would be API call)
      const updatedAssessmentResults: AssessmentResult[] = Object.entries(assessments).map(([participantId, assessment]) => {
        const participant = participants.find((p) => p.id === participantId);
        return {
          participantId,
          participantName: participant?.name || 'Unknown',
          outcome: assessment.outcome,
          score: assessment.score,
        };
      });

      // Update training session using AppContext
      if (updateTrainingSession) {
        updateTrainingSession(session.id, {
          assessmentResults: updatedAssessmentResults,
          attendanceList: participants.map((p) => ({
            ...p,
            attendance: attendance[p.id] || p.attendance,
          })),
          status: 'Completed',
          approvalStatus: 'Pending',
        });
      } else {
        // Fallback: Update localStorage directly
        const existingSessions = JSON.parse(localStorage.getItem('trainingSessions') || '[]');
        const updatedSessions = existingSessions.map((s: any) => {
          if (s.id === session.id) {
            return {
              ...s,
              assessmentResults: updatedAssessmentResults,
              attendanceList: participants.map((p) => ({
                ...p,
                attendance: attendance[p.id] || p.attendance,
              })),
              status: 'Completed',
              approvalStatus: 'Pending',
            };
          }
          return s;
        });
        localStorage.setItem('trainingSessions', JSON.stringify(updatedSessions));
      }

      // Clear draft
      localStorage.removeItem(`training-draft-${session.id}`);

      setSnackbar({
        open: true,
        message: 'Results submitted for approval successfully!',
        severity: 'success',
      });

      // Redirect to results list after 1.5 seconds
      setTimeout(() => {
        navigate('/trainer/results');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit results. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`training-draft-${sessionId}`);
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        if (draftData.attendance) setAttendance(draftData.attendance);
        if (draftData.assessments) setAssessments(draftData.assessments);
        if (draftData.notes) setNotes(draftData.notes);
        setSnackbar({
          open: true,
          message: 'Draft loaded successfully',
          severity: 'success',
        });
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [sessionId]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Attendance & Assessment Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Record attendance and submit assessment results for this training session
        </Typography>
      </Box>

      {/* Session Details */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
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
                {participants.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance & Assessment Table */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Attendance & Assessment
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAddParticipant(true)}
            >
              Add Participant
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {participants.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No participants added yet. Click "Add Participant" to add participants to this training session.
            </Alert>
          ) : (
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
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.employeeId || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={attendance[participant.id] === 'Present'}
                        onChange={() => handleAttendanceChange(participant.id, 'Present')}
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={attendance[participant.id] === 'Absent'}
                        onChange={() => handleAttendanceChange(participant.id, 'Absent')}
                        color="error"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl 
                        fullWidth 
                        size="small"
                        error={!!errors[participant.id]}
                        disabled={attendance[participant.id] !== 'Present'}
                      >
                        <Select
                          value={assessments[participant.id]?.outcome || ''}
                          onChange={(e) =>
                            handleAssessmentChange(participant.id, 'outcome', e.target.value)
                          }
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Select outcome</em>
                          </MenuItem>
                          <MenuItem value="Pass">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckIcon color="success" fontSize="small" />
                              Pass
                            </Box>
                          </MenuItem>
                          <MenuItem value="Fail">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CancelIcon color="error" fontSize="small" />
                              Fail
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {errors[participant.id] && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          {errors[participant.id]}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        value={assessments[participant.id]?.score || ''}
                        onChange={(e) =>
                          handleAssessmentChange(participant.id, 'score', e.target.value)
                        }
                        disabled={attendance[participant.id] !== 'Present' || assessments[participant.id]?.outcome !== 'Pass'}
                        placeholder="Score %"
                        sx={{ width: 100 }}
                        helperText={assessments[participant.id]?.outcome === 'Pass' ? 'Optional' : 'Only for Pass'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          const updatedParticipants = participants.filter((p) => p.id !== participant.id);
                          setParticipants(updatedParticipants);
                          const newAttendance = { ...attendance };
                          delete newAttendance[participant.id];
                          setAttendance(newAttendance);
                          const newAssessments = { ...assessments };
                          delete newAssessments[participant.id];
                          setAssessments(newAssessments);
                          
                          // Save updated participants to training session immediately
                          if (session && updateTrainingSession) {
                            updateTrainingSession(session.id, {
                              attendanceList: updatedParticipants.map((p) => ({
                                ...p,
                                attendance: newAttendance[p.id] || p.attendance,
                              })),
                            });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
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

      {/* Summary Stats */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(attendance).filter((a) => a === 'Present').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Present
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(attendance).filter((a) => a === 'Absent').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Absent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(assessments).filter((a) => a.outcome === 'Pass').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Passed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(assessments).filter((a) => a.outcome === 'Fail').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Certificates will be generated for participants who passed the assessment after approval.
            {Object.values(attendance).filter((a) => a === 'Present').length > 0 && 
             Object.values(assessments).filter((a) => a.outcome && a.outcome !== 'Pending').length < 
             Object.values(attendance).filter((a) => a === 'Present').length && (
              <strong> Please complete all assessments for present participants.</strong>
            )}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveDraft}
              disabled={loading || saving}
              sx={{ px: 3 }}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/trainer/results')}
                disabled={loading || saving}
                sx={{ px: 3 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={loading || saving}
                sx={{
                  px: 4,
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                  },
                }}
              >
                {loading ? 'Submitting...' : 'Submit Results for Approval'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add Participant Dialog */}
      <Dialog open={showAddParticipant} onClose={() => setShowAddParticipant(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Participant Name *"
            value={newParticipant.name}
            onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            fullWidth
            label="Employee ID"
            value={newParticipant.employeeId}
            onChange={(e) => setNewParticipant({ ...newParticipant, employeeId: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Optional"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddParticipant(false);
            setNewParticipant({ name: '', employeeId: '' });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (newParticipant.name.trim()) {
                const newPart: Participant = {
                  id: `p-${Date.now()}`,
                  name: newParticipant.name.trim(),
                  employeeId: newParticipant.employeeId.trim() || undefined,
                  attendance: 'Pending',
                };
                const updatedParticipants = [...participants, newPart];
                setParticipants(updatedParticipants);
                setAttendance({ ...attendance, [newPart.id]: 'Pending' });
                
                // Save participants to training session immediately
                if (session && updateTrainingSession) {
                  updateTrainingSession(session.id, {
                    attendanceList: updatedParticipants.map((p) => ({
                      ...p,
                      attendance: attendance[p.id] || p.attendance,
                    })),
                  });
                }
                
                setNewParticipant({ name: '', employeeId: '' });
                setShowAddParticipant(false);
              }
            }}
            disabled={!newParticipant.name.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};



