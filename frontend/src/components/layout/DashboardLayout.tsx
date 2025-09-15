import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Schedule,
  Quiz,
  Assignment,
  Assessment,
  ExitToApp,
  Person,
  ChevronLeft,
  MenuBook,
  Grading,
  School,
  Event,
  EventAvailable,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const getDashboardPath = () => {
      switch(user?.role) {
        case 'TEACHER': return '/dashboard/teacher';
        case 'JUNIOR_EDUCATOR': return '/dashboard/junior-educator';
        case 'STUDENT': return '/dashboard/student';
        case 'ADMIN': return '/dashboard/admin';
        default: return '/dashboard';
      }
    };

    const baseItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: getDashboardPath(),
      },
      {
        text: 'Schedules',
        icon: <Schedule />,
        path: '/schedules',
      },
    ];

    if (user?.role === 'STUDENT') {
      return [
        ...baseItems,
        {
          text: 'My Assignments',
          icon: <Assignment />,
          path: '/assignments/submission',
        },
        {
          text: 'Study Materials',
          icon: <MenuBook />,
          path: '/study-materials',
        },
        {
          text: 'Quizzes',
          icon: <Quiz />,
          path: '/quizzes',
        },
        {
          text: 'Mock Tests',
          icon: <Assessment />,
          path: '/mock-tests',
        },
        {
          text: 'Results',
          icon: <Assessment />,
          path: '/results',
        },
      ];
    }

    if (user?.role === 'TEACHER') {
      return [
        ...baseItems,
        {
          text: 'Attendance',
          icon: <EventAvailable />,
          path: '/attendance',
        },
        {
          text: 'Create Assignment',
          icon: <Assignment />,
          path: '/assignments/create',
        },
        {
          text: 'Grade Assignments',
          icon: <Grading />,
          path: '/assignments/grading',
        },
        {
          text: 'Manage Quizzes',
          icon: <Quiz />,
          path: '/quizzes',
        },
        {
          text: 'Student Results',
          icon: <Assessment />,
          path: '/results',
        },
      ];
    }
    
    if (user?.role === 'JUNIOR_EDUCATOR') {
      return [
        ...baseItems,
        {
          text: 'Create Mock Test',
          icon: <Assessment />,
          path: '/mock-tests/create',
        },
        {
          text: 'Grade Assignments',
          icon: <Grading />,
          path: '/assignments/grading',
        },
        {
          text: 'Mock Tests',
          icon: <Assignment />,
          path: '/mock-tests',
        },
        {
          text: 'Student Results',
          icon: <Assessment />,
          path: '/results',
        },
      ];
    }

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        {
          text: 'User Management',
          icon: <Person />,
          path: '/admin/users',
        },
        {
          text: 'Batch Management',
          icon: <School />,
          path: '/admin/batches',
        },
        {
          text: 'Training Management',
          icon: <Event />,
          path: '/admin/training',
        },
        {
          text: 'All Quizzes',
          icon: <Quiz />,
          path: '/admin/quizzes',
        },
        {
          text: 'All Results',
          icon: <Assessment />,
          path: '/admin/reports',
        },
      ];
    }

    return baseItems;
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Educator Platform
        </Typography>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ ml: 'auto' }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role === 'TEACHER' && 'Teacher Dashboard'}
            {user?.role === 'JUNIOR_EDUCATOR' && 'Junior Educator Dashboard'}
            {user?.role === 'STUDENT' && 'Student Dashboard'}
            {user?.role === 'ADMIN' && 'Admin Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.fullName}
              {user?.role === 'TEACHER' && ' (Teacher)'}
              {user?.role === 'JUNIOR_EDUCATOR' && ' (Junior Educator)'}
              {user?.role === 'STUDENT' && user?.batchName && ` (${user.batchName})`}
              {user?.role === 'ADMIN' && ' (Admin)'}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.fullName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;