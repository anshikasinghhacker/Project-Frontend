import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Tabs,
  Tab,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Divider,
  Alert,
  LinearProgress,
  Badge,
  Tooltip
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AssignmentInd,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Group,
  PersonAdd,
  Assignment as AssignmentIcon,
  CalendarToday,
  Timer
} from '@mui/icons-material';
import batchService, { Batch } from '../../services/batchService';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  role: 'TEACHER' | 'JUNIOR_EDUCATOR';
  subjects: string[];
  assignedBatches: number[];
  trainingStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  trainingSchedule?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  batchId?: number;
  enrollmentDate: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`batch-tabpanel-${index}`}
      aria-labelledby={`batch-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedBatchManagement: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [assignTabValue, setAssignTabValue] = useState(0);
  const [formData, setFormData] = useState<any>({
    batchName: '',
    batchCode: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
    maxStudents: 30,
    assignedTeachers: [],
    assignedJuniorEducators: [],
    assignedStudents: []
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [trainingData, setTrainingData] = useState({
    schedule: '',
    description: '',
    duration: '',
    topics: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      await Promise.all([
        fetchBatches(),
        fetchTeachers(),
        fetchStudents()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await batchService.getAllBatches();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
      // Only use mock data if the backend is not available
      if (process.env.NODE_ENV === 'development') {
        const mockBatches = [
          { 
            id: 1, 
            batchName: 'Mathematics Batch A', 
            batchCode: 'MATH-A', 
            status: 'ACTIVE',
            startDate: '2024-01-01',
            studentCount: 25,
            assignedTeachers: [1],
            assignedJuniorEducators: [3],
            teacherNames: ['John Teacher'],
            juniorEducatorNames: ['Jane Junior']
          },
          { 
            id: 2, 
            batchName: 'Physics Batch B', 
            batchCode: 'PHY-B', 
            status: 'ACTIVE',
            startDate: '2024-01-15',
            studentCount: 30,
            assignedTeachers: [2],
            assignedJuniorEducators: [],
            teacherNames: ['Sarah Teacher'],
            juniorEducatorNames: []
          }
        ];
        setBatches(mockBatches);
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = response.data;
      const teachersAndEducators = users
        .filter((user: any) => user.role === 'TEACHER' || user.role === 'JUNIOR_EDUCATOR')
        .map((user: any) => ({
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          subjects: user.subjectExpertise ? [user.subjectExpertise] : [],
          assignedBatches: [], // Will be populated from batch data
          trainingStatus: 'PENDING' as const,
          trainingSchedule: ''
        }));
      
      setTeachers(teachersAndEducators);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Fallback to mock data if API fails
      const mockTeachers: Teacher[] = [
        {
          id: 1,
          name: 'John Teacher',
          email: 'john.teacher@test.com',
          role: 'TEACHER',
          subjects: ['Mathematics', 'Physics'],
          assignedBatches: [1],
          trainingStatus: 'COMPLETED',
          trainingSchedule: '2024-01-01 to 2024-01-05'
        }
      ];
      setTeachers(mockTeachers);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = response.data;
      const studentUsers = users
        .filter((user: any) => user.role === 'STUDENT')
        .map((user: any) => ({
          id: user.id,
          name: user.fullName,
          email: user.email,
          batchId: user.batchId || undefined,
          enrollmentDate: new Date().toISOString().split('T')[0] // Default to today
        }));
      
      setStudents(studentUsers);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to mock data if API fails
      const mockStudents: Student[] = [
        { id: 4, name: 'Student Four', email: 'student4@test.com', batchId: undefined, enrollmentDate: '2024-01-20' },
        { id: 5, name: 'Student Five', email: 'student5@test.com', batchId: undefined, enrollmentDate: '2024-01-21' }
      ];
      setStudents(mockStudents);
    }
  };

  const handleOpenDialog = (batch: any = null) => {
    if (batch) {
      setSelectedBatch(batch);
      setFormData({
        ...batch,
        assignedTeachers: batch.assignedTeachers || [],
        assignedJuniorEducators: batch.assignedJuniorEducators || [],
        assignedStudents: batch.assignedStudents || []
      });
    } else {
      setSelectedBatch(null);
      setFormData({
        batchName: '',
        batchCode: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'UPCOMING',
        maxStudents: 30,
        assignedTeachers: [],
        assignedJuniorEducators: [],
        assignedStudents: []
      });
    }
    setOpenDialog(true);
  };

  const handleOpenAssignDialog = (batch: any) => {
    setSelectedBatch(batch);
    setSelectedUsers([]);
    setOpenAssignDialog(true);
  };

  const handleOpenTrainingDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTrainingData({
      schedule: teacher.trainingSchedule || '',
      description: '',
      duration: '',
      topics: ''
    });
    setOpenTrainingDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (selectedBatch) {
        // Update batch via API
        await batchService.updateBatch(selectedBatch.id, formData);
      } else {
        // Create new batch via API
        await batchService.createBatch(formData);
      }
      // Refresh batch list from backend
      await fetchBatches();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Failed to save batch. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUsers = async () => {
    if (selectedBatch && selectedUsers.length > 0) {
      try {
        setLoading(true);
        
        if (assignTabValue === 0) {
          // Assign teachers
          for (const teacherId of selectedUsers) {
            const teacher = teachers.find(t => t.id === teacherId && t.role === 'TEACHER');
            if (teacher) {
              await batchService.assignTeacher(selectedBatch.id, teacherId);
            }
          }
        } else if (assignTabValue === 1) {
          // Assign junior educators
          for (const educatorId of selectedUsers) {
            const educator = teachers.find(t => t.id === educatorId && t.role === 'JUNIOR_EDUCATOR');
            if (educator) {
              await batchService.assignJuniorEducator(selectedBatch.id, educatorId);
            }
          }
        } else {
          // Assign students
          for (const studentId of selectedUsers) {
            await batchService.addStudent(selectedBatch.id, studentId);
            // Update the student's batchId in local state
            const studentIndex = students.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
              const updatedStudents = [...students];
              updatedStudents[studentIndex].batchId = selectedBatch.id;
              setStudents(updatedStudents);
            }
          }
        }
        
        // Refresh batch data from backend
        await fetchBatches();
        setOpenAssignDialog(false);
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error assigning users to batch:', error);
        alert('Failed to assign users to batch. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignTraining = () => {
    if (selectedTeacher) {
      const updatedTeacher = {
        ...selectedTeacher,
        trainingStatus: 'IN_PROGRESS' as const,
        trainingSchedule: trainingData.schedule
      };
      
      const index = teachers.findIndex(t => t.id === selectedTeacher.id);
      const newTeachers = [...teachers];
      newTeachers[index] = updatedTeacher;
      setTeachers(newTeachers);
      setOpenTrainingDialog(false);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      setBatches(batches.filter(b => b.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'default';
      case 'UPCOMING': return 'info';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  const getTrainingStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'PENDING': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Enhanced Batch Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Create New Batch
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Batches
                  </Typography>
                  <Typography variant="h4">
                    {batches.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4">
                    {teachers.filter(t => t.role === 'TEACHER').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Junior Educators
                  </Typography>
                  <Typography variant="h4">
                    {teachers.filter(t => t.role === 'JUNIOR_EDUCATOR').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <AssignmentInd />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {students.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <Group />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Batches" />
          <Tab label="Teachers & Training" />
          <Tab label="Unassigned Students" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {batches.map((batch) => (
            <Grid item xs={12} md={6} lg={4} key={batch.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h6" gutterBottom>
                      {batch.batchName}
                    </Typography>
                    <Chip 
                      label={batch.status} 
                      color={getStatusColor(batch.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Code: {batch.batchCode}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Assigned Teachers:
                    </Typography>
                    {batch.teacherNames?.length > 0 ? (
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {batch.teacherNames.map((name: string, index: number) => (
                          <Chip key={index} label={name} size="small" color="primary" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No teachers assigned
                      </Typography>
                    )}
                  </Box>

                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Junior Educators:
                    </Typography>
                    {batch.juniorEducatorNames?.length > 0 ? (
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {batch.juniorEducatorNames.map((name: string, index: number) => (
                          <Chip key={index} label={name} size="small" color="secondary" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No junior educators assigned
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {batch.studentCount || 0} Students
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      onClick={() => handleOpenAssignDialog(batch)}
                    >
                      Assign
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(batch)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteBatch(batch.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell>Assigned Batches</TableCell>
                <TableCell>Training Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={teacher.role === 'TEACHER' ? 'Teacher' : 'Junior Educator'}
                      size="small"
                      color={teacher.role === 'TEACHER' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{teacher.subjects.join(', ')}</TableCell>
                  <TableCell>{teacher.assignedBatches.length}</TableCell>
                  <TableCell>
                    <Chip
                      label={teacher.trainingStatus || 'PENDING'}
                      size="small"
                      color={getTrainingStatusColor(teacher.trainingStatus) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
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
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <List>
          {students.filter(s => !s.batchId).map((student) => (
            <React.Fragment key={student.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={student.name}
                  secondary={`${student.email} • Enrolled: ${student.enrollmentDate}`}
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                    <Select
                      value=""
                      onChange={async (e) => {
                        const batchId = Number(e.target.value);
                        if (batchId) {
                          try {
                            await batchService.addStudent(batchId, student.id);
                            // Update local state
                            const updatedStudents = [...students];
                            const index = students.findIndex(s => s.id === student.id);
                            updatedStudents[index].batchId = batchId;
                            setStudents(updatedStudents);
                            await fetchBatches();
                          } catch (error) {
                            console.error('Error assigning student:', error);
                            alert('Failed to assign student to batch');
                          }
                        }
                      }}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Select Batch</em>
                      </MenuItem>
                      {batches.map((batch) => (
                        <MenuItem key={batch.id} value={batch.id}>
                          {batch.batchName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      {/* Create/Edit Batch Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBatch ? 'Edit Batch' : 'Create New Batch'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Batch Name"
                name="batchName"
                value={formData.batchName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Code"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData((prev: any) => ({...prev, status: e.target.value}))}
                  label="Status"
                >
                  <MenuItem value="UPCOMING">Upcoming</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedBatch ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign to {selectedBatch?.batchName}
        </DialogTitle>
        <DialogContent>
          <Tabs value={assignTabValue} onChange={(e, newValue) => setAssignTabValue(newValue)}>
            <Tab label="Teachers" />
            <Tab label="Junior Educators" />
            <Tab label="Students" />
          </Tabs>
          
          <List sx={{ mt: 2 }}>
            {assignTabValue === 0 && teachers
              .filter(t => t.role === 'TEACHER' && !selectedBatch?.assignedTeachers?.includes(t.id))
              .map((teacher) => (
                <ListItem key={teacher.id}>
                  <Checkbox
                    checked={selectedUsers.includes(teacher.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, teacher.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== teacher.id));
                      }
                    }}
                  />
                  <ListItemText primary={teacher.name} secondary={teacher.subjects.join(', ')} />
                </ListItem>
              ))}
            
            {assignTabValue === 1 && teachers
              .filter(t => t.role === 'JUNIOR_EDUCATOR' && !selectedBatch?.assignedJuniorEducators?.includes(t.id))
              .map((teacher) => (
                <ListItem key={teacher.id}>
                  <Checkbox
                    checked={selectedUsers.includes(teacher.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, teacher.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== teacher.id));
                      }
                    }}
                  />
                  <ListItemText primary={teacher.name} secondary={teacher.subjects.join(', ')} />
                </ListItem>
              ))}
            
            {assignTabValue === 2 && students
              .filter(s => !s.batchId)
              .map((student) => (
                <ListItem key={student.id}>
                  <Checkbox
                    checked={selectedUsers.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, student.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== student.id));
                      }
                    }}
                  />
                  <ListItemText primary={student.name} secondary={student.email} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignUsers} variant="contained" color="primary">
            Assign Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Training Assignment Dialog */}
      <Dialog open={openTrainingDialog} onClose={() => setOpenTrainingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Training Schedule for {selectedTeacher?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Training Schedule"
                value={trainingData.schedule}
                onChange={(e) => setTrainingData({...trainingData, schedule: e.target.value})}
                placeholder="e.g., 2024-02-01 to 2024-02-10"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Training Topics"
                value={trainingData.topics}
                onChange={(e) => setTrainingData({...trainingData, topics: e.target.value})}
                multiline
                rows={3}
                placeholder="List the topics to be covered..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration"
                value={trainingData.duration}
                onChange={(e) => setTrainingData({...trainingData, duration: e.target.value})}
                placeholder="e.g., 5 days, 40 hours"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Once assigned, the teacher will be notified about their training schedule and can track their progress.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainingDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignTraining} variant="contained" color="primary">
            Assign Training
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnhancedBatchManagement;