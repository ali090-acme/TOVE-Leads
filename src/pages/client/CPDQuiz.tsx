import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Chip,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Description as QuizIcon,
} from '@mui/icons-material';

const mockQuizzes: Record<string, Record<string, { title: string; questions: any[]; hours: number }>> = {
  crane: {
    q1: {
      title: 'Safety Fundamentals Quiz',
      hours: 0.5,
      questions: [
        {
          id: 1,
          question: 'What is the maximum wind speed for safe crane operation?',
          options: ['15 mph', '20 mph', '25 mph', '30 mph'],
          correct: 1,
        },
        {
          id: 2,
          question: 'What should you check before operating a crane?',
          options: ['Weather only', 'Load capacity only', 'All safety checks', 'None of the above'],
          correct: 2,
        },
        {
          id: 3,
          question: 'What is the minimum safe distance from power lines?',
          options: ['5 feet', '10 feet', '15 feet', '20 feet'],
          correct: 2,
        },
      ],
    },
    q2: {
      title: 'Crane Operations Assessment',
      hours: 0.33,
      questions: [
        {
          id: 1,
          question: 'What is load moment?',
          options: ['Weight × Distance', 'Weight only', 'Distance only', 'Speed × Weight'],
          correct: 0,
        },
        {
          id: 2,
          question: 'When should you use taglines?',
          options: ['Never', 'Only for heavy loads', 'For all loads', 'Only in wind'],
          correct: 2,
        },
      ],
    },
    q3: {
      title: 'Rigging and Load Management',
      hours: 0.25,
      questions: [
        {
          id: 1,
          question: 'What is the safe working load (SWL)?',
          options: ['Maximum load', 'Minimum load', 'Average load', 'Test load'],
          correct: 0,
        },
      ],
    },
  },
  forklift: {
    q1: {
      title: 'Forklift Safety Quiz',
      hours: 0.5,
      questions: [
        {
          id: 1,
          question: 'What is the maximum load capacity you should lift?',
          options: ['Rated capacity', '110% of rated capacity', '90% of rated capacity', 'Any weight'],
          correct: 0,
        },
        {
          id: 2,
          question: 'When should you inspect a forklift?',
          options: ['Daily', 'Weekly', 'Monthly', 'Only when broken'],
          correct: 0,
        },
      ],
    },
  },
  rigger: {
    q1: {
      title: 'Rigging Basics Quiz',
      hours: 0.5,
      questions: [
        {
          id: 1,
          question: 'What is the minimum number of slings for a load?',
          options: ['1', '2', '3', 'Depends on load'],
          correct: 1,
        },
      ],
    },
  },
};

export const CPDQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId, quizId } = useParams<{ categoryId: string; quizId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const quiz = mockQuizzes[categoryId || 'crane']?.[quizId || 'q1'] || {
    title: 'Quiz',
    questions: [],
    hours: 0,
  };

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQ = quiz.questions[currentQuestion];

  const handleAnswerSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (answeredCount < totalQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / totalQuestions) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
    localStorage.setItem(`cpd-quiz-${categoryId}-${quizId}`, JSON.stringify({ score: calculatedScore, answers }));
  };

  const isCorrect = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) return false;
    return quiz.questions[questionIndex].correct === optionIndex;
  };

  const isWrong = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) return false;
    return answers[questionIndex] === optionIndex && quiz.questions[questionIndex].correct !== optionIndex;
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
                Question {currentQuestion + 1} of {totalQuestions}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((currentQuestion + 1) / totalQuestions) * 100}
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
              label={`${answeredCount}/${totalQuestions}`}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Quiz Title Card */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {quiz.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalQuestions} questions • {quiz.hours} CPD hours
          </Typography>
        </CardContent>
      </Card>

      {/* Question Card */}
      {currentQ && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" fontWeight={600} color="primary.main" gutterBottom sx={{ display: 'block', mb: 2 }}>
              Question {currentQuestion + 1}
            </Typography>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, lineHeight: 1.6 }}>
              {currentQ.question}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion] !== undefined ? answers[currentQuestion] : ''}
                onChange={(e) => handleAnswerSelect(Number(e.target.value))}
              >
                {currentQ.options.map((option: string, index: number) => {
                  const selected = answers[currentQuestion] === index;
                  const correct = isCorrect(currentQuestion, index);
                  const wrong = isWrong(currentQuestion, index);

                  return (
                    <Card
                      key={index}
                      elevation={0}
                      sx={{
                        mb: 2,
                        border: '2px solid',
                        borderColor:
                          correct
                            ? 'success.main'
                            : wrong
                            ? 'error.main'
                            : selected
                            ? 'primary.main'
                            : 'divider',
                        borderRadius: 2,
                        bgcolor:
                          correct
                            ? 'success.light'
                            : wrong
                            ? 'error.light'
                            : selected
                            ? 'primary.light'
                            : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: isSubmitted ? undefined : 'primary.main',
                        },
                      }}
                    >
                      <FormControlLabel
                        value={index}
                        control={
                          <Radio
                            sx={{
                              color: correct
                                ? 'success.main'
                                : wrong
                                ? 'error.main'
                                : selected
                                ? 'primary.main'
                                : 'default',
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', py: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: selected || correct || wrong ? 600 : 400,
                                color: correct
                                  ? 'success.dark'
                                  : wrong
                                  ? 'error.dark'
                                  : selected
                                  ? 'primary.main'
                                  : 'text.primary',
                              }}
                            >
                              {option}
                            </Typography>
                            {correct && <CheckIcon sx={{ color: 'success.main', ml: 'auto' }} />}
                            {wrong && <CancelIcon sx={{ color: 'error.main', ml: 'auto' }} />}
                          </Box>
                        }
                        sx={{ m: 0, p: 2, width: '100%' }}
                      />
                    </Card>
                  );
                })}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isSubmitted && score !== null && (
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
            Quiz Completed!
          </Typography>
          <Typography variant="body2">
            Your score: <strong>{score}%</strong> ({score >= 70 ? 'Passed' : 'Failed'})
            <br />
            You've earned {quiz.hours} CPD hours.
          </Typography>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          sx={{ flex: 1 }}
        >
          Previous
        </Button>
        {currentQuestion < totalQuestions - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
              },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions || isSubmitted}
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #218838 0%, #1e7e34 100%)',
              },
            }}
          >
            Submit Quiz
          </Button>
        )}
      </Box>
    </Box>
  );
};
