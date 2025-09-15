import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import {
  People,
  School,
  Quiz,
  TrendingUp,
  Edit,
  Delete,
  Add,
  AdminPanelSettings,
  Assessment,
  Schedule,
  AssignmentInd,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API_BASE_URL from '../../config/api';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalEducators: number;
  totalQuizzes: number;
  totalSchedules: number;
  activeUsers: number;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalEducators: 0,
    totalQuizzes: 0,
    totalSchedules: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalStudents: statsData.totalStudents || 0,
          totalEducators: statsData.totalEducators || 0,
          totalQuizzes: statsData.totalQuizzes || 0,
          totalSchedules: statsData.totalSchedules || 0,
          activeUsers: statsData.activeUsers || 0,
        });
      } else {
        throw new Error('Failed to fetch stats');
      }
      
      // Fetch users
      const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.slice(0, 5)); // Show only first 5 users
      } else {
        throw new Error('Failed to fetch users');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty state instead of mock data
      setUsers([]);
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalEducators: 0,
        totalQuizzes: 0,
        totalSchedules: 0,
        activeUsers: 0,
      });
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      description: 'All registered users',
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      description: 'Active students',
    },
    {
      title: 'Educators',
      value: stats.totalEducators,
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      description: 'Active educators',
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: <Quiz sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      description: 'Created quizzes',
    },
    {
      title: 'Schedules',
      value: stats.totalSchedules,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#f44336',
      description: 'Active schedules',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#00bcd4',
      description: 'Currently active',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'EDUCATOR':
        return 'warning';
      case 'STUDENT':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.fullName}! Manage your platform from here.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/users/new')}
        >
          Add New User
        </Button>
      </Box>

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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    color: card.color,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" component="div">
                    {card.value}
                  </Typography>
                  <Typography variant="subtitle1" color="text.primary">
                    {card.title}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<School />}
            onClick={() => navigate('/admin/batches')}
            sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Manage Batches
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssignmentInd />}
            onClick={() => navigate('/admin/batches')}
          >
            Assign Teachers
          </Button>
          <Button
            variant="outlined"
            startIcon={<Group />}
            onClick={() => navigate('/admin/batches')}
          >
            Assign Students
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => navigate('/admin/batches')}
          >
            Training Schedule
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => navigate('/admin/users/new')}
          >
            Add User
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => navigate('/admin/reports')}
          >
            View Reports
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Users</Typography>
          <Button variant="outlined" onClick={() => navigate('/admin/users')}>
            View All Users
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.enabled ? 'Active' : 'Inactive'}
                      color={user.enabled ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<People />}
            onClick={() => navigate('/admin/users')}
          >
            Manage Users
          </Button>
          <Button
            variant="outlined"
            startIcon={<Quiz />}
            onClick={() => navigate('/admin/quizzes')}
          >
            Manage Quizzes
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => navigate('/admin/schedules')}
          >
            Manage Schedules
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => navigate('/admin/reports')}
          >
            View Reports
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;