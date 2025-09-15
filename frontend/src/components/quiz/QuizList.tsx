import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Timer,
  School,
  Search,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Quiz {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  questions: number;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  attempts: number;
  bestScore: number | null;
}

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    const mockQuizzes: Quiz[] = [
      {
        id: 1,
        title: 'Algebra Basics',
        subject: 'Mathematics',
        gradeLevel: '10',
        questions: 15,
        duration: 30,
        difficulty: 'Easy',
        attempts: 2,
        bestScore: 85,
      },
      {
        id: 2,
        title: 'Quadratic Equations',
        subject: 'Mathematics',
        gradeLevel: '10',
        questions: 20,
        duration: 45,
        difficulty: 'Medium',
        attempts: 1,
        bestScore: 78,
      },
      {
        id: 3,
        title: 'Newton\'s Laws of Motion',
        subject: 'Physics',
        gradeLevel: '11',
        questions: 25,
        duration: 40,
        difficulty: 'Medium',
        attempts: 0,
        bestScore: null,
      },
      {
        id: 4,
        title: 'Organic Chemistry Fundamentals',
        subject: 'Chemistry',
        gradeLevel: '12',
        questions: 30,
        duration: 60,
        difficulty: 'Hard',
        attempts: 3,
        bestScore: 92,
      },
      {
        id: 5,
        title: 'Cell Biology',
        subject: 'Biology',
        gradeLevel: '11',
        questions: 20,
        duration: 35,
        difficulty: 'Easy',
        attempts: 1,
        bestScore: 88,
      },
      {
        id: 6,
        title: 'English Grammar',
        subject: 'English',
        gradeLevel: '10',
        questions: 25,
        duration: 30,
        difficulty: 'Easy',
        attempts: 0,
        bestScore: null,
      },
      {
        id: 7,
        title: 'World History: Modern Era',
        subject: 'History',
        gradeLevel: '11',
        questions: 30,
        duration: 50,
        difficulty: 'Medium',
        attempts: 2,
        bestScore: 75,
      },
      {
        id: 8,
        title: 'Trigonometry Advanced',
        subject: 'Mathematics',
        gradeLevel: '11',
        questions: 25,
        duration: 50,
        difficulty: 'Hard',
        attempts: 0,
        bestScore: null,
      },
    ];
    setQuizzes(mockQuizzes);
    setFilteredQuizzes(mockQuizzes);
  }, []);

  useEffect(() => {
    let filtered = quizzes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (subjectFilter !== 'All') {
      filtered = filtered.filter(quiz => quiz.subject === subjectFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(quiz => quiz.difficulty === difficultyFilter);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, subjectFilter, difficultyFilter, quizzes]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Quizzes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your knowledge with our curated quizzes
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              label="Subject"
            >
              {subjects.map(subject => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              label="Difficulty"
            >
              {difficulties.map(difficulty => (
                <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Quiz Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <QuizIcon color="primary" sx={{ fontSize: 40 }} />
                <Chip
                  label={quiz.difficulty}
                  size="small"
                  color={getDifficultyColor(quiz.difficulty)}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {quiz.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<School />}
                  label={quiz.subject}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Grade ${quiz.gradeLevel}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Questions: {quiz.questions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Timer sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  {quiz.duration} min
                </Typography>
              </Box>
              
              {quiz.attempts > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Attempts: {quiz.attempts}
                    </Typography>
                    {quiz.bestScore !== null && (
                      <Chip
                        label={`Best: ${quiz.bestScore}%`}
                        size="small"
                        color={getScoreColor(quiz.bestScore)}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                {quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {filteredQuizzes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No quizzes found matching your criteria
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default QuizList;