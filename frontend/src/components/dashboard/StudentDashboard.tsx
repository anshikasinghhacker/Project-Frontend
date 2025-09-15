import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School,
  Assignment,
  Quiz,
  TrendingUp,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import studentService from '../../services/studentService';

interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  upcomingSchedules: number;
  averageScore: number;
}

interface Activity {
  id: number;
  title: string;
  score: number;
  date: string;
  type: string;
}

interface Schedule {
  id: number;
  subject: string;
  time: string;
  educator: string;
  batchId: number;
}

interface SubjectProgress {
  subject: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    completedQuizzes: 0,
    upcomingSchedules: 0,
    averageScore: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activitiesData, schedulesData, progressData] = await Promise.all([
        studentService.getStudentStats(),
        studentService.getRecentActivities(),
        studentService.getUpcomingSchedules(),
        studentService.getLearningProgress()
      ]);

      setStats(statsData);
      setActivities(activitiesData.slice(0, 3)); // Show only 3 recent activities
      setSchedules(schedulesData.slice(0, 3)); // Show only 3 upcoming schedules
      setProgress(progressData.slice(0, 4)); // Show only 4 subjects
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: <Quiz sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Completed',
      value: stats.completedQuizzes,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSchedules,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
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
        Track your learning progress and upcoming sessions
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {statCards.map((card, index) => (
          <Box key={index} sx={{ flex: '1 1 calc(25% - 24px)', minWidth: '250px' }}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: `${card.color}15`,
                borderTop: `4px solid ${card.color}`,
              }}
            >
              <Box sx={{ color: card.color }}>{card.icon}</Box>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '2 1 60%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Box sx={{ mt: 2 }}>
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <Box
                    key={activity.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{activity.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        {activity.score}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Score
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent activities
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/results')}
            >
              View All Results
            </Button>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Schedules
            </Typography>
            <Box sx={{ mt: 2 }}>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <Card key={schedule.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {schedule.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {schedule.time}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        with {schedule.educator}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming schedules
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/schedules')}
            >
              View All Schedules
            </Button>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Learning Progress
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {progress.length > 0 ? (
              progress.map((item, index) => (
                <Box key={index} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px' }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.subject}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No progress data available
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentDashboard;