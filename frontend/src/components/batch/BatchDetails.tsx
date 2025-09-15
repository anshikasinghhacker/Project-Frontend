import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tab,
  Tabs,
  Grid,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  People,
  School,
  Assignment,
  CalendarToday,
  Email,
  Phone,
  Edit,
  Delete,
  Add,
  Visibility,
  TrendingUp,
  Schedule,
  Book,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import batchService from '../../services/batchService';

interface Student {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED';
  attendance?: number;
  performance?: number;
}

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
  submissionsCount: number;
  totalStudents: number;
}

interface BatchData {
  id: number;
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  currentEnrollment: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED';
  instructor?: string;
  subjects?: string[];
}

const BatchDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchBatchData(parseInt(id));
    }
  }, [id]);

  const fetchBatchData = async (batchId: number) => {
    try {
      setLoading(true);
      
      // Fetch batch details
      const batchData = await batchService.getBatchById(batchId);
      setBatch(batchData);
      
      // Mock data for students and assignments
      // In real implementation, these would be separate API calls
      setStudents([
        {
          id: 1,
          fullName: 'John Smith',
          email: 'john.smith@email.com',
          phoneNumber: '123-456-7890',
          enrollmentDate: '2024-01-15',
          status: 'ACTIVE',
          attendance: 85,
          performance: 78,
        },
        {
          id: 2,
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phoneNumber: '098-765-4321',
          enrollmentDate: '2024-01-16',
          status: 'ACTIVE',
          attendance: 92,
          performance: 88,
        },
        {
          id: 3,
          fullName: 'Mike Davis',
          email: 'mike.davis@email.com',
          enrollmentDate: '2024-01-20',
          status: 'ACTIVE',
          attendance: 76,
          performance: 72,
        },
      ]);
      
      setAssignments([
        {
          id: 1,
          title: 'Math Assignment - Chapter 5',
          dueDate: '2024-12-20',
          status: 'ACTIVE',
          submissionsCount: 15,
          totalStudents: 25,
        },
        {
          id: 2,
          title: 'Physics Lab Report',
          dueDate: '2024-12-18',
          status: 'ACTIVE',
          submissionsCount: 22,
          totalStudents: 25,
        },
        {
          id: 3,
          title: 'Chemistry Quiz',
          dueDate: '2024-12-15',
          status: 'COMPLETED',
          submissionsCount: 25,
          totalStudents: 25,
        },
      ]);
      
    } catch (err) {
      setError('Failed to fetch batch data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'info';
      case 'UPCOMING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'OVERDUE': return 'error';
      default: return 'default';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'success';
    if (performance >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (error || !batch) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Batch not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {batch.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {batch.code}
            </Typography>
            {batch.description && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {batch.description}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={batch.status}
              color={getStatusColor(batch.status)}
              variant="outlined"
            />
            {user?.role === 'ADMIN' && (
              <Button variant="outlined" startIcon={<Edit />}>
                Edit Batch
              </Button>
            )}
          </Box>
        </Box>

        {/* Batch Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* @ts-ignore */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h4">{batch.currentEnrollment}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Students
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(batch.currentEnrollment / batch.maxCapacity) * 100}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {batch.maxCapacity} capacity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* @ts-ignore */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assignment color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h4">{assignments.length}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Active Assignments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* @ts-ignore */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h4">
                    {Math.round(students.reduce((acc, s) => acc + (s.performance || 0), 0) / students.length) || 0}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Avg Performance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* @ts-ignore */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule color="info" sx={{ mr: 1 }} />
                  <Typography variant="h4">
                    {Math.round(students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length) || 0}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Avg Attendance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Students" />
          <Tab label="Assignments" />
          <Tab label="Details" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Students ({students.length})</Typography>
            {user?.role === 'ADMIN' && (
              <Button variant="contained" startIcon={<Add />}>
                Add Student
              </Button>
            )}
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {student.fullName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {student.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {student.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {student.email}
                        </Typography>
                        {student.phoneNumber && (
                          <Typography variant="caption" color="text.secondary">
                            {student.phoneNumber}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 60, mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={student.attendance || 0}
                            color={student.attendance && student.attendance >= 80 ? 'success' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2">
                          {student.attendance || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${student.performance || 0}%`}
                        color={getPerformanceColor(student.performance || 0)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.status}
                        color={getStatusColor(student.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      {user?.role === 'ADMIN' && (
                        <>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Assignments ({assignments.length})</Typography>
            <Button variant="contained" startIcon={<Add />}>
              Create Assignment
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Submissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {assignment.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 80, mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(assignment.submissionsCount / assignment.totalStudents) * 100}
                            color={assignment.submissionsCount === assignment.totalStudents ? 'success' : 'primary'}
                          />
                        </Box>
                        <Typography variant="body2">
                          {assignment.submissionsCount}/{assignment.totalStudents}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={getStatusColor(assignment.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Batch Details
          </Typography>
          
          <Grid container spacing={3}>
            {/* @ts-ignore */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Batch Name
                      </Typography>
                      <Typography variant="body1">
                        {batch.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Batch Code
                      </Typography>
                      <Typography variant="body1">
                        {batch.code}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Instructor
                      </Typography>
                      <Typography variant="body1">
                        {batch.instructor || 'Not assigned'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Capacity
                      </Typography>
                      <Typography variant="body1">
                        {batch.currentEnrollment} / {batch.maxCapacity} students
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* @ts-ignore */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Schedule
                  </Typography>
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(batch.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        End Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(batch.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {Math.ceil((new Date(batch.endDate).getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={batch.status}
                        color={getStatusColor(batch.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {batch.subjects && batch.subjects.length > 0 && (
              <Grid item xs={12} {...({} as any)}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Subjects
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {batch.subjects.map((subject, index) => (
                        <Chip
                          key={index}
                          label={subject}
                          variant="outlined"
                          icon={<Book />}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default BatchDetails;