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
            <Chip
              icon={<ScheduleIcon />}
              label={`${exercise.hours} hrs`}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
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
      <Card elevation={1} sx={{ borderRadius: 2, mb: 3, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <InfoIcon sx={{ color: 'info.main', mt: 0.5, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Click on each item to match it with the correct category. Match all items to complete the exercise.
          </Typography>
        </CardContent>
      </Card>

      {/* Selection Hint */}
      {selectedItem && !isCompleted && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Item selected: <strong>{exercise.items.find((i: any) => i.id === selectedItem)?.label}</strong>. Now click on a category to match.
          </Typography>
        </Alert>
      )}

      {/* Results */}
      {isCompleted && score !== null && (
        <Alert
          severity={score >= 70 ? 'success' : 'warning'}
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/client/cpd/${categoryId}`)}
            >
              Back to Category
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Exercise Completed!
          </Typography>
          <Typography variant="body2">
            Your score: <strong>{score}%</strong> ({score >= 70 ? 'Passed' : 'Failed'})
            <br />
            You've earned {exercise.hours} CPD hours.
          </Typography>
        </Alert>
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
                      p: 2,
                      border: '2px solid',
                      borderColor:
                        isSelected
                          ? 'primary.main'
                          : matches[item.id]
                          ? isCorrect
                            ? 'success.main'
                            : isWrong
                            ? 'error.main'
                            : 'primary.light'
                          : 'divider',
                      borderRadius: 2,
                      bgcolor:
                        isSelected
                          ? 'primary.light'
                          : matches[item.id]
                          ? isCorrect
                            ? 'success.light'
                            : isWrong
                            ? 'error.light'
                            : 'grey.50'
                          : 'transparent',
                      cursor: isCompleted ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: isCompleted ? undefined : 'primary.main',
                        bgcolor: isCompleted ? undefined : isSelected ? 'primary.light' : 'grey.50',
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
                              ? 'success.dark'
                              : isWrong
                              ? 'error.dark'
                              : matches[item.id]
                              ? 'primary.main'
                              : 'text.primary',
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
                              ? 'success.main'
                              : isWrong
                              ? 'error.main'
                              : 'primary.main',
                            color: 'white',
                            fontWeight: 600,
                            mr: 1,
                          }}
                        />
                      )}
                      {isCorrect && <CheckIcon sx={{ color: 'success.main' }} />}
                      {isWrong && <CancelIcon sx={{ color: 'error.main' }} />}
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
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {exercise.categories.map((category: any) => {
                  const isUsed = isCategoryUsed(category.id);
                  const canClick = selectedItem !== null && !isCompleted;

                  return (
                    <Card
                      key={category.id}
                      elevation={0}
                      onClick={() => handleCategoryClick(category.id)}
                      sx={{
                        p: 2,
                        border: '2px solid',
                        borderColor: isUsed ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        bgcolor: isUsed ? 'primary.main' : 'transparent',
                        minWidth: { xs: '100%', sm: 150 },
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
                        cursor: canClick ? 'pointer' : isUsed ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: canClick ? 'primary.main' : undefined,
                          bgcolor: canClick ? 'primary.light' : undefined,
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={isUsed ? 600 : 400}
                        sx={{
                          color: isUsed ? 'white' : 'text.primary',
                          textAlign: 'center',
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
            startIcon={<CheckIcon />}
            sx={{
              background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #218838 0%, #1e7e34 100%)',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Submit Exercise
          </Button>
        </Box>
      )}
    </Box>
  );
};
