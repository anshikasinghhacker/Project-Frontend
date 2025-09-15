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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  RadioGroup,
  Radio,
  Checkbox
} from '@mui/material';
import {
  Quiz,
  Add,
  Delete,
  Edit,
  Save,
  Preview,
  Schedule,
  Group,
  Security,
  Timer,
  Assessment,
  ExpandMore,
  DragIndicator,
  QuestionAnswer,
  CheckCircle,
  Cancel,
  Visibility,
  School
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import batchService from '../../services/batchService';

interface MockTest {
  id?: number;
  title: string;
  description: string;
  batchId: number;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  totalMarks: number;
  isProctored: boolean;
  enableWebcam: boolean;
  enableScreenCapture: boolean;
  tabSwitchLimit: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  instructions?: string;
  questions: Question[];
  subjects: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
}

interface Question {
  id?: number;
  questionText: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  marks: number;
  subject: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  order: number;
}

interface Batch {
  id: number;
  batchName: string;
  batchCode: string;
}

const MockTestCreate: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  
  const [testData, setTestData] = useState<MockTest>({
    title: '',
    description: '',
    batchId: 0,
    startTime: '',
    endTime: '',
    duration: 60,
    totalMarks: 0,
    isProctored: false,
    enableWebcam: false,
    enableScreenCapture: false,
    tabSwitchLimit: 3,
    shuffleQuestions: true,
    showResults: true,
    instructions: '',
    questions: [],
    subjects: [],
    status: 'DRAFT'
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionText: '',
    type: 'MCQ',
    marks: 1,
    subject: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    order: 1
  });

  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    // Calculate total marks when questions change
    const totalMarks = testData.questions.reduce((sum, q) => sum + q.marks, 0);
    setTestData(prev => ({ ...prev, totalMarks }));
  }, [testData.questions]);

  const fetchBatches = async () => {
    try {
      const batchData = await batchService.getMyBatches();
      setBatches(batchData);
    } catch (error) {
      console.error('Error fetching batches:', error);
      // Mock data
      setBatches([
        { id: 1, batchName: 'Mathematics Batch A', batchCode: 'MATH-A' },
        { id: 2, batchName: 'Physics Batch B', batchCode: 'PHY-B' }
      ]);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field: keyof MockTest, value: any) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionInputChange = (field: keyof Question, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const openAddQuestion = () => {
    setCurrentQuestion({
      questionText: '',
      type: 'MCQ',
      marks: 1,
      subject: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      order: testData.questions.length + 1
    });
    setEditingQuestion(null);
    setOpenQuestionDialog(true);
  };

  const openEditQuestion = (question: Question) => {
    setCurrentQuestion({ ...question });
    setEditingQuestion(question);
    setOpenQuestionDialog(true);
  };

  const saveQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.subject) {
      alert('Please fill in required fields');
      return;
    }

    if (currentQuestion.type === 'MCQ' && !currentQuestion.correctAnswer) {
      alert('Please select the correct answer');
      return;
    }

    const questionToSave = {
      ...currentQuestion,
      id: editingQuestion?.id || Date.now(),
      order: editingQuestion?.order || testData.questions.length + 1
    };

    if (editingQuestion) {
      // Update existing question
      setTestData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === editingQuestion.id ? questionToSave : q
        )
      }));
    } else {
      // Add new question
      setTestData(prev => ({
        ...prev,
        questions: [...prev.questions, questionToSave]
      }));
    }

    // Update subjects list
    if (!testData.subjects.includes(currentQuestion.subject)) {
      setTestData(prev => ({
        ...prev,
        subjects: [...prev.subjects, currentQuestion.subject]
      }));
    }

    setOpenQuestionDialog(false);
  };

  const deleteQuestion = (questionId: number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const saveMockTest = async (status: 'DRAFT' | 'SCHEDULED') => {
    try {
      setLoading(true);
      const mockTestData = {
        ...testData,
        status,
        educatorId: user?.id
      };

      // In real implementation, save to backend
      console.log('Saving mock test:', mockTestData);
      
      alert(`Mock test ${status === 'DRAFT' ? 'saved as draft' : 'scheduled'} successfully!`);
      
      // Reset form
      setTestData({
        title: '',
        description: '',
        batchId: 0,
        startTime: '',
        endTime: '',
        duration: 60,
        totalMarks: 0,
        isProctored: false,
        enableWebcam: false,
        enableScreenCapture: false,
        tabSwitchLimit: 3,
        shuffleQuestions: true,
        showResults: true,
        instructions: '',
        questions: [],
        subjects: [],
        status: 'DRAFT'
      });
      setActiveStep(0);
      
    } catch (error) {
      console.error('Error saving mock test:', error);
      alert('Failed to save mock test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MCQ': return 'Multiple Choice';
      case 'TRUE_FALSE': return 'True/False';
      case 'SHORT_ANSWER': return 'Short Answer';
      case 'LONG_ANSWER': return 'Long Answer';
      default: return type;
    }
  };

  const steps = [
    'Basic Information',
    'Test Settings',
    'Add Questions',
    'Review & Schedule'
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Create Mock Test
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={() => setOpenPreview(true)}
            disabled={testData.questions.length === 0}
          >
            Preview
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Basic Information */}
          <Step>
            <StepLabel>Basic Information</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Test Title"
                  value={testData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  value={testData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 3 }}
                />
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Batch</InputLabel>
                  <Select
                    value={testData.batchId}
                    onChange={(e) => handleInputChange('batchId', Number(e.target.value))}
                    label="Select Batch"
                    required
                  >
                    {batches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.batchName} ({batch.batchCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box display="flex" gap={2} mb={3}>
                  <TextField
                    type="datetime-local"
                    label="Start Time"
                    value={testData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  
                  <TextField
                    type="datetime-local"
                    label="End Time"
                    value={testData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  
                  <TextField
                    type="number"
                    label="Duration (minutes)"
                    value={testData.duration}
                    onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ minWidth: 150 }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!testData.title || !testData.batchId || !testData.startTime}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Test Settings */}
          <Step>
            <StepLabel>Test Settings</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Proctoring Settings
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={testData.isProctored}
                      onChange={(e) => handleInputChange('isProctored', e.target.checked)}
                    />
                  }
                  label="Enable Proctoring"
                  sx={{ mb: 2 }}
                />
                
                {testData.isProctored && (
                  <Box sx={{ ml: 3, mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={testData.enableWebcam}
                          onChange={(e) => handleInputChange('enableWebcam', e.target.checked)}
                        />
                      }
                      label="Enable Webcam Monitoring"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={testData.enableScreenCapture}
                          onChange={(e) => handleInputChange('enableScreenCapture', e.target.checked)}
                        />
                      }
                      label="Enable Screen Capture"
                    />
                    
                    <TextField
                      type="number"
                      label="Tab Switch Limit"
                      value={testData.tabSwitchLimit}
                      onChange={(e) => handleInputChange('tabSwitchLimit', Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      sx={{ ml: 2, width: 150 }}
                      helperText="0 = no limit"
                    />
                  </Box>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Test Behavior
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={testData.shuffleQuestions}
                      onChange={(e) => handleInputChange('shuffleQuestions', e.target.checked)}
                    />
                  }
                  label="Shuffle Questions"
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={testData.showResults}
                      onChange={(e) => handleInputChange('showResults', e.target.checked)}
                    />
                  }
                  label="Show Results After Completion"
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Special Instructions"
                  value={testData.instructions || ''}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Enter any special instructions for students..."
                  sx={{ mb: 3 }}
                />
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Add Questions */}
          <Step>
            <StepLabel>Add Questions ({testData.questions.length})</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    Questions (Total: {testData.totalMarks} marks)
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={openAddQuestion}
                  >
                    Add Question
                  </Button>
                </Box>
                
                {testData.questions.length === 0 ? (
                  <Alert severity="info">
                    No questions added yet. Click "Add Question" to start building your test.
                  </Alert>
                ) : (
                  <Box>
                    {testData.questions.map((question, index) => (
                      <Card key={question.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Q{index + 1}. {question.questionText}
                              </Typography>
                              
                              <Box display="flex" gap={1} mb={2}>
                                <Chip
                                  label={getQuestionTypeLabel(question.type)}
                                  size="small"
                                  color="primary"
                                />
                                <Chip
                                  label={`${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}`}
                                  size="small"
                                  color="secondary"
                                />
                                <Chip
                                  label={question.subject}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              
                              {question.type === 'MCQ' && (
                                <Box sx={{ ml: 2 }}>
                                  {question.options.map((option, optIndex) => (
                                    <Typography
                                      key={optIndex}
                                      variant="body2"
                                      sx={{
                                        color: option === question.correctAnswer ? 'success.main' : 'text.secondary',
                                        fontWeight: option === question.correctAnswer ? 'bold' : 'normal'
                                      }}
                                    >
                                      {String.fromCharCode(65 + optIndex)}. {option}
                                      {option === question.correctAnswer && ' ✓'}
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                              
                              {question.type === 'TRUE_FALSE' && (
                                <Typography variant="body2" color="success.main" sx={{ ml: 2 }}>
                                  Correct Answer: {question.correctAnswer} ✓
                                </Typography>
                              )}
                            </Box>
                            
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => openEditQuestion(question)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => deleteQuestion(question.id!)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={testData.questions.length === 0}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Review & Schedule */}
          <Step>
            <StepLabel>Review & Schedule</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Test Summary
                </Typography>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6">{testData.title}</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {testData.description}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                      <Chip label={`${testData.questions.length} Questions`} />
                      <Chip label={`${testData.totalMarks} Total Marks`} />
                      <Chip label={`${testData.duration} Minutes`} />
                      {testData.isProctored && <Chip label="Proctored" color="warning" />}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Scheduled: {new Date(testData.startTime).toLocaleString()} - {new Date(testData.endTime).toLocaleString()}
                    </Typography>
                    
                    {testData.subjects.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="body2" gutterBottom>
                          Subjects: {testData.subjects.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please review all details carefully before scheduling the test. 
                  Once scheduled, students will be able to see and take the test.
                </Alert>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => saveMockTest('DRAFT')}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="contained"
                  onClick={() => saveMockTest('SCHEDULED')}
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Test'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>

      {/* Question Dialog */}
      <Dialog
        open={openQuestionDialog}
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Question Text"
              value={currentQuestion.questionText}
              onChange={(e) => handleQuestionInputChange('questionText', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              required
            />
            
            <Box display="flex" gap={2} mb={3}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={currentQuestion.type}
                  onChange={(e) => handleQuestionInputChange('type', e.target.value)}
                  label="Question Type"
                >
                  <MenuItem value="MCQ">Multiple Choice</MenuItem>
                  <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                  <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
                  <MenuItem value="LONG_ANSWER">Long Answer</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                type="number"
                label="Marks"
                value={currentQuestion.marks}
                onChange={(e) => handleQuestionInputChange('marks', Number(e.target.value))}
                inputProps={{ min: 1 }}
                sx={{ width: 100 }}
              />
              
              <TextField
                label="Subject"
                value={currentQuestion.subject}
                onChange={(e) => handleQuestionInputChange('subject', e.target.value)}
                sx={{ minWidth: 150 }}
                required
              />
            </Box>
            
            {currentQuestion.type === 'MCQ' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Options:
                </Typography>
                {currentQuestion.options.map((option, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2} mb={1}>
                    <Typography sx={{ minWidth: 20 }}>
                      {String.fromCharCode(65 + index)}.
                    </Typography>
                    <TextField
                      fullWidth
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                    <Radio
                      checked={currentQuestion.correctAnswer === option}
                      onChange={() => handleQuestionInputChange('correctAnswer', option)}
                      disabled={!option}
                    />
                    {currentQuestion.options.length > 2 && (
                      <IconButton
                        size="small"
                        onClick={() => removeOption(index)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={addOption}
                >
                  Add Option
                </Button>
              </Box>
            )}
            
            {currentQuestion.type === 'TRUE_FALSE' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Correct Answer:
                </Typography>
                <RadioGroup
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => handleQuestionInputChange('correctAnswer', e.target.value)}
                  row
                >
                  <FormControlLabel value="True" control={<Radio />} label="True" />
                  <FormControlLabel value="False" control={<Radio />} label="False" />
                </RadioGroup>
              </Box>
            )}
            
            {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'LONG_ANSWER') && (
              <TextField
                fullWidth
                label="Sample/Expected Answer"
                value={currentQuestion.correctAnswer}
                onChange={(e) => handleQuestionInputChange('correctAnswer', e.target.value)}
                multiline
                rows={currentQuestion.type === 'LONG_ANSWER' ? 4 : 2}
                sx={{ mb: 3 }}
                helperText="This will help in grading (not shown to students)"
              />
            )}
            
            <TextField
              fullWidth
              label="Explanation (Optional)"
              value={currentQuestion.explanation || ''}
              onChange={(e) => handleQuestionInputChange('explanation', e.target.value)}
              multiline
              rows={2}
              helperText="Shown to students after test completion (if enabled)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={saveQuestion}
            variant="contained"
          >
            {editingQuestion ? 'Update Question' : 'Add Question'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MockTestCreate;