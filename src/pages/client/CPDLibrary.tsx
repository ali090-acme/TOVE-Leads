import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  Link as ExerciseIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

interface CPDCategory {
  id: string;
  title: string;
  requiredHours: number;
  completedHours: number;
  videos: number;
  quizzes: number;
  exercises: number;
}

const mockCategories: CPDCategory[] = [
  {
    id: 'crane',
    title: 'Mobile Crane CPD',
    requiredHours: 8,
    completedHours: 5,
    videos: 12,
    quizzes: 4,
    exercises: 2,
  },
  {
    id: 'forklift',
    title: 'Forklift CPD',
    requiredHours: 6,
    completedHours: 6,
    videos: 8,
    quizzes: 3,
    exercises: 1,
  },
  {
    id: 'rigger',
    title: 'Rigger Level 3 CPD',
    requiredHours: 10,
    completedHours: 3,
    videos: 15,
    quizzes: 5,
    exercises: 3,
  },
];

export const CPDLibrary: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/client/cpd/${categoryId}`);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
          CPD Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete your Continuing Professional Development requirements through videos, quizzes, and exercises
        </Typography>
      </Box>

      {/* CPD Categories */}
      <Grid container spacing={3}>
        {mockCategories.map((category) => {
          const progress = Math.round((category.completedHours / category.requiredHours) * 100);
          const isComplete = progress === 100;

          return (
            <Grid item xs={12} md={6} lg={4} key={category.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: isComplete ? '2px solid' : '1px solid',
                  borderColor: isComplete ? 'success.main' : 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Card Header */}
                <Box
                  sx={{
                    background: isComplete
                      ? 'linear-gradient(135deg, #28a745 0%, #218838 100%)'
                      : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    color: 'white',
                    p: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {category.title}
                    </Typography>
                    {isComplete && (
                      <Chip
                        icon={<CheckIcon />}
                        label="Complete"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  {/* Progress Section */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {category.completedHours} / {category.requiredHours} hours
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: isComplete ? 'success.main' : 'primary.main' }}
                      >
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
                          bgcolor: isComplete ? 'success.main' : 'primary.main',
                        },
                      }}
                    />
                  </Box>

                  {/* Content Breakdown */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 3,
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {category.videos} Videos
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QuizIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {category.quizzes} Quizzes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ExerciseIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {category.exercises} Exercises
                      </Typography>
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {isComplete
                        ? 'Ready for renewal'
                        : `${category.requiredHours - category.completedHours} hours remaining`}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<PlayIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category.id);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                        },
                      }}
                    >
                      Start
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary Stats */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mt: 4 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Overall Progress
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {mockCategories.reduce((sum, cat) => sum + cat.completedHours, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Hours
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {mockCategories.reduce((sum, cat) => sum + cat.requiredHours, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Required Hours
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {mockCategories.filter((cat) => {
                    const progress = Math.round((cat.completedHours / cat.requiredHours) * 100);
                    return progress === 100;
                  }).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Categories
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

