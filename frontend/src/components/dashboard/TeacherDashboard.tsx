import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Chip,
  Avatar,
  LinearProgress
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  Assignment as AssignmentIcon,
  VideoLibrary as VideoIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CloudUpload as UploadIcon,
  PlayCircle as PlayIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import batchService from '../../services/batchService';
import assignmentService from '../../services/assignmentService';
import lectureService from '../../services/lectureService';
import studyMaterialService from '../../services/studyMaterialService';

interface DashboardStats {
  totalBatches: number;
  totalStudents: number;
  activeAssignments: number;
  todaysLectures: number;
  pendingSubmissions: number;
  uploadedMaterials: number;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    totalStudents: 0,
    activeAssignments: 0,
    todaysLectures: 0,
    pendingSubmissions: 0,
    uploadedMaterials: 0
  });
  const [myBatches, setMyBatches] = useState<any[]>([]);
  const [todaysLectures, setTodaysLectures] = useState<any[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher's batches
      const batches = await batchService.getMyBatches();
      setMyBatches(batches);
      
      // Fetch today's lectures
      const lectures = await lectureService.getTodaysLectures();
      setTodaysLectures(lectures);
      
      // Fetch recent assignments
      const assignments = await assignmentService.getAllAssignments();
      setRecentAssignments(assignments.slice(0, 5));
      
      // Calculate stats
      let totalStudents = 0;
      for (const batch of batches) {
        try {
          const students = await batchService.getBatchStudents(batch.id);
          totalStudents += students.length;
        } catch {
          totalStudents += 0;
        }
      }
      
      // Fetch pending submissions and materials count from API
      let pendingSubmissions = 0;
      let uploadedMaterials = 0;
      
      try {
        // These would need to be implemented in the backend
        const materials = await studyMaterialService.getMyMaterials();
        uploadedMaterials = materials.length;
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
      
      setStats({
        totalBatches: batches.length,
        totalStudents,
        activeAssignments: assignments.filter((a: any) => a.status === 'ACTIVE').length,
        todaysLectures: lectures.length,
        pendingSubmissions,
        uploadedMaterials
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty state instead of mock data
      setMyBatches([]);
      setTodaysLectures([]);
      setRecentAssignments([]);
      setStats({
        totalBatches: 0,
        totalStudents: 0,
        activeAssignments: 0,
        todaysLectures: 0,
        pendingSubmissions: 0,
        uploadedMaterials: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.fullName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening in your classes today
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Batches"
            value={stats.totalBatches}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Assignments"
            value={stats.activeAssignments}
            icon={<AssignmentIcon />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Lectures"
            value={stats.todaysLectures}
            icon={<VideoIcon />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Today's Lectures</Typography>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/lectures/schedule')}
              >
                Schedule
              </Button>
            </Box>
            <List>
              {todaysLectures.length > 0 ? (
                todaysLectures.map((lecture, index) => (
                  <React.Fragment key={lecture.id}>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={lecture.title}
                        secondary={`${lecture.batchName} • ${lecture.startTime || 'Time TBD'}`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayIcon />}
                        onClick={() => navigate(`/lectures/${lecture.id}/start`)}
                      >
                        Start
                      </Button>
                    </ListItem>
                    {index < todaysLectures.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No lectures scheduled for today"
                    secondary="Click Schedule to add a new lecture"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Assignments</Typography>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/assignments/create')}
              >
                Create
              </Button>
            </Box>
            <List>
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                      />
                      <Chip
                        label={assignment.status}
                        size="small"
                        color={assignment.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </ListItem>
                    {index < recentAssignments.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No assignments created yet"
                    secondary="Click Create to add a new assignment"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VideoIcon />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/lectures/start')}
                >
                  Start Lecture
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/assignments/create')}
                >
                  Create Assignment
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/materials/upload')}
                >
                  Upload Material
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/reports')}
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* My Batches */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Batches
            </Typography>
            <Grid container spacing={2}>
              {myBatches.map((batch) => (
                <Grid item xs={12} sm={6} md={4} key={batch.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {batch.batchName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Code: {batch.batchCode}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {batch.studentCount || 0} Students
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mt={1}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Started: {new Date(batch.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Button 
                          size="small" 
                          fullWidth 
                          variant="contained"
                          onClick={() => navigate(`/batches/${batch.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard;