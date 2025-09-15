import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  Assignment,
  Save,
  Cancel,
  AttachFile,
  Delete,
  Add,
  CalendarToday,
  School,
  Description,
  Grade
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import batchService from '../../services/batchService';
import assignmentService from '../../services/assignmentService';

interface AssignmentFormData {
  title: string;
  description: string;
  batchId: number | '';
  subject: string;
  dueDate: string;
  dueTime: string;
  totalMarks: number;
  passingMarks: number;
  instructions: string;
  attachmentUrls: string[];
  allowLateSubmission: boolean;
  maxAttempts: number;
  assignmentType: 'HOMEWORK' | 'PROJECT' | 'LAB' | 'QUIZ' | 'EXAM';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const AssignmentCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    batchId: '',
    subject: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    dueTime: '23:59',
    totalMarks: 100,
    passingMarks: 40,
    instructions: '',
    attachmentUrls: [],
    allowLateSubmission: false,
    maxAttempts: 1,
    assignmentType: 'HOMEWORK',
    difficulty: 'MEDIUM'
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const myBatches = await batchService.getMyBatches();
      setBatches(myBatches);
    } catch (error) {
      // Use mock data if API fails
      setBatches([
        { id: 1, batchName: 'Mathematics Batch A', batchCode: 'MATH-A' },
        { id: 2, batchName: 'Physics Batch B', batchCode: 'PHY-B' },
        { id: 3, batchName: 'Chemistry Batch C', batchCode: 'CHEM-C' }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      allowLateSubmission: e.target.checked
    }));
  };

  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        attachmentUrls: [...prev.attachmentUrls, attachmentUrl]
      }));
      setAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        // Allow PDF, images, and documents
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'txt'];
        
        if (!allowedTypes.includes(fileType) && !allowedExtensions.includes(fileExtension || '')) {
          setError(`File ${file.name} is not supported. Please upload PDF, images, or document files.`);
          return false;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        
        return true;
      });
      
      if (newFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...newFiles]);
        
        // Convert files to data URLs for local storage
        newFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setFormData(prev => ({
              ...prev,
              attachmentUrls: [...prev.attachmentUrls, `${file.name}:::${dataUrl}`]
            }));
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    // Also remove from attachmentUrls
    const fileName = uploadedFiles[index].name;
    setFormData(prev => ({
      ...prev,
      attachmentUrls: prev.attachmentUrls.filter(url => !url.startsWith(`${fileName}:::`))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.title || !formData.batchId || !formData.subject) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.passingMarks > formData.totalMarks) {
      setError('Passing marks cannot be greater than total marks');
      return;
    }

    try {
      setLoading(true);
      // Try to create assignment via API
      await assignmentService.createAssignment({
        ...formData,
        teacherId: user?.id,
        batchId: formData.batchId as number,
        dueDate: `${formData.dueDate}T${formData.dueTime}:00`,
        status: 'ACTIVE'
      });
      
      setSuccess('Assignment created successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/teacher');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      setError(error?.response?.data?.message || 'Failed to create assignment. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    navigate('/dashboard/teacher');
  };

  const getSubjectSuggestions = () => {
    return ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'];
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Assignment sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">Create New Assignment</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Assignment Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Chapter 5 Problem Set"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Assignment />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Brief description of the assignment..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Select Batch */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Select Batch</InputLabel>
                <Select
                  value={formData.batchId}
                  label="Select Batch"
                  onChange={(e) => handleSelectChange('batchId', e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>Select a batch</em>
                  </MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batchName} ({batch.batchCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subject */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  label="Subject"
                  onChange={(e) => handleSelectChange('subject', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a subject</em>
                  </MenuItem>
                  {getSubjectSuggestions().map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Assignment Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assignment Type</InputLabel>
                <Select
                  value={formData.assignmentType}
                  label="Assignment Type"
                  onChange={(e) => handleSelectChange('assignmentType', e.target.value)}
                >
                  <MenuItem value="HOMEWORK">Homework</MenuItem>
                  <MenuItem value="PROJECT">Project</MenuItem>
                  <MenuItem value="LAB">Lab Work</MenuItem>
                  <MenuItem value="QUIZ">Quiz</MenuItem>
                  <MenuItem value="EXAM">Exam</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Difficulty */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Difficulty Level"
                  onChange={(e) => handleSelectChange('difficulty', e.target.value)}
                >
                  <MenuItem value="EASY">
                    <Chip label="Easy" color="success" size="small" />
                  </MenuItem>
                  <MenuItem value="MEDIUM">
                    <Chip label="Medium" color="warning" size="small" />
                  </MenuItem>
                  <MenuItem value="HARD">
                    <Chip label="Hard" color="error" size="small" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Due Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Due Time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Time"
                name="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Total Marks */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Marks"
                name="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Grade />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Passing Marks */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Passing Marks"
                name="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={handleInputChange}
                required
                helperText="Minimum marks to pass"
              />
            </Grid>

            {/* Max Attempts */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Attempts"
                name="maxAttempts"
                type="number"
                value={formData.maxAttempts}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 10 }}
                helperText="Number of submission attempts"
              />
            </Grid>

            {/* Instructions */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                multiline
                rows={4}
                placeholder="Detailed instructions for students..."
                helperText="Provide clear instructions on how to complete the assignment"
              />
            </Grid>

            {/* Attachments */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Attachments / Reference Materials
              </Typography>
              
              {/* File Upload Section */}
              <Box mb={2}>
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="file-upload"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<AttachFile />}
                    sx={{ mb: 2 }}
                  >
                    Upload Files (PDF, Images, Documents)
                  </Button>
                </label>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                  Supported: PDF, JPG, PNG, GIF, DOC, DOCX, TXT (Max 10MB per file)
                </Typography>
              </Box>

              {/* URL Input Section */}
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  fullWidth
                  label="Or add URL link"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  size="small"
                />
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddAttachment}
                  disabled={!attachmentUrl.trim()}
                >
                  Add URL
                </Button>
              </Box>

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body2" gutterBottom>
                    Uploaded Files:
                  </Typography>
                  {uploadedFiles.map((file, index) => {
                    const isImage = file.type.startsWith('image/');
                    const isPdf = file.type === 'application/pdf';
                    return (
                      <Chip
                        key={index}
                        label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                        onDelete={() => handleRemoveFile(index)}
                        icon={isPdf ? <Description /> : isImage ? <AttachFile /> : <AttachFile />}
                        color={isPdf ? 'error' : isImage ? 'primary' : 'default'}
                        sx={{ m: 0.5 }}
                      />
                    );
                  })}
                </Box>
              )}

              {/* Display URL attachments */}
              {formData.attachmentUrls.filter(url => !url.includes(':::')).length > 0 && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    URL Links:
                  </Typography>
                  {formData.attachmentUrls
                    .filter(url => !url.includes(':::'))
                    .map((url, index) => (
                      <Chip
                        key={index}
                        label={url}
                        onDelete={() => handleRemoveAttachment(index)}
                        icon={<AttachFile />}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                </Box>
              )}
            </Grid>

            {/* Late Submission */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowLateSubmission}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Allow late submissions"
              />
              <FormHelperText>
                Students can submit after the due date with penalty
              </FormHelperText>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Assignment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AssignmentCreate;