import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  Schedule,
  VideoCall,
  LocationOn,
  AccessTime,
  Group,
  Save,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import batchService from '../../services/batchService';
import lectureService from '../../services/lectureService';

interface LectureFormData {
  title: string;
  description: string;
  batchId: number | '';
  lectureDate: string;
  startTime: string;
  endTime: string;
  type: 'LIVE' | 'RECORDED';
  meetingLink?: string;
  location?: string;
  recordingEnabled: boolean;
  materials: string;
}

const LectureSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<LectureFormData>({
    title: '',
    description: '',
    batchId: '',
    lectureDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    type: 'LIVE',
    meetingLink: '',
    location: '',
    recordingEnabled: true,
    materials: ''
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const myBatches = await batchService.getMyBatches();
      setBatches(myBatches);
    } catch (error) {
      // Use mock data if API fails
      setBatches([
        { id: 1, batchName: 'Mathematics Batch A', batchCode: 'MATH-A' },
        { id: 2, batchName: 'Physics Batch B', batchCode: 'PHY-B' },
        { id: 3, batchName: 'Chemistry Batch C', batchCode: 'CHEM-C' }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      recordingEnabled: e.target.checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.title || !formData.batchId || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Try to create lecture via API
      await lectureService.createLecture({
        title: formData.title,
        description: formData.description,
        teacherId: user?.id,
        batchId: formData.batchId as number,
        lectureDate: formData.lectureDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: calculateDuration(formData.startTime, formData.endTime),
        type: formData.type === 'LIVE' ? 'LIVE' : 'HYBRID',
        status: 'SCHEDULED',
        meetingLink: formData.meetingLink,
        isRecorded: formData.recordingEnabled,
        resources: formData.materials
      });
      
      setSuccess('Lecture scheduled successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/teacher');
      }, 2000);
    } catch (error: any) {
      console.error('Error scheduling lecture:', error);
      setError(error?.response?.data?.message || 'Failed to schedule lecture. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Duration in minutes
  };

  const handleCancel = () => {
    navigate('/dashboard/teacher');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Schedule sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">Schedule New Lecture</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Lecture Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lecture Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Introduction to Calculus"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Brief description of the lecture topics..."
              />
            </Grid>

            {/* Select Batch */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Select Batch</InputLabel>
                <Select
                  value={formData.batchId}
                  label="Select Batch"
                  onChange={(e) => handleSelectChange('batchId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a batch</em>
                  </MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batchName} ({batch.batchCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Lecture Type */}
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Lecture Type</FormLabel>
                <RadioGroup
                  row
                  value={formData.type}
                  onChange={(e) => handleSelectChange('type', e.target.value)}
                >
                  <FormControlLabel
                    value="LIVE"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center">
                        <VideoCall sx={{ mr: 1 }} />
                        Live Session
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="RECORDED"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ mr: 1 }} />
                        In-Person
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Date */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date"
                name="lectureDate"
                type="date"
                value={formData.lectureDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Start Time */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* End Time */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Meeting Link or Location */}
            {formData.type === 'LIVE' ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Link"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://zoom.us/j/..."
                  helperText="Enter the online meeting link (Zoom, Google Meet, etc.)"
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Classroom Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Room 101, Building A"
                  helperText="Enter the physical classroom location"
                />
              </Grid>
            )}

            {/* Recording Option */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.recordingEnabled}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label="Enable recording for this lecture"
              />
            </Grid>

            {/* Study Materials */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Study Materials (Optional)"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                multiline
                rows={2}
                placeholder="Links to presentation, notes, or reading materials..."
                helperText="Add any relevant study materials or links"
              />
            </Grid>

            {/* Duration Display */}
            {formData.startTime && formData.endTime && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Duration: {calculateDuration(formData.startTime, formData.endTime)} minutes
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Lecture'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default LectureSchedule;