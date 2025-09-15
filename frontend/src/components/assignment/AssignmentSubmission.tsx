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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Upload,
  AttachFile,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Visibility,
  Delete,
  CloudUpload,
  Description,
  GetApp,
  Send,
  AccessTime,
  Grade
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import assignmentService from '../../services/assignmentService';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  instructions?: string;
  attachmentUrl?: string;
  status: 'ACTIVE' | 'CLOSED';
  subject: string;
  teacherName: string;
}

interface Submission {
  id?: number;
  assignmentId: number;
  submissionText?: string;
  submissionFileUrl?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'GRADED';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

const AssignmentSubmission: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: Submission }>({});
  const [loading, setLoading] = useState(true);
  const [openSubmissionDialog, setOpenSubmissionDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Fetch assignments for student's batch
      const assignmentData = await assignmentService.getAllAssignments();
      setAssignments(assignmentData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Mock data for development
      setAssignments([
        {
          id: 1,
          title: 'Mathematics Problem Set 1',
          description: 'Solve the given algebra problems and show your work.',
          dueDate: '2024-12-15T23:59:00',
          totalMarks: 100,
          instructions: 'Please show all working steps. Upload your solutions as PDF.',
          status: 'ACTIVE',
          subject: 'Mathematics',
          teacherName: 'John Doe'
        },
        {
          id: 2,
          title: 'Physics Lab Report',
          description: 'Write a detailed lab report on the pendulum experiment.',
          dueDate: '2024-12-20T23:59:00',
          totalMarks: 50,
          status: 'ACTIVE',
          subject: 'Physics',
          teacherName: 'Jane Smith'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const submissionData = await assignmentService.getMySubmissions();
      const submissionMap: { [key: number]: Submission } = {};
      submissionData.forEach((submission: Submission & { assignmentId: number }) => {
        submissionMap[submission.assignmentId] = submission;
      });
      setSubmissions(submissionMap);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleOpenSubmission = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = submissions[assignment.id];
    if (existingSubmission) {
      setSubmissionText(existingSubmission.submissionText || '');
    } else {
      setSubmissionText('');
    }
    setSubmissionFile(null);
    setOpenSubmissionDialog(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, DOC, DOCX, and TXT files are allowed');
        return;
      }
      
      setSubmissionFile(file);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    if (!submissionText.trim() && !submissionFile) {
      alert('Please provide either text submission or upload a file');
      return;
    }

    try {
      setUploading(true);
      
      const submissionData = {
        assignmentId: selectedAssignment.id,
        submissionText: submissionText.trim() || undefined,
        status: 'SUBMITTED' as const,
        submittedAt: new Date().toISOString(),
        submissionFileUrl: undefined as string | undefined
      };

      // If there's a file, upload it first
      if (submissionFile) {
        const uploadResponse = await assignmentService.uploadSubmissionFile(
          selectedAssignment.id,
          submissionFile
        );
        submissionData.submissionFileUrl = uploadResponse.fileUrl;
      }

      await assignmentService.submitAssignment(submissionData);
      
      // Update local state
      setSubmissions(prev => ({
        ...prev,
        [selectedAssignment.id]: submissionData as Submission
      }));

      setOpenSubmissionDialog(false);
      setSubmissionText('');
      setSubmissionFile(null);
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'primary';
      case 'UNDER_REVIEW': return 'warning';
      case 'REVIEWED': return 'info';
      case 'GRADED': return 'success';
      default: return 'default';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
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

  const getFilteredAssignments = () => {
    return assignments.filter(assignment => {
      const submission = submissions[assignment.id];
      switch (filter) {
        case 'pending':
          return !submission;
        case 'submitted':
          return submission && submission.status === 'SUBMITTED';
        case 'graded':
          return submission && submission.status === 'GRADED';
        default:
          return true;
      }
    });
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Assignments
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            label="Filter"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="graded">Graded</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : (
        <Box>
          {filteredAssignments.length === 0 ? (
            <Alert severity="info">
              No assignments found for the selected filter.
            </Alert>
          ) : (
            filteredAssignments.map((assignment) => {
              const submission = submissions[assignment.id];
              const overdue = isOverdue(assignment.dueDate);
              
              return (
                <Card key={assignment.id} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6" component="h2">
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {assignment.subject} • {assignment.teacherName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <AccessTime fontSize="small" />
                          <Typography 
                            variant="body2" 
                            color={overdue ? 'error' : 'text.secondary'}
                          >
                            Due: {formatDate(assignment.dueDate)}
                          </Typography>
                          {overdue && !submission && (
                            <Chip label="OVERDUE" color="error" size="small" />
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Grade fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            Total Marks: {assignment.totalMarks}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={2}>
                        {submission && (
                          <Box textAlign="right">
                            <Chip 
                              label={submission.status.replace('_', ' ')} 
                              color={getStatusColor(submission.status)}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            {submission.grade !== undefined && (
                              <Typography variant="h6" color="success.main">
                                {submission.grade}/{assignment.totalMarks}
                              </Typography>
                            )}
                          </Box>
                        )}
                        
                        <Button
                          variant={submission ? "outlined" : "contained"}
                          startIcon={submission ? <Visibility /> : <Upload />}
                          onClick={() => handleOpenSubmission(assignment)}
                          disabled={assignment.status === 'CLOSED'}
                        >
                          {submission ? 'View Submission' : 'Submit'}
                        </Button>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {assignment.description}
                    </Typography>
                    
                    {assignment.instructions && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Instructions:</strong> {assignment.instructions}
                      </Alert>
                    )}
                    
                    {assignment.attachmentUrl && (
                      <Box mt={2}>
                        <Button
                          startIcon={<GetApp />}
                          onClick={() => window.open(assignment.attachmentUrl, '_blank')}
                        >
                          Download Assignment File
                        </Button>
                      </Box>
                    )}

                    {submission?.feedback && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <strong>Feedback:</strong> {submission.feedback}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      )}

      {/* Submission Dialog */}
      <Dialog 
        open={openSubmissionDialog} 
        onClose={() => setOpenSubmissionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submit Assignment: {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Text Submission:
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Enter your assignment submission here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              File Upload:
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  Choose File
                </Button>
              </label>
              {submissionFile && (
                <Box display="flex" alignItems="center" gap={1}>
                  <AttachFile fontSize="small" />
                  <Typography variant="body2">{submissionFile.name}</Typography>
                  <IconButton size="small" onClick={() => setSubmissionFile(null)}>
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Supported formats: PDF, DOC, DOCX, TXT (Max size: 10MB)
            </Typography>

            {submissions[selectedAssignment?.id || 0] && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You have already submitted this assignment. Submitting again will replace your previous submission.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmissionDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAssignment}
            variant="contained"
            startIcon={<Send />}
            disabled={uploading || (!submissionText.trim() && !submissionFile)}
          >
            {uploading ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignmentSubmission;