import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
  LinkOutlined as LinkOutlinedIcon,
  InfoOutlined as InfoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const mockExercises: Record<string, Record<string, { title: string; items: any[]; categories: any[]; hours: number }>> = {
  crane: {
    e1: {
      title: 'Match Safety Equipment to Use Cases',
      hours: 0.33,
      items: [
        { id: 'item1', label: 'Hard Hat', category: 'Head Protection' },
        { id: 'item2', label: 'Safety Glasses', category: 'Eye Protection' },
        { id: 'item3', label: 'Steel Toe Boots', category: 'Foot Protection' },
        { id: 'item4', label: 'Safety Harness', category: 'Fall Protection' },
      ],
      categories: [
        { id: 'cat1', label: 'Head Protection' },
        { id: 'cat2', label: 'Eye Protection' },
        { id: 'cat3', label: 'Foot Protection' },
        { id: 'cat4', label: 'Fall Protection' },
      ],
    },
    e2: {
      title: 'Match Crane Types to Applications',
      hours: 0.25,
      items: [
        { id: 'item1', label: 'Mobile Crane', category: 'Construction Sites' },
        { id: 'item2', label: 'Tower Crane', category: 'High-Rise Buildings' },
        { id: 'item3', label: 'Overhead Crane', category: 'Warehouses' },
      ],
      categories: [
        { id: 'cat1', label: 'Construction Sites' },
        { id: 'cat2', label: 'High-Rise Buildings' },
        { id: 'cat3', label: 'Warehouses' },
      ],
    },
  },
  forklift: {
    e1: {
      title: 'Match Forklift Types to Applications',
      hours: 0.25,
      items: [
        { id: 'item1', label: 'Counterbalance Forklift', category: 'Warehouse Operations' },
        { id: 'item2', label: 'Reach Truck', category: 'Narrow Aisles' },
      ],
      categories: [
        { id: 'cat1', label: 'Warehouse Operations' },
        { id: 'cat2', label: 'Narrow Aisles' },
      ],
    },
  },
  rigger: {
    e1: {
      title: 'Match Rigging Equipment to Load Types',
      hours: 0.33,
      items: [
        { id: 'item1', label: 'Wire Rope Sling', category: 'Heavy Loads' },
        { id: 'item2', label: 'Chain Sling', category: 'High Temperature' },
      ],
      categories: [
        { id: 'cat1', label: 'Heavy Loads' },
        { id: 'cat2', label: 'High Temperature' },
      ],
    },
  },
};

export const CPDExercise: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId, exerciseId } = useParams<{ categoryId: string; exerciseId: string }>();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const exercise = mockExercises[categoryId || 'crane']?.[exerciseId || 'e1'] || {
    title: 'Exercise',
    items: [],
    categories: [],
    hours: 0,
  };

  const totalMatches = exercise.items.length;
  const matchedCount = Object.keys(matches).length;

  // Format hours display
  const formatHours = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const handleItemClick = (itemId: string) => {
    if (isCompleted) return;
    // If already matched, remove match
    if (matches[itemId]) {
      const newMatches = { ...matches };
      delete newMatches[itemId];
      setMatches(newMatches);
      setSelectedItem(null);
    } else {
      // Select item for matching
      setSelectedItem(itemId);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedItem || isCompleted) return;
    // Check if category is already used
    const isUsed = Object.values(matches).includes(categoryId);
    if (isUsed) {
      // Find and remove the match
      const itemId = Object.keys(matches).find((id) => matches[id] === categoryId);
      if (itemId) {
        const newMatches = { ...matches };
        delete newMatches[itemId];
        setMatches(newMatches);
      }
    }
    // Create new match
    setMatches({ ...matches, [selectedItem]: categoryId });
    setSelectedItem(null);
  };

  const handleSubmit = () => {
    if (matchedCount < totalMatches) {
      alert('Please match all items before submitting.');
      return;
    }

    // Check correctness
    let correct = 0;
    exercise.items.forEach((item: any) => {
      const correctCategory = exercise.categories.find((c: any) => c.label === item.category);
      if (matches[item.id] === correctCategory?.id) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / totalMatches) * 100);
    setScore(calculatedScore);
    setIsCompleted(true);
    localStorage.setItem(`cpd-exercise-${categoryId}-${exerciseId}`, JSON.stringify({ score: calculatedScore, matches }));
  };

  const getMatchedCategory = (itemId: string) => {
    const categoryId = matches[itemId];
    return exercise.categories.find((c: any) => c.id === categoryId);
  };

  const isCorrectMatch = (itemId: string) => {
    if (!isCompleted) return false;
    const item = exercise.items.find((i: any) => i.id === itemId);
    const matchedCat = getMatchedCategory(itemId);
    return matchedCat?.label === item?.category;
  };

  const isWrongMatch = (itemId: string) => {
    if (!isCompleted) return false;
    const matchedCat = getMatchedCategory(itemId);
    return matchedCat !== undefined && !isCorrectMatch(itemId);
  };

  const isCategoryUsed = (categoryId: string) => {
    return Object.values(matches).includes(categoryId);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/client/cpd/${categoryId}`)} sx={{ mb: 2 }}>
          Back to Category
        </Button>
      </Box>

      {/* Progress Header */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Matched: {matchedCount} / {totalMatches}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(matchedCount / totalMatches) * 100}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                  },
                }}
              />
            </Box>
            {!isCompleted ? (
              <Chip
                icon={<ScheduleIcon />}
                label={`Est. ${formatHours(exercise.hours)}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              />
            ) : (
              <Chip
                icon={<CheckIcon />}
                label={`Earned: ${formatHours(exercise.hours)}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              />
            )}
          </Box>
        </Box>
      </Card>

      {/* Title Card */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <LinkIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {exercise.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cross-Matching • {totalMatches} items to match
          </Typography>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card elevation={2} sx={{ borderRadius: 2, mb: 3, bgcolor: 'white', border: '2px solid', borderColor: '#1e3c72' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <InfoIcon sx={{ color: '#1e3c72', mt: 0.5, fontSize: 24, flexShrink: 0 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.7, fontWeight: 500, color: '#2c3e50' }}>
            Click on each item to match it with the correct category. Match all items to complete the exercise.
          </Typography>
        </CardContent>
      </Card>

      {/* Selection Hint */}
      {selectedItem && !isCompleted && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            bgcolor: '#e3f2fd',
            border: '2px solid #1e3c72',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: '#1e3c72',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e3c72', mb: 0.5 }}>
            Item Selected: {exercise.items.find((i: any) => i.id === selectedItem)?.label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#2c3e50' }}>
            Click on a category below to match it with the selected item.
          </Typography>
        </Alert>
      )}

      {/* Results */}
      {isCompleted && score !== null && (
        <Card
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            background: score >= 70
              ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
              : 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                    Exercise Completed!
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                  Your Score: <strong style={{ fontSize: '1.2em' }}>{score}%</strong>
                </Typography>
                <Chip
                  label={score >= 70 ? 'Passed' : 'Failed'}
                  sx={{
                    bgcolor: score >= 70 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 700,
                    mb: 1.5,
                    fontSize: '0.875rem',
                    height: 28,
                  }}
                />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.6 }}>
                  You've earned <strong>{formatHours(exercise.hours)}</strong> of CPD credit.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="medium"
                onClick={() => navigate(`/client/cpd/${categoryId}`)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.5)',
                  },
                  px: 3,
                }}
              >
                Back to Category
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Items Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Items
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {exercise.items.map((item: any) => {
                const matchedCat = getMatchedCategory(item.id);
                const isCorrect = isCorrectMatch(item.id);
                const isWrong = isWrongMatch(item.id);
                const isSelected = selectedItem === item.id;

                return (
                  <Card
                    key={item.id}
                    elevation={0}
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      mb: 2,
                      p: 2.5,
                      border: '2px solid',
                      borderColor:
                        isSelected
                          ? '#1e3c72'
                          : matches[item.id]
                          ? isCorrect
                            ? '#1e3c72'
                            : isWrong
                            ? '#c62828'
                            : '#3498db'
                          : '#e0e0e0',
                      borderRadius: 3,
                      bgcolor:
                        isSelected
                          ? '#e3f2fd'
                          : matches[item.id]
                          ? isCorrect
                            ? '#e3f2fd'
                            : isWrong
                            ? '#ffebee'
                            : '#f0f7ff'
                          : 'white',
                      cursor: isCompleted ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(30, 60, 114, 0.15)' : 'none',
                      '&:hover': {
                        borderColor: isCompleted ? undefined : '#1e3c72',
                        bgcolor: isCompleted 
                          ? undefined 
                          : isSelected 
                          ? '#d6e9f7' 
                          : '#f5f5f5',
                        transform: isCompleted ? undefined : 'translateY(-2px)',
                        boxShadow: isCompleted ? undefined : '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                        {matchedCat ? (
                          <LinkIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        ) : (
                          <LinkOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        )}
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{
                            color: isCorrect
                              ? '#1e3c72'
                              : isWrong
                              ? '#c62828'
                              : matches[item.id]
                              ? '#1e3c72'
                              : '#2c3e50',
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                      {matchedCat && (
                        <Chip
                          label={matchedCat.label}
                          size="small"
                          sx={{
                            bgcolor: isCorrect
                              ? '#1e3c72'
                              : isWrong
                              ? '#c62828'
                              : '#1e3c72',
                            color: 'white',
                            fontWeight: 700,
                            mr: 1,
                            fontSize: '0.75rem',
                            height: 26,
                          }}
                        />
                      )}
                      {isCorrect && (
                        <CheckIcon 
                          sx={{ 
                            color: '#1e3c72', 
                            fontSize: 28,
                            bgcolor: 'rgba(30, 60, 114, 0.1)',
                            borderRadius: '50%',
                            p: 0.5,
                          }} 
                        />
                      )}
                      {isWrong && (
                        <CancelIcon 
                          sx={{ 
                            color: '#c62828', 
                            fontSize: 28,
                            bgcolor: 'rgba(198, 40, 40, 0.1)',
                            borderRadius: '50%',
                            p: 0.5,
                          }} 
                        />
                      )}
                    </Box>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Categories Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Categories
              </Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {exercise.categories.map((category: any) => {
                  const isUsed = isCategoryUsed(category.id);
                  const canClick = selectedItem !== null && !isCompleted;
                  const isHoverable = canClick || isUsed;

                  return (
                    <Card
                      key={category.id}
                      elevation={0}
                      onClick={() => {
                        if (canClick || isUsed) {
                          handleCategoryClick(category.id);
                        }
                      }}
                      sx={{
                        p: 2.5,
                        border: '2px solid',
                        borderColor: isUsed 
                          ? '#1e3c72' 
                          : canClick 
                          ? '#3498db' 
                          : '#e0e0e0',
                        borderRadius: 3,
                        bgcolor: isUsed 
                          ? '#1e3c72' 
                          : canClick 
                          ? '#f0f7ff' 
                          : 'white',
                        minWidth: { xs: '100%', sm: 160 },
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)' },
                        cursor: isHoverable ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        transform: isHoverable ? 'scale(1)' : 'scale(0.98)',
                        opacity: isHoverable ? 1 : 0.6,
                        '&:hover': {
                          borderColor: isHoverable ? '#1e3c72' : undefined,
                          bgcolor: isHoverable 
                            ? (isUsed ? '#2a5298' : '#e3f2fd') 
                            : undefined,
                          transform: isHoverable ? 'scale(1.02)' : undefined,
                          boxShadow: isHoverable 
                            ? '0 4px 12px rgba(30, 60, 114, 0.2)' 
                            : undefined,
                        },
                        '&:active': {
                          transform: isHoverable ? 'scale(0.98)' : undefined,
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={isUsed ? 700 : canClick ? 600 : 500}
                        sx={{
                          color: isUsed ? 'white' : canClick ? '#1e3c72' : '#757575',
                          textAlign: 'center',
                          fontSize: '0.9375rem',
                        }}
                      >
                        {category.label}
                      </Typography>
                    </Card>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submit Button */}
      {!isCompleted && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={matchedCount < totalMatches}
            startIcon={<CheckIcon sx={{ color: 'white !important' }} />}
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white !important',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                boxShadow: '0 6px 20px rgba(30, 60, 114, 0.4)',
              },
              '&:disabled': {
                background: '#bdbdbd',
                color: '#757575 !important',
                '& .MuiSvgIcon-root': {
                  color: '#757575 !important',
                },
              },
              px: 5,
              py: 1.75,
              boxShadow: '0 4px 16px rgba(30, 60, 114, 0.35)',
              minWidth: 200,
            }}
          >
            Submit Exercise
          </Button>
        </Box>
      )}
    </Box>
  );
};
