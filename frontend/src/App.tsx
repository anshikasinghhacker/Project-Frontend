import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './components/dashboard/AdminDashboard';
import EducatorDashboard from './components/dashboard/EducatorDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import ScheduleList from './components/schedule/ScheduleList';
import QuizList from './components/quiz/QuizList';
import MockTestList from './components/mocktest/MockTestList';
import Results from './components/results/Results';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddUser from './components/admin/AddUser';
import EditUser from './components/admin/EditUser';
import ManageUsers from './components/admin/ManageUsers';
import ManageQuizzes from './components/admin/ManageQuizzes';
import QuizView from './components/quiz/QuizView';
import LectureSchedule from './components/lecture/LectureSchedule';
import LectureStart from './components/lecture/LectureStart';
import AssignmentCreate from './components/assignment/AssignmentCreate';
import AssignmentSubmission from './components/assignment/AssignmentSubmission';
import AssignmentGrading from './components/assignment/AssignmentGrading';
import StudyMaterials from './components/study-materials/StudyMaterials';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import TrainingManagement from './components/admin/TrainingManagement';
import MockTestCreate from './components/mocktest/MockTestCreate';
import EnhancedBatchManagement from './components/admin/EnhancedBatchManagement';
import JuniorEducatorDashboard from './components/dashboard/JuniorEducatorDashboard';
import MaterialUpload from './components/study-materials/MaterialUpload';
import BatchDetails from './components/batch/BatchDetails';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard">
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="educator" element={<EducatorDashboard />} />
                <Route path="teacher" element={<TeacherDashboard />} />
                <Route path="junior-educator" element={<JuniorEducatorDashboard />} />
                <Route path="student" element={<StudentDashboard />} />
              </Route>
              <Route path="schedules" element={<ScheduleList />} />
              <Route path="lectures/schedule" element={<LectureSchedule />} />
              <Route path="lectures/:id/start" element={<LectureStart />} />
              <Route path="lectures/start" element={<LectureStart />} />
              <Route path="assignments/create" element={<AssignmentCreate />} />
              <Route path="assignments/submission" element={<AssignmentSubmission />} />
              <Route path="assignments/grading" element={<AssignmentGrading />} />
              <Route path="study-materials" element={<StudyMaterials />} />
              <Route path="materials/upload" element={<MaterialUpload />} />
              <Route path="batches/:id" element={<BatchDetails />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="mock-tests/create" element={<MockTestCreate />} />
              <Route path="quizzes" element={<QuizList />} />
              <Route path="quiz/:id" element={<QuizView />} />
              <Route path="mock-tests" element={<MockTestList />} />
              <Route path="results" element={<Results />} />
              <Route path="admin/users/new" element={<AddUser />} />
              <Route path="admin/users/edit/:id" element={<EditUser />} />
              <Route path="admin/users" element={<ManageUsers />} />
              <Route path="admin/batches" element={<EnhancedBatchManagement />} />
              <Route path="admin/training" element={<TrainingManagement />} />
              <Route path="admin/quizzes" element={<ManageQuizzes />} />
              <Route path="admin/schedules" element={<ScheduleList />} />
              <Route path="admin/reports" element={<Results />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
