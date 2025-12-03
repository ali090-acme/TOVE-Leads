import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
  VolumeUp as VolumeIcon,
  CheckCircle as CheckIcon,
  VideocamOutlined as VideoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const mockVideos: Record<string, Record<string, { title: string; duration: string; description: string; category: string; hours: number }>> = {
  crane: {
    v1: {
      title: 'Introduction to Mobile Crane Operations',
      duration: '15:30',
      description: 'Learn the fundamentals of mobile crane operations, including safety protocols, equipment overview, and basic operational procedures.',
      category: 'Mobile Crane CPD',
      hours: 0.25,
    },
    v2: {
      title: 'Safety Protocols and Best Practices',
      duration: '22:45',
      description: 'Comprehensive guide to safety protocols, risk assessment, and best practices for mobile crane operations.',
      category: 'Mobile Crane CPD',
      hours: 0.38,
    },
    v3: {
      title: 'Load Calculation and Rigging',
      duration: '18:20',
      description: 'Master the art of load calculation, rigging techniques, and weight distribution principles.',
      category: 'Mobile Crane CPD',
      hours: 0.31,
    },
    v4: {
      title: 'Emergency Procedures',
      duration: '12:10',
      description: 'Essential emergency procedures and response protocols for mobile crane operations.',
      category: 'Mobile Crane CPD',
      hours: 0.20,
    },
  },
  forklift: {
    v1: {
      title: 'Forklift Safety Basics',
      duration: '20:00',
      description: 'Introduction to forklift safety, including pre-operation checks and basic safety guidelines.',
      category: 'Forklift CPD',
      hours: 0.33,
    },
    v2: {
      title: 'Load Handling Techniques',
      duration: '18:30',
      description: 'Learn proper load handling techniques, stacking methods, and weight distribution.',
      category: 'Forklift CPD',
      hours: 0.31,
    },
    v3: {
      title: 'Maintenance and Inspection',
      duration: '15:45',
      description: 'Comprehensive guide to forklift maintenance, daily inspections, and troubleshooting.',
      category: 'Forklift CPD',
      hours: 0.26,
    },
  },
  rigger: {
    v1: {
      title: 'Rigging Fundamentals',
      duration: '25:00',
      description: 'Introduction to rigging fundamentals, including equipment types, load calculations, and safety considerations.',
      category: 'Rigger Level 3 CPD',
      hours: 0.42,
    },
    v2: {
      title: 'Knot Tying and Slinging',
      duration: '30:15',
      description: 'Master essential knot tying techniques and proper slinging methods for various load types.',
      category: 'Rigger Level 3 CPD',
      hours: 0.50,
    },
    v3: {
      title: 'Load Distribution Principles',
      duration: '22:30',
      description: 'Learn load distribution principles, center of gravity, and weight distribution techniques.',
      category: 'Rigger Level 3 CPD',
      hours: 0.38,
    },
  },
};

export const CPDVideoPlayer: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId, videoId } = useParams<{ categoryId: string; videoId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);

  const videoData = mockVideos[categoryId || 'crane']?.[videoId || 'v1'] || {
    title: 'Video Title',
    duration: '00:00',
    description: 'Video description',
    category: 'CPD Category',
    hours: 0,
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Simulate video progress
    if (!isPlaying && progress < 100) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    }
  };

  const handleMarkComplete = () => {
    setWatched(true);
    setProgress(100);
    localStorage.setItem(`cpd-video-${categoryId}-${videoId}`, 'completed');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/client/cpd/${categoryId}`)} sx={{ mb: 2 }}>
          Back to Category
        </Button>
      </Box>

      {/* Video Player Area */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        {/* Video Placeholder */}
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'grey.900',
            height: { xs: 400, md: 500 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <IconButton
              onClick={handlePlayPause}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: 80,
                height: 80,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
              }}
            >
              {isPlaying ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayIcon sx={{ fontSize: 40 }} />}
            </IconButton>
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
              Video Player
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              YouTube / External Video Integration
            </Typography>
          </Box>
          {watched && (
            <Chip
              icon={<CheckIcon />}
              label="Completed"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'success.main',
                color: 'white',
              }}
            />
          )}
        </Box>

        {/* Video Progress Bar */}
        <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flexGrow: 1,
                height: 4,
                borderRadius: 1,
                bgcolor: 'grey.300',
              }}
            />
            <Typography variant="caption" sx={{ minWidth: 50, textAlign: 'right' }}>
              {progress.toFixed(0)}%
            </Typography>
          </Box>

          {/* Video Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small">
              <SkipPreviousIcon />
            </IconButton>
            <IconButton size="small" onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton size="small">
              <SkipNextIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              0:00 / {videoData.duration}
            </Typography>
            <IconButton size="small">
              <VolumeIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {/* Video Information Card */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Info Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip
              label={videoData.category}
              size="small"
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<ScheduleIcon />}
              label={`${videoData.hours} hrs`}
              size="small"
              sx={{
                bgcolor: 'grey.100',
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          </Box>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            {videoData.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {videoData.description}
          </Typography>

          {/* Video Meta */}
          <Box sx={{ display: 'flex', gap: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Training Video
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {videoData.duration}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Completion Section */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <CheckIcon
              sx={{
                fontSize: 24,
                color: watched ? 'success.main' : 'text.secondary',
                mt: 0.5,
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {watched ? 'Video Completed' : 'Mark as Complete'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {watched
                  ? `You've earned ${videoData.hours} CPD hours`
                  : 'Mark this video as watched to earn CPD hours'}
              </Typography>
            </Box>
          </Box>

          {!watched && (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleMarkComplete}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #218838 0%, #1e7e34 100%)',
                },
                py: 1.5,
              }}
            >
              Mark as Complete
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Related Videos Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Related Videos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Continue learning with related training content
        </Typography>
      </Box>
    </Box>
  );
};
