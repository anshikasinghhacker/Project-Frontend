import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  PlayArrow,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
  Timer,
  Person,
  CalendarToday,
  VideoLibrary,
  Upload,
  Close
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import lectureService from '../../services/lectureService';
import batchService from '../../services/batchService';

interface RecordedLecture {
  id: number;
  title: string;
  description: string;
  teacherName: string;
  batchName: string;
  duration: number;
  recordingUrl: string;
  thumbnailUrl?: string;
  recordedAt: string;
  subject: string;
  isBookmarked: boolean;
  views: number;
  topics: string[];
}

const RecordedLectures: React.FC = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<RecordedLecture[]>([]);
  const [filteredLectures, setFilteredLectures] = useState<RecordedLecture[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLecture, setUploadLecture] = useState({ title: '', description: '', batchId: '' });

  useEffect(() => {
    loadRecordedLectures();
    if (user?.role === 'TEACHER') {
      loadBatches();
    }
  }, []);

  useEffect(() => {
    filterLectures();
  }, [lectures, selectedBatch, searchTerm]);

  const loadRecordedLectures = async () => {
    try {
      setLoading(true);
      const recordedLectures = await lectureService.getRecordedLectures();
      
      // Transform API data to component format
      const transformedLectures: RecordedLecture[] = recordedLectures.map((lecture: any) => ({
        id: lecture.id,
        title: lecture.title,
        description: lecture.description || 'No description available',
        teacherName: lecture.teacherName || 'Unknown Teacher',
        batchName: lecture.batchName || 'Unknown Batch',
        duration: lecture.duration || 0,
        recordingUrl: lecture.recordingUrl || '',
        thumbnailUrl: lecture.thumbnailUrl,
        recordedAt: lecture.createdAt || new Date().toISOString(),
        subject: lecture.description || 'General',
        isBookmarked: false, // This would come from user preferences
        views: Math.floor(Math.random() * 100) + 1, // Mock data
        topics: lecture.topics ? lecture.topics.split(',') : []
      }));

      setLectures(transformedLectures);
    } catch (error) {
      console.error('Failed to load recorded lectures:', error);
      // Fallback to mock data
      const mockLectures: RecordedLecture[] = [
        {
          id: 1,
          title: 'Introduction to Calculus - Part 1',
          description: 'This lecture covers the basics of calculus including limits and derivatives.',
          teacherName: 'Dr. Smith',
          batchName: 'Mathematics Batch A',
          duration: 75,
          recordingUrl: '/api/files/recordings/calculus_intro.mp4',
          thumbnailUrl: 'https://via.placeholder.com/320x180?text=Calculus+Intro',
          recordedAt: '2024-02-10T10:00:00Z',
          subject: 'Mathematics',
          isBookmarked: false,
          views: 45,
          topics: ['Limits', 'Derivatives', 'Basic Calculus']
        },
        {
          id: 2,
          title: 'Quantum Mechanics Fundamentals',
          description: 'Understanding the principles of quantum mechanics and wave functions.',
          teacherName: 'Prof. Johnson',
          batchName: 'Physics Batch B',
          duration: 90,
          recordingUrl: '/api/files/recordings/quantum_mechanics.mp4',
          thumbnailUrl: 'https://via.placeholder.com/320x180?text=Quantum+Physics',
          recordedAt: '2024-02-09T14:00:00Z',
          subject: 'Physics',
          isBookmarked: true,
          views: 67,
          topics: ['Wave Functions', 'Uncertainty Principle', 'Quantum States']
        }
      ];
      setLectures(mockLectures);
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const batchData = await batchService.getMyBatches();
      setBatches(batchData);
    } catch (error) {
      console.error('Failed to load batches:', error);
    }
  };

  const filterLectures = () => {
    let filtered = lectures;

    if (selectedBatch) {
      filtered = filtered.filter(lecture => lecture.batchName === selectedBatch);
    }

    if (searchTerm) {
      filtered = filtered.filter(lecture =>
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLectures(filtered);
  };

  const handlePlayLecture = (lecture: RecordedLecture) => {
    // In a real implementation, this would open a video player
    window.open(lecture.recordingUrl, '_blank');
  };

  const handleBookmark = (lectureId: number) => {
    setLectures(prev =>
      prev.map(lecture =>
        lecture.id === lectureId
          ? { ...lecture, isBookmarked: !lecture.isBookmarked }
          : lecture
      )
    );
  };

  const handleDownload = (lecture: RecordedLecture) => {
    // Create download link
    const link = document.createElement('a');
    link.href = lecture.recordingUrl;
    link.download = `${lecture.title}.mp4`;
    link.click();
  };

  const handleShare = (lecture: RecordedLecture) => {
    if (navigator.share) {
      navigator.share({
        title: lecture.title,
        text: lecture.description,
        url: window.location.origin + lecture.recordingUrl
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.origin + lecture.recordingUrl);
    }
  };

  const handleUploadRecording = async () => {
    if (!selectedFile || !uploadLecture.title || !uploadLecture.batchId) {
      return;
    }

    try {
      // First create a lecture
      const lectureData = {
        title: uploadLecture.title,
        description: uploadLecture.description,
        batchId: parseInt(uploadLecture.batchId),
        lectureDate: new Date().toISOString().split('T')[0],
        type: 'RECORDED' as const,
        isRecorded: true,
        status: 'COMPLETED' as const
      };

      const createdLecture = await lectureService.createLecture(lectureData);
      
      // Then upload the recording
      await lectureService.uploadRecording(createdLecture.id, selectedFile);
      
      // Refresh the lectures list
      loadRecordedLectures();
      
      // Reset form
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadLecture({ title: '', description: '', batchId: '' });
      
    } catch (error) {
      console.error('Failed to upload recording:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading recorded lectures...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Recorded Lectures
        </Typography>
        {user?.role === 'TEACHER' && (
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Recording
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search lectures..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Batch</InputLabel>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                label="Filter by Batch"
              >
                <MenuItem value="">All Batches</MenuItem>
                {batches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.batchName}>
                    {batch.batchName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <Alert severity="info">
          No recorded lectures found. {user?.role === 'TEACHER' && 'Click "Upload Recording" to add your first lecture.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredLectures.map((lecture) => (
            <Grid item xs={12} sm={6} md={4} key={lecture.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  sx={{ height: 180, position: 'relative' }}
                  image={lecture.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Lecture+Recording'}
                  title={lecture.title}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    <Chip
                      label={formatDuration(lecture.duration)}
                      size="small"
                      sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handlePlayLecture(lecture)}
                  >
                    <IconButton
                      size="large"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'white' }
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 40 }} />
                    </IconButton>
                  </Box>
                </CardMedia>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {lecture.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {lecture.description}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person fontSize="small" />
                    <Typography variant="body2">{lecture.teacherName}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">{formatDate(lecture.recordedAt)}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <VideoLibrary fontSize="small" />
                    <Typography variant="body2">{lecture.views} views</Typography>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {lecture.topics.map((topic, index) => (
                      <Chip key={index} label={topic} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handlePlayLecture(lecture)}
                    >
                      Play
                    </Button>
                    
                    <Box>
                      <Tooltip title={lecture.isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
                        <IconButton
                          size="small"
                          onClick={() => handleBookmark(lecture.id)}
                        >
                          {lecture.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(lecture)}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Share">
                        <IconButton
                          size="small"
                          onClick={() => handleShare(lecture)}
                        >
                          <Share />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Recording
          <IconButton
            aria-label="close"
            onClick={() => setUploadDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              fullWidth
              label="Lecture Title"
              value={uploadLecture.title}
              onChange={(e) => setUploadLecture({ ...uploadLecture, title: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={uploadLecture.description}
              onChange={(e) => setUploadLecture({ ...uploadLecture, description: e.target.value })}
            />
            
            <FormControl fullWidth required>
              <InputLabel>Batch</InputLabel>
              <Select
                value={uploadLecture.batchId}
                onChange={(e) => setUploadLecture({ ...uploadLecture, batchId: e.target.value })}
                label="Batch"
              >
                {batches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id.toString()}>
                    {batch.batchName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
              sx={{ height: 56 }}
            >
              {selectedFile ? selectedFile.name : 'Choose Video File'}
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadRecording}
            variant="contained"
            disabled={!selectedFile || !uploadLecture.title || !uploadLecture.batchId}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RecordedLectures;