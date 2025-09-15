import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  School,
  Quiz,
  Schedule,
  Assessment,
  Group,
  CalendarToday,
  PlayCircle,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import educatorService from '../../services/educatorService';

interface EducatorStats {
  totalBatches: number;
  totalStudents: number;
  totalQuizzes: number;
  totalSchedules: number;
  completedSessions: number;
  upcomingSessions: number;
}

interface EducatorSchedule {
  id: number;
  title: string;
  batchName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

const EducatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<EducatorStats>({
    totalBatches: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalSchedules: 0,
    completedSessions: 0,
    upcomingSessions: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState<EducatorSchedule[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, scheduleData, activitiesData] = await Promise.all([
        educatorService.getEducatorStats(),
        educatorService.getTodaySchedule(),
        educatorService.getRecentActivities(),
      ]);

      setStats(statsData);
      setTodaySchedule(scheduleData);
      setRecentActivities(activitiesData.slice(0, 5)); // Show only 5 recent activities
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'My Batches',
      value: stats.totalBatches,
      icon: <Group sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Created Quizzes',
      value: stats.totalQuizzes,
      icon: <Quiz sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Total Schedules',
      value: stats.totalSchedules,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: <CalendarToday sx={{ fontSize: 40 }} />,
      color: '#f44336',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => fetchDashboardData()}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your teaching schedule, create quizzes, and track student progress.
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {statCards.map((card, index) => (
          <Box
            key={index}
            sx={{
              flex: '1 1 calc(33.333% - 16px)',
              minWidth: '200px',
              '@media (max-width: 900px)': {
                flex: '1 1 calc(50% - 16px)',
              },
              '@media (max-width: 600px)': {
                flex: '1 1 100%',
              },
            }}
          >
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                borderTop: `3px solid ${card.color}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" component="div">
                    {card.value}
                  </Typography>
                  <Typography variant="subtitle1" color="text.primary">
                    {card.title}
                  </Typography>
                </Box>
                <Box sx={{ color: card.color }}>
                  {card.icon}
                </Box>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Today's Schedule */}
        <Box sx={{ flex: '1 1 60%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Today's Schedule</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => navigate('/schedules/create')}
              >
                Create Schedule
              </Button>
            </Box>
            <List>
              {todaySchedule.length > 0 ? (
                todaySchedule.map((schedule, index) => (
                  <React.Fragment key={schedule.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary={schedule.title}
                        secondary={`${schedule.batchName} • ${schedule.startTime} - ${schedule.endTime}`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayCircle />}
                        onClick={() => navigate(`/schedules/${schedule.id}/start`)}
                      >
                        Start
                      </Button>
                    </ListItem>
                    {index < todaySchedule.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No schedules for today"
                    secondary="Click 'Create Schedule' to add a new session"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>

        {/* Recent Activities */}
        <Box sx={{ flex: '1 1 35%', minWidth: '250px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={activity.type}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activities"
                    secondary="Your recent activities will appear here"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Quiz />}
              onClick={() => navigate('/quizzes/create')}
            >
              Create Quiz
            </Button>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate('/schedules')}
            >
              Manage Schedules
            </Button>
            <Button
              variant="outlined"
              startIcon={<Group />}
              onClick={() => navigate('/batches')}
            >
              View Batches
            </Button>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => navigate('/reports')}
            >
              View Reports
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default EducatorDashboard;