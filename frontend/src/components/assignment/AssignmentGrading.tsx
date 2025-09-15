import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Grade,
  Visibility,
  GetApp,
  Save,
  Send,
  AccessTime,
  Person,
  Feedback,
  CheckCircle,
  Warning,
  ExpandMore,
  Star,
  Comment,
  AttachFile
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import assignmentService from '../../services/assignmentService';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  totalMarks: number;
  batchName: string;
  submissionCount: number;
  pendingGrading: number;
}

interface Submission {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  assignmentId: number;
  submissionText?: string;
  submissionFileUrl?: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'GRADED';
  grade?: number;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  gradedBy?: string;
  gradedAt?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AssignmentGrading: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openGradingDialog, setOpenGradingDialog] = useState(false);
  const [gradeValue, setGradeValue] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment.id);
    }
  }, [selectedAssignment]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const assignmentData = await assignmentService.getAllAssignments();
      setAssignments(assignmentData);
      if (assignmentData.length > 0) {
        setSelectedAssignment(assignmentData[0]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Mock data for development
      setAssignments([
        {
          id: 1,
          title: 'Mathematics Problem Set 1',
          description: 'Solve the given algebra problems',
          subject: 'Mathematics',
          dueDate: '2024-12-15T23:59:00',
          totalMarks: 100,
          batchName: 'Math Batch A',
          submissionCount: 25,
          pendingGrading: 15
        },
        {
          id: 2,
          title: 'Physics Lab Report',
          description: 'Pendulum experiment analysis',
          subject: 'Physics',
          dueDate: '2024-12-20T23:59:00',
          totalMarks: 50,
          batchName: 'Physics Batch B',
          submissionCount: 20,
          pendingGrading: 8
        }
      ]);
      if (assignments.length === 0) {
        setSelectedAssignment({
          id: 1,
          title: 'Mathematics Problem Set 1',
          description: 'Solve the given algebra problems',
          subject: 'Mathematics',
          dueDate: '2024-12-15T23:59:00',
          totalMarks: 100,
          batchName: 'Math Batch A',
          submissionCount: 25,
          pendingGrading: 15
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId: number) => {
    try {
      setSubmissionsLoading(true);
      const submissionData = await assignmentService.getSubmissions(assignmentId);
      setSubmissions(submissionData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Mock data for development
      setSubmissions([
        {
          id: 1,
          studentId: 1,
          studentName: 'John Student',
          studentEmail: 'john@student.com',
          assignmentId: assignmentId,
          submissionText: 'Here is my solution to the mathematics problems...',
          submittedAt: '2024-12-10T14:30:00',
          status: 'SUBMITTED'
        },
        {
          id: 2,
          studentId: 2,
          studentName: 'Jane Student',
          studentEmail: 'jane@student.com',
          assignmentId: assignmentId,
          submissionText: 'My approach to solving these algebra problems...',
          submittedAt: '2024-12-11T10:15:00',
          status: 'GRADED',
          grade: 85,
          feedback: 'Good work! Minor calculation error in problem 3.',
          gradedBy: 'Teacher Name',
          gradedAt: '2024-12-12T16:20:00'
        }
      ]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOpenGrading = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeValue(submission.grade || 0);
    setFeedbackText(submission.feedback || '');
    setOpenGradingDialog(true);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !selectedAssignment) return;

    try {
      setSaving(true);
      
      await assignmentService.reviewSubmission(
        selectedSubmission.id!,
        gradeValue,
        feedbackText
      );

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === selectedSubmission.id 
            ? {
                ...sub,
                grade: gradeValue,
                feedback: feedbackText,
                status: 'GRADED',
                gradedBy: user?.fullName,
                gradedAt: new Date().toISOString()
              }
            : sub
        )
      );

      setOpenGradingDialog(false);
      setGradeValue(0);
      setFeedbackText('');
      
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to save grade. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'REVIEWED': return 'primary';
      case 'GRADED': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredSubmissions = () => {
    if (filterStatus === 'all') return submissions;
    return submissions.filter(sub => sub.status === filterStatus);
  };

  const getGradeColor = (grade: number, totalMarks: number) => {
    const percentage = (grade / totalMarks) * 100;
    if (percentage >= 80) return 'success.main';
    if (percentage >= 60) return 'warning.main';
    return 'error.main';
  };

  const calculateStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.status === 'GRADED').length;
    const pending = submissions.filter(s => s.status === 'SUBMITTED').length;
    const avgGrade = submissions
      .filter(s => s.grade !== undefined)
      .reduce((sum, s) => sum + (s.grade || 0), 0) / graded || 0;
    
    return { total, graded, pending, avgGrade };
  };

  const stats = calculateStats();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Assignment Grading
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Assignments" />
          <Tab label="Grade Submissions" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <LinearProgress />
        ) : (
          <Box>
            {assignments.map((assignment) => (
              <Card key={assignment.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="h6">{assignment.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {assignment.subject} • {assignment.batchName}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {assignment.description}
                      </Typography>
                      <Box display="flex" gap={3}>
                        <Typography variant="body2">
                          Due: {formatDate(assignment.dueDate)}
                        </Typography>
                        <Typography variant="body2">
                          Total Marks: {assignment.totalMarks}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        {assignment.submissionCount} Submissions
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        {assignment.pendingGrading} Pending
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setTabValue(1);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Grade Submissions
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {selectedAssignment && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                {selectedAssignment.title} - Submissions
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                  <MenuItem value="GRADED">Graded</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {submissionsLoading ? (
              <LinearProgress />
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Submitted At</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Grade</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredSubmissions().map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {submission.studentName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {submission.studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {submission.studentEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {formatDate(submission.submittedAt)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={submission.status.replace('_', ' ')}
                            color={getStatusColor(submission.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {submission.grade !== undefined ? (
                            <Typography
                              variant="body2"
                              color={getGradeColor(submission.grade, selectedAssignment.totalMarks)}
                            >
                              {submission.grade}/{selectedAssignment.totalMarks}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Grade />}
                            onClick={() => handleOpenGrading(submission)}
                          >
                            {submission.status === 'GRADED' ? 'Review' : 'Grade'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {selectedAssignment && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Grading Statistics - {selectedAssignment.title}
            </Typography>
            
            <Box display="flex" gap={3} mb={4}>
              <Card sx={{ minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Submissions
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.graded}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graded
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {stats.avgGrade.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Grade
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </TabPanel>

      {/* Grading Dialog */}
      <Dialog 
        open={openGradingDialog} 
        onClose={() => setOpenGradingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Grade Submission - {selectedSubmission?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Submission Details:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Submitted: {formatDate(selectedSubmission.submittedAt)}
              </Typography>
              
              {selectedSubmission.submissionText && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Text Submission:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedSubmission.submissionText}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedSubmission.submissionFileUrl && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    File Submission:
                  </Typography>
                  <Button
                    startIcon={<GetApp />}
                    onClick={() => window.open(selectedSubmission.submissionFileUrl, '_blank')}
                  >
                    Download Submitted File
                  </Button>
                </Box>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Grade (out of {selectedAssignment?.totalMarks}):
                </Typography>
                <TextField
                  type="number"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(Number(e.target.value))}
                  inputProps={{
                    min: 0,
                    max: selectedAssignment?.totalMarks || 100
                  }}
                  sx={{ width: 150 }}
                />
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Feedback:
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Provide detailed feedback to the student..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradingDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGradeSubmission}
            variant="contained"
            startIcon={<Save />}
            disabled={saving || gradeValue < 0 || (gradeValue > (selectedAssignment?.totalMarks || 100))}
          >
            {saving ? 'Saving...' : 'Save Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignmentGrading;