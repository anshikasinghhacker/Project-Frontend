import React, { useState } from 'react';
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
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
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
      const currentUser = localStorage.getItem('user');
      console.log('Current user:', currentUser ? JSON.parse(currentUser) : null);
      console.log('Auth token:', token ? 'Token exists' : 'No token');

      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        ...(formData.role === 'EDUCATOR' && { subjectExpertise: formData.subjectExpertise }),
        ...(formData.role === 'STUDENT' && { gradeLevel: formData.gradeLevel }),
      };

      // Check if trying to create user with existing email
      if (userData.email === 'admin@test.com') {
        setError('Cannot create user with email admin@test.com - this email already exists!');
        setLoading(false);
        return;
      }

      console.log('Creating user with data:', userData);
      // Fallback to hardcoded URL if API_ENDPOINTS is not loaded
      const baseUrl = API_ENDPOINTS?.BASE_URL || 'http://localhost:8080';
      const apiEndpoint = API_ENDPOINTS?.ADMIN?.USERS || `${baseUrl}/api/admin/users`;
      console.log('API endpoint:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('User created successfully:', result);
        setSuccess('User created successfully!');
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } else {
        const data = await response.json();
        console.error('Error creating user:', data);
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Exception creating user:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          Add New User
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
              required
              fullWidth
              label="Password"
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
                {loading ? 'Creating...' : 'Create User'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
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

export default AddUser;