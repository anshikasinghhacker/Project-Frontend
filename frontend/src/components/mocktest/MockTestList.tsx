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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Timer,
  Assignment,
  CheckCircle,
  RadioButtonUnchecked,
  TrendingUp,
  School,
  CalendarToday,
  PlayArrow,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import mockTestService from '../../services/mockTestService';

interface MockTest {
  id: number;
  title: string;
  examType: string;
  subjects: string[];
  totalQuestions: number;
  totalMarks: number;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scheduledDate?: string;
  attempts: number;
  bestScore?: number;
  averageScore?: number;
  topScore?: number;
  totalParticipants?: number;
  sections: Section[];
  isLocked: boolean;
  unlockDate?: string;
}

interface Section {
  name: string;
  subject: string;
  questions: number;
  marks: number;
  duration: number;
}

const MockTestList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);

  useEffect(() => {
    loadMockTests();
  }, []);

  const loadMockTests = async () => {
    try {
      const tests = await mockTestService.getMockTestsWithFallback();
      // Convert to MockTest format expected by UI
      const uiTests: MockTest[] = tests.map(test => ({
        id: test.id || 0,
        title: test.title,
        examType: 'Mock Test',
        subjects: test.subjects,
        totalQuestions: test.questions?.length || 0,
        totalMarks: test.totalMarks,
        duration: test.duration,
        difficulty: 'Medium' as const,
        scheduledDate: test.startTime,
        attempts: 0,
        bestScore: undefined,
        averageScore: undefined,
        topScore: undefined,
        totalParticipants: 0,
        sections: test.subjects.map(subject => ({
          name: subject,
          subject: subject,
          questions: Math.floor((test.questions?.length || 0) / test.subjects.length),
          marks: Math.floor(test.totalMarks / test.subjects.length),
          duration: Math.floor(test.duration / test.subjects.length)
        })),
        isLocked: test.status !== 'SCHEDULED',
      }));
      setMockTests(uiTests);
    } catch (error) {
      console.error('Failed to load mock tests:', error);
      // Fallback to hardcoded data
      const fallbackTests: MockTest[] = [
      {
        id: 1,
        title: 'JEE Main Mock Test - Full Syllabus',
        examType: 'JEE Main',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        totalQuestions: 90,
        totalMarks: 360,
        duration: 180,
        difficulty: 'Hard',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        attempts: 2,
        bestScore: 285,
        averageScore: 245,
        topScore: 340,
        totalParticipants: 150,
        sections: [
          { name: 'Physics', subject: 'Physics', questions: 30, marks: 120, duration: 60 },
          { name: 'Chemistry', subject: 'Chemistry', questions: 30, marks: 120, duration: 60 },
          { name: 'Mathematics', subject: 'Mathematics', questions: 30, marks: 120, duration: 60 },
        ],
        isLocked: false,
      },
      {
        id: 2,
        title: 'NEET Mock Test - Biology Focus',
        examType: 'NEET',
        subjects: ['Physics', 'Chemistry', 'Biology'],
        totalQuestions: 200,
        totalMarks: 720,
        duration: 200,
        difficulty: 'Hard',
        scheduledDate: new Date(Date.now() + 172800000).toISOString(),
        attempts: 1,
        bestScore: 580,
        averageScore: 520,
        topScore: 680,
        totalParticipants: 200,
        sections: [
          { name: 'Physics', subject: 'Physics', questions: 45, marks: 180, duration: 45 },
          { name: 'Chemistry', subject: 'Chemistry', questions: 45, marks: 180, duration: 45 },
          { name: 'Biology', subject: 'Biology', questions: 90, marks: 360, duration: 90 },
        ],
        isLocked: false,
      },
      {
        id: 3,
        title: 'Class 10 Board Exam - Mathematics',
        examType: 'Board Exam',
        subjects: ['Mathematics'],
        totalQuestions: 40,
        totalMarks: 100,
        duration: 150,
        difficulty: 'Medium',
        attempts: 3,
        bestScore: 92,
        averageScore: 85,
        topScore: 98,
        totalParticipants: 75,
        sections: [
          { name: 'Algebra', subject: 'Mathematics', questions: 15, marks: 40, duration: 60 },
          { name: 'Geometry', subject: 'Mathematics', questions: 10, marks: 30, duration: 45 },
          { name: 'Trigonometry', subject: 'Mathematics', questions: 10, marks: 20, duration: 30 },
          { name: 'Statistics', subject: 'Mathematics', questions: 5, marks: 10, duration: 15 },
        ],
        isLocked: false,
      },
      {
        id: 4,
        title: 'SAT Practice Test - Full Length',
        examType: 'SAT',
        subjects: ['English', 'Mathematics'],
        totalQuestions: 154,
        totalMarks: 1600,
        duration: 230,
        difficulty: 'Medium',
        scheduledDate: new Date(Date.now() + 259200000).toISOString(),
        attempts: 0,
        sections: [
          { name: 'Reading', subject: 'English', questions: 52, marks: 400, duration: 65 },
          { name: 'Writing & Language', subject: 'English', questions: 44, marks: 400, duration: 35 },
          { name: 'Math (No Calculator)', subject: 'Mathematics', questions: 20, marks: 400, duration: 25 },
          { name: 'Math (Calculator)', subject: 'Mathematics', questions: 38, marks: 400, duration: 55 },
        ],
        isLocked: true,
        unlockDate: new Date(Date.now() + 172800000).toISOString(),
      },
      {
        id: 5,
        title: 'Physics Olympiad - Preliminary Round',
        examType: 'Olympiad',
        subjects: ['Physics'],
        totalQuestions: 50,
        totalMarks: 200,
        duration: 120,
        difficulty: 'Hard',
        attempts: 1,
        bestScore: 145,
        averageScore: 120,
        topScore: 185,
        totalParticipants: 50,
        sections: [
          { name: 'Mechanics', subject: 'Physics', questions: 15, marks: 60, duration: 36 },
          { name: 'Thermodynamics', subject: 'Physics', questions: 10, marks: 40, duration: 24 },
          { name: 'Electromagnetism', subject: 'Physics', questions: 15, marks: 60, duration: 36 },
          { name: 'Modern Physics', subject: 'Physics', questions: 10, marks: 40, duration: 24 },
        ],
        isLocked: false,
      },
      {
        id: 6,
        title: 'Chemistry Chapter Test - Organic Chemistry',
        examType: 'Chapter Test',
        subjects: ['Chemistry'],
        totalQuestions: 30,
        totalMarks: 75,
        duration: 90,
        difficulty: 'Easy',
        attempts: 2,
        bestScore: 68,
        averageScore: 62,
        topScore: 73,
        totalParticipants: 40,
        sections: [
          { name: 'Hydrocarbons', subject: 'Chemistry', questions: 10, marks: 25, duration: 30 },
          { name: 'Functional Groups', subject: 'Chemistry', questions: 10, marks: 25, duration: 30 },
          { name: 'Reactions', subject: 'Chemistry', questions: 10, marks: 25, duration: 30 },
        ],
        isLocked: false,
      },
      {
        id: 7,
        title: 'English Proficiency Test',
        examType: 'Language Test',
        subjects: ['English'],
        totalQuestions: 80,
        totalMarks: 100,
        duration: 120,
        difficulty: 'Medium',
        attempts: 0,
        sections: [
          { name: 'Grammar', subject: 'English', questions: 25, marks: 25, duration: 30 },
          { name: 'Vocabulary', subject: 'English', questions: 20, marks: 20, duration: 25 },
          { name: 'Reading Comprehension', subject: 'English', questions: 20, marks: 30, duration: 40 },
          { name: 'Writing', subject: 'English', questions: 15, marks: 25, duration: 25 },
        ],
        isLocked: false,
      },
      {
        id: 8,
        title: 'All India Test Series - Mock 1',
        examType: 'Test Series',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        totalQuestions: 75,
        totalMarks: 300,
        duration: 180,
        difficulty: 'Hard',
        scheduledDate: new Date(Date.now() + 604800000).toISOString(),
        attempts: 0,
        sections: [
          { name: 'Physics', subject: 'Physics', questions: 25, marks: 100, duration: 60 },
          { name: 'Chemistry', subject: 'Chemistry', questions: 25, marks: 100, duration: 60 },
          { name: 'Mathematics', subject: 'Mathematics', questions: 25, marks: 100, duration: 60 },
        ],
        isLocked: true,
        unlockDate: new Date(Date.now() + 518400000).toISOString(),
      },
      ];
      setMockTests(fallbackTests);
    }
  };

  const handleAccordionChange = (testId: number) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTestTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'JEE Main': '#1976d2',
      'NEET': '#4caf50',
      'Board Exam': '#ff9800',
      'SAT': '#9c27b0',
      'Olympiad': '#f44336',
      'Chapter Test': '#00bcd4',
      'Language Test': '#795548',
      'Test Series': '#607d8b',
    };
    return colors[type] || '#757575';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mock Tests & Practice Exams
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Prepare with comprehensive mock tests designed for various competitive exams
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" color="primary">
            {mockTests.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Available Tests
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" color="success.main">
            {mockTests.filter(t => t.attempts > 0).length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tests Attempted
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" color="warning.main">
            {mockTests.filter(t => t.scheduledDate && new Date(t.scheduledDate) > new Date()).length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upcoming Tests
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h4" color="info.main">
            {Math.round(
              mockTests
                .filter(t => t.bestScore)
                .reduce((sum, t) => sum + (t.bestScore! / t.totalMarks * 100), 0) /
              mockTests.filter(t => t.bestScore).length || 0
            )}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average Performance
          </Typography>
        </Paper>
      </Box>

      {/* Mock Tests List */}
      {mockTests.map((test) => (
        <Accordion
          key={test.id}
          expanded={expandedTest === test.id}
          onChange={() => handleAccordionChange(test.id)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getTestTypeColor(test.examType),
                  mr: 2,
                }}
              >
                <Assignment />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6">{test.title}</Typography>
                  {test.isLocked && <Lock fontSize="small" color="action" />}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={test.examType}
                    size="small"
                    sx={{ bgcolor: getTestTypeColor(test.examType), color: 'white' }}
                  />
                  <Chip
                    label={test.difficulty}
                    size="small"
                    color={getDifficultyColor(test.difficulty)}
                  />
                  <Chip
                    icon={<Timer />}
                    label={`${test.duration} min`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${test.totalQuestions} Questions`}
                    size="small"
                    variant="outlined"
                  />
                  {test.attempts > 0 && (
                    <Chip
                      icon={<CheckCircle />}
                      label={`Attempted ${test.attempts}x`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
              {test.bestScore !== undefined && (
                <Box sx={{ textAlign: 'right', minWidth: '100px' }}>
                  <Typography variant="h5" color="primary">
                    {Math.round((test.bestScore / test.totalMarks) * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Best Score
                  </Typography>
                </Box>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Test Sections
                </Typography>
                <List dense>
                  {test.sections.map((section, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <School color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={section.name}
                        secondary={`${section.questions} questions • ${section.marks} marks • ${section.duration} minutes`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Test Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Marks:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {test.totalMarks}
                    </Typography>
                  </Box>
                  {test.scheduledDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Scheduled:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatDate(test.scheduledDate)}
                      </Typography>
                    </Box>
                  )}
                  {test.totalParticipants && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Participants:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {test.totalParticipants}
                      </Typography>
                    </Box>
                  )}
                  {test.topScore && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Top Score:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {test.topScore}/{test.totalMarks}
                      </Typography>
                    </Box>
                  )}
                  {test.averageScore && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Average Score:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {test.averageScore}/{test.totalMarks}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {test.attempts > 0 && test.bestScore && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(test.bestScore / test.totalMarks) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                      color={
                        test.bestScore / test.totalMarks >= 0.8
                          ? 'success'
                          : test.bestScore / test.totalMarks >= 0.6
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {test.isLocked ? (
                <Button
                  variant="contained"
                  disabled
                  startIcon={<Lock />}
                  fullWidth
                >
                  Unlocks on {test.unlockDate && new Date(test.unlockDate).toLocaleDateString()}
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => navigate(`/quiz/${test.id}`)}
                    fullWidth
                  >
                    {test.attempts > 0 ? 'Retake Test' : 'Start Test'}
                  </Button>
                  {test.attempts > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/results')}
                      fullWidth
                    >
                      View Analysis
                    </Button>
                  )}
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default MockTestList;