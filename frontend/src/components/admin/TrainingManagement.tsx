import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Schedule,
  Person,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  AccessTime,
  School,
  Assignment,
  PlayCircle,
  Book,
  Quiz,
  Assessment,
  CalendarToday,
  Group,
  ExpandMore,
  Timeline as TimelineIcon,
  Task,
  VideoLibrary,
  Description,
  TrendingUp
} from '@mui/icons-material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  role: 'TEACHER' | 'JUNIOR_EDUCATOR';
  subjectExpertise?: string;
  trainingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  currentTraining?: TrainingSchedule;
  completedTrainings: number;
  totalTrainings: number;
  trainingScore?: number;
}

interface TrainingSchedule {
  id?: number;
  teacherId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  modules: TrainingModule[];
  assignedBy: string;
  completionPercentage: number;
  estimatedHours: number;
  actualHours?: number;
}

interface TrainingModule {
  id: number;
  title: string;
  description: string;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'ASSIGNMENT' | 'LIVE_SESSION';
  duration: number; // in minutes
  order: number;
  resourceUrl?: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TrainingManagement: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [trainings, setTrainings] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingSchedule | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    teacherId: 0,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM' as const,
    estimatedHours: 0,
    modules: [] as TrainingModule[]
  });

  useEffect(() => {
    fetchTeachers();
    fetchTrainings();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const teacherUsers = response.data
        .filter((user: any) => user.role === 'TEACHER' || user.role === 'JUNIOR_EDUCATOR')
        .map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          subjectExpertise: user.subjectExpertise,
          trainingStatus: 'NOT_STARTED' as const,
          completedTrainings: 0,
          totalTrainings: 0
        }));
      
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Mock data for development
      setTeachers([
        {
          id: 1,
          fullName: 'John Teacher',
          email: 'john@teacher.com',
          role: 'TEACHER',
          subjectExpertise: 'Mathematics',
          trainingStatus: 'IN_PROGRESS',
          completedTrainings: 2,
          totalTrainings: 5,
          trainingScore: 85
        },
        {
          id: 2,
          fullName: 'Jane Educator',
          email: 'jane@educator.com',
          role: 'JUNIOR_EDUCATOR',
          subjectExpertise: 'Physics',
          trainingStatus: 'NOT_STARTED',
          completedTrainings: 0,
          totalTrainings: 3
        }
      ]);
    }
  };

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      // In real implementation, fetch from backend
      const mockTrainings: TrainingSchedule[] = [
        {
          id: 1,
          teacherId: 1,
          title: 'Advanced Teaching Methods',
          description: 'Learn modern teaching techniques and classroom management',
          startDate: '2024-12-01',
          endDate: '2024-12-15',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          modules: [
            {
              id: 1,
              title: 'Introduction to Modern Teaching',
              description: 'Overview of contemporary teaching methods',
              type: 'VIDEO',
              duration: 60,
              order: 1,
              resourceUrl: '/training/video1.mp4',
              isCompleted: true,
              completedAt: '2024-12-05T10:00:00Z',
              score: 90
            },
            {
              id: 2,
              title: 'Classroom Management Quiz',
              description: 'Test your understanding of classroom management',
              type: 'QUIZ',
              duration: 30,
              order: 2,
              isCompleted: false
            }
          ],
          assignedBy: 'Admin User',
          completionPercentage: 50,
          estimatedHours: 20
        }
      ];
      setTrainings(mockTrainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrainingDialog = (teacher: Teacher | null = null) => {
    setSelectedTeacher(teacher);
    if (teacher) {
      setFormData({
        teacherId: teacher.id,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'MEDIUM',
        estimatedHours: 0,
        modules: []
      });
    } else {
      setFormData({
        teacherId: 0,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'MEDIUM',
        estimatedHours: 0,
        modules: []
      });
    }
    setOpenTrainingDialog(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTrainingModule = () => {
    const newModule: TrainingModule = {
      id: Date.now(),
      title: '',
      description: '',
      type: 'VIDEO',
      duration: 30,
      order: formData.modules.length + 1,
      isCompleted: false
    };
    
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (moduleId: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (moduleId: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const handleSaveTraining = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const trainingData: TrainingSchedule = {
        ...formData,
        status: 'SCHEDULED',
        assignedBy: user?.fullName || 'Admin',
        completionPercentage: 0
      };

      // In real implementation, save to backend
      setTrainings(prev => [...prev, { ...trainingData, id: Date.now() }]);
      
      // Update teacher's training status
      setTeachers(prev =>
        prev.map(teacher =>
          teacher.id === formData.teacherId
            ? { ...teacher, trainingStatus: 'NOT_STARTED' as const, totalTrainings: teacher.totalTrainings + 1 }
            : teacher
        )
      );

      setOpenTrainingDialog(false);
    } catch (error) {
      console.error('Error saving training:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'default';
      case 'SCHEDULED': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getTimelineDotColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'grey';
      case 'SCHEDULED': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'grey';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'info';
      case 'MEDIUM': return 'primary';
      case 'HIGH': return 'warning';
      case 'URGENT': return 'error';
      default: return 'default';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <VideoLibrary />;
      case 'DOCUMENT': return <Description />;
      case 'QUIZ': return <Quiz />;
      case 'ASSIGNMENT': return <Assignment />;
      case 'LIVE_SESSION': return <School />;
      default: return <Book />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Training Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenTrainingDialog()}
        >
          Schedule Training
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box display="flex" gap={3} mb={4}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{teachers.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Educators
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {teachers.filter(t => t.trainingStatus === 'IN_PROGRESS').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Training
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {teachers.filter(t => t.trainingStatus === 'COMPLETED').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{trainings.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Active Trainings
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Teachers Overview" />
          <Tab label="Training Programs" />
          <Tab label="Progress Tracking" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell align="center">Training Status</TableCell>
                  <TableCell align="center">Progress</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {teacher.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {teacher.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {teacher.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={teacher.role === 'TEACHER' ? 'Teacher' : 'Junior Educator'}
                        size="small"
                        color={teacher.role === 'TEACHER' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{teacher.subjectExpertise || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={teacher.trainingStatus.replace('_', ' ')}
                        color={getStatusColor(teacher.trainingStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {teacher.completedTrainings}/{teacher.totalTrainings}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={teacher.totalTrainings ? (teacher.completedTrainings / teacher.totalTrainings) * 100 : 0}
                        sx={{ mt: 1, width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {teacher.trainingScore ? (
                        <Typography
                          variant="body2"
                          color={teacher.trainingScore >= 80 ? 'success.main' : teacher.trainingScore >= 60 ? 'warning.main' : 'error.main'}
                        >
                          {teacher.trainingScore}%
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Schedule />}
                        onClick={() => handleOpenTrainingDialog(teacher)}
                      >
                        Assign Training
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box>
          {trainings.map((training) => {
            const teacher = teachers.find(t => t.id === training.teacherId);
            return (
              <Card key={training.id} sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6">{training.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Assigned to: {teacher?.fullName}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {training.description}
                      </Typography>
                      <Box display="flex" gap={2} alignItems="center">
                        <Chip
                          label={training.status}
                          color={getStatusColor(training.status)}
                          size="small"
                        />
                        <Chip
                          label={training.priority}
                          color={getPriorityColor(training.priority)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(training.startDate)} - {formatDate(training.endDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        {training.completionPercentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={training.completionPercentage}
                        sx={{ mt: 1, width: 100 }}
                      />
                    </Box>
                  </Box>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">
                        Training Modules ({training.modules.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {training.modules.map((module) => (
                          <ListItem key={module.id}>
                            <ListItemIcon>
                              {getModuleIcon(module.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={module.title}
                              secondary={`${module.duration} min • ${module.type}`}
                            />
                            <ListItemSecondaryAction>
                              {module.isCompleted ? (
                                <CheckCircle color="success" />
                              ) : (
                                <AccessTime color="disabled" />
                              )}
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Training Progress Timeline
        </Typography>
        
        <Timeline>
          {trainings.map((training) => {
            const teacher = teachers.find(t => t.id === training.teacherId);
            return (
              <TimelineItem key={training.id}>
                <TimelineOppositeContent color="text.secondary">
                  {formatDate(training.startDate)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getTimelineDotColor(training.status)}>
                    <TimelineIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{training.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teacher?.fullName} • {training.status}
                    </Typography>
                    <Box mt={1}>
                      <LinearProgress
                        variant="determinate"
                        value={training.completionPercentage}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2">
                        {training.completionPercentage}% Complete
                      </Typography>
                    </Box>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </TabPanel>

      {/* Training Assignment Dialog */}
      <Dialog
        open={openTrainingDialog}
        onClose={() => setOpenTrainingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Schedule Training {selectedTeacher ? `for ${selectedTeacher.fullName}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {!selectedTeacher && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Teacher</InputLabel>
                <Select
                  value={formData.teacherId}
                  onChange={(e) => handleInputChange('teacherId', Number(e.target.value))}
                  label="Select Teacher"
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <TextField
              fullWidth
              label="Training Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            
            <Box display="flex" gap={2} mb={3}>
              <TextField
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            
            <Box display="flex" gap={2} mb={3}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                type="number"
                label="Estimated Hours"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', Number(e.target.value))}
                sx={{ minWidth: 150 }}
              />
            </Box>
            
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">Training Modules</Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={addTrainingModule}
                >
                  Add Module
                </Button>
              </Box>
              
              {formData.modules.map((module, index) => (
                <Card key={module.id} sx={{ mb: 2 }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box display="flex" justifyContent="between" gap={2} mb={2}>
                      <TextField
                        label="Module Title"
                        value={module.title}
                        onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={module.type}
                          onChange={(e) => updateModule(module.id, 'type', e.target.value)}
                          label="Type"
                        >
                          <MenuItem value="VIDEO">Video</MenuItem>
                          <MenuItem value="DOCUMENT">Document</MenuItem>
                          <MenuItem value="QUIZ">Quiz</MenuItem>
                          <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
                          <MenuItem value="LIVE_SESSION">Live Session</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        type="number"
                        label="Duration (min)"
                        value={module.duration}
                        onChange={(e) => updateModule(module.id, 'duration', Number(e.target.value))}
                        size="small"
                        sx={{ width: 120 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeModule(module.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      label="Description"
                      value={module.description}
                      onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                      size="small"
                      multiline
                      rows={2}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainingDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTraining}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Schedule Training'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrainingManagement;