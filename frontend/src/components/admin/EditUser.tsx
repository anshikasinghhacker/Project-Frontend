import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT',
    phoneNumber: '',
    subjectExpertise: '',
    gradeLevel: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUser(parseInt(id));
    }
  }, [id]);

  const fetchUser = async (userId: number) => {
    try {
      setFetchingUser(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setFormData({
          email: userData.email || '',
          password: '', // Don't pre-fill password
          fullName: userData.fullName || '',
          role: userData.role || 'STUDENT',
          phoneNumber: userData.phoneNumber || '',
          subjectExpertise: userData.subjectExpertise || '',
          gradeLevel: userData.gradeLevel || '',
        });
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setFetchingUser(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        ...(formData.password && { password: formData.password }),
        ...(formData.role === 'EDUCATOR' && { subjectExpertise: formData.subjectExpertise }),
        ...(formData.role === 'STUDENT' && { gradeLevel: formData.gradeLevel }),
      };

      const response = await fetch(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setSuccess('User updated successfully!');
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/users')}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h4" gutterBottom>
          Edit User
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
            
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            
            <TextField
              fullWidth
              label="New Password (leave empty to keep current)"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Leave empty to keep the current password"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              
              <TextField
                required
                fullWidth
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="EDUCATOR">Educator</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </TextField>
            </Box>
            
            {formData.role === 'EDUCATOR' && (
              <TextField
                required
                fullWidth
                label="Subject Expertise"
                name="subjectExpertise"
                value={formData.subjectExpertise}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Physics"
              />
            )}
            
            {formData.role === 'STUDENT' && (
              <TextField
                required
                fullWidth
                label="Grade Level"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                placeholder="e.g., 10, 11, 12"
              />
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/users')}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditUser;