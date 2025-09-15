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
  Badge,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle,
  Pending,
  AssignmentTurnedIn,
  Group,
  Quiz,
  FactCheck,
  EventAvailable,
  RateReview,
  School,
  Timer,
  Assessment
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  assignedBatches: number;
  pendingReviews: number;
  todayAttendance: number;
  upcomingTests: number;
  totalStudents: number;
  assignmentsToReview: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const JuniorEducatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    assignedBatches: 2,
    pendingReviews: 8,
    todayAttendance: 0,
    upcomingTests: 3,
    totalStudents: 45,
    assignmentsToReview: 12
  });

  const [assignedBatches] = useState([
    { id: 1, name: 'Mathematics Batch A', students: 25, nextClass: '2:00 PM' },
    { id: 2, name: 'Physics Batch B', students: 20, nextClass: '4:00 PM' }
  ]);

  const [pendingAssignments] = useState([
    { id: 1, studentName: 'John Doe', title: 'Calculus Problem Set 1', submittedAt: '2 hours ago', batchName: 'Mathematics Batch A' },
    { id: 2, studentName: 'Jane Smith', title: 'Physics Lab Report', submittedAt: '3 hours ago', batchName: 'Physics Batch B' },
    { id: 3, studentName: 'Mike Johnson', title: 'Algebra Worksheet', submittedAt: '5 hours ago', batchName: 'Mathematics Batch A' },
    { id: 4, studentName: 'Sarah Williams', title: 'Quantum Mechanics Essay', submittedAt: '1 day ago', batchName: 'Physics Batch B' }
  ]);

  const [upcomingMockTests] = useState([
    { id: 1, title: 'Mathematics Mid-term Mock', date: '2024-02-15', time: '10:00 AM', duration: '2 hours', students: 45 },
    { id: 2, title: 'Physics Chapter Test', date: '2024-02-18', time: '2:00 PM', duration: '1 hour', students: 20 },
    { id: 3, title: 'Combined Science Mock', date: '2024-02-20', time: '11:00 AM', duration: '3 hours', students: 65 }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const StatCard = ({ title, value, icon, color, onClick }: any) => (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Junior Educator Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back, {user?.fullName}! Manage attendance and review assignments.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Assigned Batches"
            value={stats.assignedBatches}
            icon={<Group />}
            color="#1976d2"
            onClick={() => navigate('/batches')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Reviews"
            value={stats.pendingReviews}
            icon={<RateReview />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Today's Attendance"
            value={`${stats.todayAttendance}/${stats.totalStudents}`}
            icon={<FactCheck />}
            color="#388e3c"
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Attendance" icon={<EventAvailable />} iconPosition="start" />
          <Tab label="Assignment Review" icon={<AssignmentTurnedIn />} iconPosition="start" />
          <Tab label="Mock Tests" icon={<Quiz />} iconPosition="start" />
          <Tab label="My Batches" icon={<School />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Attendance Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select a batch to take attendance for today's classes
            </Alert>
          </Grid>
          {assignedBatches.map((batch) => (
            <Grid item xs={12} md={6} key={batch.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {batch.name}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {batch.students} Students
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Next Class: {batch.nextClass}
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<FactCheck />}
                    onClick={() => navigate(`/attendance/batch/${batch.id}`)}
                  >
                    Take Attendance
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Assignment Review Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Pending Assignment Reviews
        </Typography>
        <List>
          {pendingAssignments.map((assignment, index) => (
            <React.Fragment key={assignment.id}>
              <ListItem>
                <ListItemIcon>
                  <Badge badgeContent="NEW" color="error">
                    <AssignmentIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">{assignment.title}</Typography>
                      <Chip label={assignment.batchName} size="small" color="primary" />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Submitted by: <strong>{assignment.studentName}</strong>
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {assignment.submittedAt}
                      </Typography>
                    </Box>
                  }
                />
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => navigate(`/assignments/review/${assignment.id}`)}
                  >
                    Review
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/assignments/view/${assignment.id}`)}
                  >
                    View
                  </Button>
                </Box>
              </ListItem>
              {index < pendingAssignments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        {pendingAssignments.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No pending assignments to review
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Mock Tests Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Upcoming Mock Tests
          </Typography>
          <Button
            variant="contained"
            startIcon={<Quiz />}
            onClick={() => navigate('/mock-tests/create')}
          >
            Create Mock Test
          </Button>
        </Box>
        <Grid container spacing={3}>
          {upcomingMockTests.map((test) => (
            <Grid item xs={12} md={6} lg={4} key={test.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {test.title}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {test.date} at {test.time}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Timer fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Duration: {test.duration}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {test.students} Students enrolled
                    </Typography>
                  </Box>
                  <Chip 
                    label="Proctoring Enabled" 
                    color="success" 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={1}>
                    <Button size="small" variant="outlined" fullWidth>
                      Edit
                    </Button>
                    <Button size="small" variant="contained" fullWidth>
                      Monitor
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* My Batches Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          My Assigned Batches
        </Typography>
        <Grid container spacing={3}>
          {assignedBatches.map((batch) => (
            <Grid item xs={12} md={6} key={batch.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6">
                      {batch.name}
                    </Typography>
                    <Chip label="ACTIVE" color="success" size="small" />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {batch.students} Students enrolled
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={3}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Next Class: Today at {batch.nextClass}
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<FactCheck />}
                        onClick={() => navigate(`/attendance/batch/${batch.id}`)}
                      >
                        Attendance
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<AssignmentIcon />}
                        onClick={() => navigate(`/batches/${batch.id}/assignments`)}
                      >
                        Assignments
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<PeopleIcon />}
                        onClick={() => navigate(`/batches/${batch.id}/students`)}
                      >
                        Students
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<Assessment />}
                        onClick={() => navigate(`/batches/${batch.id}/reports`)}
                      >
                        Reports
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FactCheck />}
              sx={{ py: 2 }}
              onClick={() => navigate('/attendance')}
            >
              Take Attendance
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RateReview />}
              sx={{ py: 2 }}
              onClick={() => setTabValue(1)}
            >
              Review Assignments
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Quiz />}
              sx={{ py: 2 }}
              onClick={() => navigate('/mock-tests/create')}
            >
              Create Mock Test
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Group />}
              sx={{ py: 2 }}
              onClick={() => navigate('/batches/create')}
            >
              Create Batch
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default JuniorEducatorDashboard;