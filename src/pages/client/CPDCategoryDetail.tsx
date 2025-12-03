import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  Link as ExerciseIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface Video {
  id: string;
  title: string;
  duration: string;
  watched: boolean;
  thumbnail?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  completed: boolean;
  score: number;
  attempts: number;
}

interface Exercise {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  items: number;
}

const categoryData: Record<string, { title: string; requiredHours: number; completedHours: number }> = {
  crane: { title: 'Mobile Crane CPD', requiredHours: 8, completedHours: 5 },
  forklift: { title: 'Forklift CPD', requiredHours: 6, completedHours: 6 },
  rigger: { title: 'Rigger Level 3 CPD', requiredHours: 10, completedHours: 3 },
};

const mockVideos: Record<string, Video[]> = {
  crane: [
    { id: 'v1', title: 'Introduction to Mobile Crane Operations', duration: '15:30', watched: true },
    { id: 'v2', title: 'Safety Protocols and Best Practices', duration: '22:45', watched: true },
    { id: 'v3', title: 'Load Calculation and Rigging', duration: '18:20', watched: false },
    { id: 'v4', title: 'Emergency Procedures', duration: '12:10', watched: false },
  ],
  forklift: [
    { id: 'v1', title: 'Forklift Safety Basics', duration: '20:00', watched: true },
    { id: 'v2', title: 'Load Handling Techniques', duration: '18:30', watched: true },
    { id: 'v3', title: 'Maintenance and Inspection', duration: '15:45', watched: false },
  ],
  rigger: [
    { id: 'v1', title: 'Rigging Fundamentals', duration: '25:00', watched: true },
    { id: 'v2', title: 'Knot Tying and Slinging', duration: '30:15', watched: false },
    { id: 'v3', title: 'Load Distribution Principles', duration: '22:30', watched: false },
  ],
};

const mockQuizzes: Record<string, Quiz[]> = {
  crane: [
    { id: 'q1', title: 'Safety Fundamentals Quiz', questions: 10, completed: true, score: 85, attempts: 1 },
    { id: 'q2', title: 'Crane Operations Assessment', questions: 15, completed: true, score: 92, attempts: 2 },
    { id: 'q3', title: 'Rigging and Load Management', questions: 12, completed: false, score: 0, attempts: 0 },
  ],
  forklift: [
    { id: 'q1', title: 'Forklift Safety Quiz', questions: 10, completed: true, score: 90, attempts: 1 },
    { id: 'q2', title: 'Load Handling Assessment', questions: 12, completed: false, score: 0, attempts: 0 },
  ],
  rigger: [
    { id: 'q1', title: 'Rigging Basics Quiz', questions: 15, completed: true, score: 88, attempts: 1 },
    { id: 'q2', title: 'Advanced Rigging Assessment', questions: 20, completed: false, score: 0, attempts: 0 },
  ],
};

const mockExercises: Record<string, Exercise[]> = {
  crane: [
    { id: 'e1', title: 'Match Safety Equipment to Use Cases', type: 'Cross-Matching', completed: true, items: 8 },
    { id: 'e2', title: 'Match Crane Types to Applications', type: 'Cross-Matching', completed: false, items: 6 },
  ],
  forklift: [
    { id: 'e1', title: 'Match Forklift Types to Applications', type: 'Cross-Matching', completed: true, items: 5 },
  ],
  rigger: [
    { id: 'e1', title: 'Match Rigging Equipment to Load Types', type: 'Cross-Matching', completed: false, items: 10 },
    { id: 'e2', title: 'Match Knot Types to Applications', type: 'Cross-Matching', completed: false, items: 8 },
  ],
};

export const CPDCategoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const category = categoryData[categoryId || 'crane'] || { title: 'CPD Category', requiredHours: 8, completedHours: 0 };
  const progress = Math.round((category.completedHours / category.requiredHours) * 100);
  const videos = mockVideos[categoryId || 'crane'] || [];
  const quizzes = mockQuizzes[categoryId || 'crane'] || [];
  const exercises = mockExercises[categoryId || 'crane'] || [];

  const handleVideoClick = (videoId: string) => {
    navigate(`/client/cpd/${categoryId}/video/${videoId}`);
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/client/cpd/${categoryId}/quiz/${quizId}`);
  };

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/client/cpd/${categoryId}/exercise/${exerciseId}`);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/client/cpd')} sx={{ mb: 2 }}>
          Back to CPD Library
        </Button>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
          {category.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete your CPD requirements through videos, quizzes, and exercises
        </Typography>
      </Box>

      {/* Progress Card */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Progress Overview
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {category.completedHours} / {category.requiredHours} hours completed
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {videos.length} Videos
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuizIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {quizzes.length} Quizzes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExerciseIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {exercises.length} Exercises
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Videos" icon={<VideoIcon />} iconPosition="start" />
            <Tab label="Quizzes" icon={<QuizIcon />} iconPosition="start" />
            <Tab label="Exercises" icon={<ExerciseIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Videos Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            {videos.length > 0 ? (
              <Grid container spacing={2}>
                {videos.map((video) => (
                  <Grid item xs={12} md={6} key={video.id}>
                    <Card
                      elevation={1}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleVideoClick(video.id)}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          bgcolor: 'grey.200',
                          height: 150,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: 'primary.main',
                          }}
                        >
                          <PlayIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Avatar>
                        {video.watched && (
                          <Chip
                            icon={<CheckIcon />}
                            label="Watched"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'success.main',
                              color: 'white',
                            }}
                          />
                        )}
                      </Box>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {video.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {video.duration}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <VideoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No videos available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Videos will be available soon
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Quizzes Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            {quizzes.length > 0 ? (
              <List>
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    elevation={1}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleQuizClick(quiz.id)}
                  >
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: quiz.completed ? 'success.main' : 'primary.main' }}>
                          <QuizIcon sx={{ color: 'white' }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={quiz.title}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {quiz.questions} questions
                            </Typography>
                            {quiz.completed && (
                              <>
                                <Typography variant="caption" color="success.main" fontWeight={600}>
                                  Score: {quiz.score}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                                </Typography>
                              </>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {quiz.completed && (
                          <Chip
                            icon={<CheckIcon />}
                            label="Completed"
                            size="small"
                            color="success"
                          />
                        )}
                        <IconButton>
                          <PlayIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </Card>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No quizzes available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quizzes will be available soon
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Exercises Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            {exercises.length > 0 ? (
              <List>
                {exercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    elevation={1}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleExerciseClick(exercise.id)}
                  >
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: exercise.completed ? 'success.main' : 'primary.main' }}>
                          <ExerciseIcon sx={{ color: 'white' }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={exercise.title}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {exercise.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {exercise.items} items
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {exercise.completed && (
                          <Chip
                            icon={<CheckIcon />}
                            label="Completed"
                            size="small"
                            color="success"
                          />
                        )}
                        <IconButton>
                          <PlayIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </Card>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ExerciseIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No exercises available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exercises will be available soon
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

