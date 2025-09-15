import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Divider,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Timer,
  CheckCircle,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
}

const QuizView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Mock quiz data
    setQuiz({
      id: parseInt(id || '1'),
      title: 'Mathematics Chapter 5 Quiz',
      subject: 'Mathematics',
      gradeLevel: '10',
      duration: 30,
      totalQuestions: 10,
      questions: [
        {
          id: 1,
          question: 'What is the value of x in the equation: 2x + 5 = 15?',
          options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 20'],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: 'Simplify: (3x²)(4x³)',
          options: ['12x⁵', '7x⁵', '12x⁶', '7x⁶'],
          correctAnswer: 0,
        },
        {
          id: 3,
          question: 'What is the slope of the line y = 3x + 2?',
          options: ['2', '3', '5', '3x'],
          correctAnswer: 1,
        },
        {
          id: 4,
          question: 'Factor: x² - 9',
          options: ['(x-3)(x-3)', '(x+3)(x+3)', '(x+3)(x-3)', 'Cannot be factored'],
          correctAnswer: 2,
        },
        {
          id: 5,
          question: 'Solve for y: 3y - 7 = 14',
          options: ['y = 7', 'y = 21', 'y = 3', 'y = 14'],
          correctAnswer: 0,
        },
        {
          id: 6,
          question: 'What is the quadratic formula?',
          options: [
            'x = -b ± √(b²-4ac) / 2a',
            'x = -b ± √(b²+4ac) / 2a',
            'x = b ± √(b²-4ac) / 2a',
            'x = -b ± √(b²-4ac) / a',
          ],
          correctAnswer: 0,
        },
        {
          id: 7,
          question: 'What is the value of π (pi) to 2 decimal places?',
          options: ['3.41', '3.14', '3.16', '3.12'],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: 'Simplify: √(16x⁴)',
          options: ['4x²', '4x', '16x²', '8x²'],
          correctAnswer: 0,
        },
        {
          id: 9,
          question: 'What is the y-intercept of y = 2x - 5?',
          options: ['2', '-5', '5', '-2'],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: 'Evaluate: 3³',
          options: ['9', '27', '6', '81'],
          correctAnswer: 1,
        },
      ],
    });
  }, [id]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeLeft((quiz?.duration || 30) * 60); // Convert minutes to seconds
  };

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore((correctAnswers / quiz.questions.length) * 100);
    setQuizCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <Container>
        <Typography>Loading quiz...</Typography>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {quiz.title}
          </Typography>
          <Box sx={{ my: 3 }}>
            <Chip label={`Subject: ${quiz.subject}`} sx={{ mx: 1 }} />
            <Chip label={`Grade: ${quiz.gradeLevel}`} sx={{ mx: 1 }} />
            <Chip label={`Duration: ${quiz.duration} minutes`} sx={{ mx: 1 }} />
            <Chip label={`Questions: ${quiz.totalQuestions}`} sx={{ mx: 1 }} />
          </Box>
          <Typography variant="body1" paragraph>
            You will have {quiz.duration} minutes to complete this quiz.
            Once you start, the timer cannot be paused.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartQuiz}
            startIcon={<Timer />}
          >
            Start Quiz
          </Button>
        </Paper>
      </Container>
    );
  }

  if (quizCompleted) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Quiz Completed!
          </Typography>
          <Typography variant="h2" color="primary" sx={{ my: 3 }}>
            {score.toFixed(0)}%
          </Typography>
          <Typography variant="body1" paragraph>
            You answered {Math.round((score / 100) * quiz.questions.length)} out of{' '}
            {quiz.questions.length} questions correctly.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/quizzes')}
              sx={{ mr: 2 }}
            >
              Back to Quizzes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/results')}
            >
              View All Results
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{quiz.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<Timer />}
              label={formatTime(timeLeft)}
              color={timeLeft < 60 ? 'error' : 'default'}
            />
            <Typography variant="body2">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Typography>
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestion + 1}
          </Typography>
          <Typography variant="body1" paragraph>
            {question.question}
          </Typography>
          
          <RadioGroup
            value={answers[question.id] ?? ''}
            onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
          >
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNextQuestion}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Question Navigation */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Question Navigation
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              variant={currentQuestion === index ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setCurrentQuestion(index)}
              sx={{
                minWidth: '40px',
                backgroundColor: answers[quiz.questions[index].id] !== undefined
                  ? currentQuestion === index
                    ? 'primary.main'
                    : 'primary.light'
                  : undefined,
              }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default QuizView;