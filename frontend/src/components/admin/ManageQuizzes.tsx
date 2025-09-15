import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Quiz {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  totalQuestions: number;
  duration: number;
  createdBy: string;
  createdAt: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

const ManageQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    gradeLevel: '',
    totalQuestions: 10,
    duration: 30,
    status: 'DRAFT',
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    // Mock data for now
    setQuizzes([
      {
        id: 1,
        title: 'Mathematics Chapter 5 Quiz',
        subject: 'Mathematics',
        gradeLevel: '10',
        totalQuestions: 15,
        duration: 30,
        createdBy: 'Test Educator',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      {
        id: 2,
        title: 'Physics Mock Test',
        subject: 'Physics',
        gradeLevel: '11',
        totalQuestions: 20,
        duration: 45,
        createdBy: 'Test Educator',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      {
        id: 3,
        title: 'Chemistry Organic Compounds',
        subject: 'Chemistry',
        gradeLevel: '12',
        totalQuestions: 25,
        duration: 60,
        createdBy: 'Test Educator',
        createdAt: new Date().toISOString(),
        status: 'DRAFT',
      },
    ]);
  };

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        subject: quiz.subject,
        gradeLevel: quiz.gradeLevel,
        totalQuestions: quiz.totalQuestions,
        duration: quiz.duration,
        status: quiz.status,
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        subject: '',
        gradeLevel: '',
        totalQuestions: 10,
        duration: 30,
        status: 'DRAFT',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuiz(null);
  };

  const handleSaveQuiz = async () => {
    if (editingQuiz) {
      // Update existing quiz
      setQuizzes(quizzes.map(q => 
        q.id === editingQuiz.id 
          ? { 
              ...q, 
              ...formData,
              status: formData.status as Quiz['status']
            }
          : q
      ));
    } else {
      // Add new quiz
      const newQuiz: Quiz = {
        id: quizzes.length + 1,
        ...formData,
        totalQuestions: Number(formData.totalQuestions),
        duration: Number(formData.duration),
        status: formData.status as Quiz['status'],
        createdBy: 'Current Admin',
        createdAt: new Date().toISOString(),
      };
      setQuizzes([...quizzes, newQuiz]);
    }
    handleCloseDialog();
  };

  const handleDeleteQuiz = (id: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Manage Quizzes</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Create New Quiz
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.subject}</TableCell>
                  <TableCell>{quiz.gradeLevel}</TableCell>
                  <TableCell>{quiz.totalQuestions}</TableCell>
                  <TableCell>{quiz.duration} min</TableCell>
                  <TableCell>
                    <Chip
                      label={quiz.status}
                      color={getStatusColor(quiz.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{quiz.createdBy}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(quiz)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Quiz Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <TextField
              fullWidth
              label="Grade Level"
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Total Questions"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                type="number"
                label="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </Box>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuiz} variant="contained">
            {editingQuiz ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageQuizzes;