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

  // Format hours display
  const formatHours = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
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
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('cpdVideoCompleted', { 
      detail: { categoryId, videoId } 
    }));
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
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: '#1e3c72',
                color: 'white',
                px: 2,
                py: 0.75,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 10,
              }}
            >
              <CheckIcon sx={{ fontSize: 16 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Completed
              </Typography>
            </Box>
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
      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'white',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Info Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Chip
              label={videoData.category}
              sx={{
                bgcolor: '#1e3c72',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8125rem',
                height: 32,
                px: 1,
              }}
            />
            <Chip
              icon={<ScheduleIcon sx={{ color: '#1e3c72 !important' }} />}
              label={formatHours(videoData.hours)}
              sx={{
                bgcolor: '#f0f7ff',
                color: '#1e3c72',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 32,
                border: '1px solid #e3f2fd',
              }}
            />
          </Box>

          <Typography 
            variant="h4" 
            fontWeight={700} 
            gutterBottom
            sx={{ 
              mb: 2,
              color: '#2c3e50',
              lineHeight: 1.3,
            }}
          >
            {videoData.title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ 
              fontSize: '1rem',
              lineHeight: 1.7,
              mb: 3,
              color: '#5a6c7d',
            }}
          >
            {videoData.description}
          </Typography>

          {/* Video Meta */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 4, 
              pt: 3, 
              borderTop: '2px solid', 
              borderColor: 'divider',
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: '#f0f7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VideoIcon sx={{ fontSize: 18, color: '#1e3c72' }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                Training Video
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: '#f0f7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ScheduleIcon sx={{ fontSize: 18, color: '#1e3c72' }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                {videoData.duration}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Completion Section */}
      {watched ? (
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                  Video Completed!
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.6 }}>
                  You've earned <strong>{formatHours(videoData.hours)}</strong> of CPD credit.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            border: '2px solid',
            borderColor: '#1e3c72',
            mb: 3,
            bgcolor: '#f0f7ff',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#1e3c72',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1e3c72', mb: 1 }}>
                  Mark as Complete
                </Typography>
                <Typography variant="body1" sx={{ color: '#5a6c7d', lineHeight: 1.6 }}>
                  Mark this video as watched to earn {formatHours(videoData.hours)} of CPD credit.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleMarkComplete}
              fullWidth
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                  boxShadow: '0 6px 20px rgba(30, 60, 114, 0.4)',
                  transform: 'translateY(-2px)',
                },
                py: 1.75,
                borderRadius: 2,
                transition: 'all 0.2s ease',
              }}
            >
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      )}

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
