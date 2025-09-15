import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Book,
  VideoLibrary,
  PictureAsPdf,
  Description,
  GetApp,
  Visibility,
  Search,
  FilterList,
  Subject,
  DateRange,
  Person,
  PlayArrow,
  Bookmark,
  BookmarkBorder,
  Share,
  ThumbUp,
  Comment,
  School,
  Topic,
  Category,
  CloudDownload,
  AudioFile,
  Image as ImageIcon,
  Link as LinkIcon,
  InsertDriveFile
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import studyMaterialService from '../../services/studyMaterialService';

interface StudyMaterial {
  id: number;
  title: string;
  description?: string;
  subject: string;
  topic?: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PRESENTATION' | 'LINK' | 'OTHER';
  fileUrl?: string;
  uploadedBy: string;
  uploadedByRole: string;
  createdAt: string;
  fileSize?: number;
  downloadCount: number;
  viewCount: number;
  isBookmarked?: boolean;
  batchName?: string;
  lectureName?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudyMaterials: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [openViewer, setOpenViewer] = useState(false);
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<number[]>([]);

  useEffect(() => {
    fetchStudyMaterials();
    fetchBookmarks();
  }, []);

  const fetchStudyMaterials = async () => {
    try {
      setLoading(true);
      const materialsData = await studyMaterialService.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      // Mock data for development
      setMaterials([
        {
          id: 1,
          title: 'Algebra Fundamentals',
          description: 'Basic concepts of algebra including variables, equations, and functions.',
          subject: 'Mathematics',
          topic: 'Algebra',
          type: 'PDF',
          fileUrl: '/materials/algebra-fundamentals.pdf',
          uploadedBy: 'Dr. Smith',
          uploadedByRole: 'TEACHER',
          createdAt: '2024-11-15T10:00:00Z',
          fileSize: 2048576,
          downloadCount: 45,
          viewCount: 120,
          batchName: 'Math Batch A'
        },
        {
          id: 2,
          title: 'Introduction to Physics',
          description: 'Video lecture covering basic physics concepts.',
          subject: 'Physics',
          topic: 'Mechanics',
          type: 'VIDEO',
          fileUrl: '/materials/physics-intro.mp4',
          uploadedBy: 'Prof. Johnson',
          uploadedByRole: 'TEACHER',
          createdAt: '2024-11-20T14:30:00Z',
          fileSize: 15728640,
          downloadCount: 32,
          viewCount: 89,
          batchName: 'Physics Batch B'
        },
        {
          id: 3,
          title: 'Chemistry Lab Manual',
          description: 'Comprehensive lab manual for chemistry experiments.',
          subject: 'Chemistry',
          topic: 'Laboratory',
          type: 'DOCUMENT',
          fileUrl: '/materials/chem-lab-manual.docx',
          uploadedBy: 'Dr. Brown',
          uploadedByRole: 'TEACHER',
          createdAt: '2024-11-18T09:15:00Z',
          fileSize: 1024000,
          downloadCount: 28,
          viewCount: 67,
          batchName: 'Chemistry Batch C'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      // Bookmark functionality not implemented in service yet
      // const bookmarks = await studyMaterialService.getUserBookmarks();
      // setBookmarkedMaterials(bookmarks.map((b: any) => b.materialId));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      await studyMaterialService.downloadMaterial(material.id);
      // Update download count locally
      setMaterials(prev => 
        prev.map(m => 
          m.id === material.id 
            ? { ...m, downloadCount: m.downloadCount + 1 }
            : m
        )
      );
      // Trigger actual download
      window.open(material.fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  const handleView = async (material: StudyMaterial) => {
    try {
      setSelectedMaterial(material);
      setOpenViewer(true);
      
      // Track view count
      await studyMaterialService.incrementViewCount(material.id);
      setMaterials(prev => 
        prev.map(m => 
          m.id === material.id 
            ? { ...m, viewCount: m.viewCount + 1 }
            : m
        )
      );
    } catch (error) {
      console.error('Error viewing material:', error);
    }
  };

  const handleBookmark = async (materialId: number) => {
    try {
      // Bookmark functionality not implemented in service yet
      if (bookmarkedMaterials.includes(materialId)) {
        // await studyMaterialService.removeBookmark(materialId);
        setBookmarkedMaterials(prev => prev.filter(id => id !== materialId));
      } else {
        // await studyMaterialService.addBookmark(materialId);
        setBookmarkedMaterials(prev => [...prev, materialId]);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <PictureAsPdf />;
      case 'VIDEO': return <VideoLibrary />;
      case 'AUDIO': return <AudioFile />;
      case 'IMAGE': return <ImageIcon />;
      case 'DOCUMENT': return <Description />;
      case 'PRESENTATION': return <School />;
      case 'LINK': return <LinkIcon />;
      default: return <InsertDriveFile />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return '#d32f2f';
      case 'VIDEO': return '#1976d2';
      case 'AUDIO': return '#388e3c';
      case 'IMAGE': return '#f57c00';
      case 'DOCUMENT': return '#512da8';
      case 'PRESENTATION': return '#0288d1';
      case 'LINK': return '#00796b';
      default: return '#616161';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredMaterials = () => {
    let filtered = materials;

    if (tabValue === 1) {
      // Show only bookmarked materials
      filtered = materials.filter(m => bookmarkedMaterials.includes(m.id));
    }

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(m => m.subject === subjectFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(m => m.type === typeFilter);
    }

    return filtered;
  };

  const getUniqueSubjects = () => {
    return Array.from(new Set(materials.map(m => m.subject)));
  };

  const getUniqueTypes = () => {
    return Array.from(new Set(materials.map(m => m.type)));
  };

  const filteredMaterials = getFilteredMaterials();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Study Materials
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              label="Subject"
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {getUniqueSubjects().map(subject => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              {getUniqueTypes().map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Materials" />
          <Tab 
            label={
              <Badge badgeContent={bookmarkedMaterials.length} color="primary">
                Bookmarked
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {/* Materials List */}
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {filteredMaterials.map((material) => (
              // @ts-ignore
              <Grid item xs={12} md={6} lg={4} key={material.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box 
                          sx={{ 
                            color: getTypeColor(material.type),
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {getTypeIcon(material.type)}
                        </Box>
                        <Chip 
                          label={material.type} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getTypeColor(material.type),
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleBookmark(material.id)}
                      >
                        {bookmarkedMaterials.includes(material.id) ? 
                          <Bookmark color="primary" /> : 
                          <BookmarkBorder />
                        }
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {material.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {material.description}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip label={material.subject} size="small" color="primary" variant="outlined" />
                      {material.topic && (
                        <Chip label={material.topic} size="small" variant="outlined" />
                      )}
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        By {material.uploadedBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(material.createdAt)}
                      </Typography>
                    </Box>
                    
                    {material.fileSize && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Size: {formatFileSize(material.fileSize)}
                      </Typography>
                    )}
                    
                    <Box display="flex" gap={2} mt={2}>
                      <Typography variant="caption">
                        {material.viewCount} views
                      </Typography>
                      <Typography variant="caption">
                        {material.downloadCount} downloads
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleView(material)}
                        fullWidth
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<GetApp />}
                        onClick={() => handleDownload(material)}
                        fullWidth
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {bookmarkedMaterials.length === 0 ? (
          <Alert severity="info">
            You haven't bookmarked any study materials yet. Click the bookmark icon on any material to save it here.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredMaterials.map((material) => (
              // @ts-ignore
              <Grid item xs={12} md={6} lg={4} key={material.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box 
                          sx={{ 
                            color: getTypeColor(material.type),
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {getTypeIcon(material.type)}
                        </Box>
                        <Chip 
                          label={material.type} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getTypeColor(material.type),
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleBookmark(material.id)}
                      >
                        <Bookmark color="primary" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {material.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {material.description}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip label={material.subject} size="small" color="primary" variant="outlined" />
                      {material.topic && (
                        <Chip label={material.topic} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleView(material)}
                        fullWidth
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<GetApp />}
                        onClick={() => handleDownload(material)}
                        fullWidth
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Material Viewer Dialog */}
      <Dialog
        open={openViewer}
        onClose={() => setOpenViewer(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedMaterial?.title}
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Box>
              {selectedMaterial.type === 'PDF' && (
                <embed
                  src={selectedMaterial.fileUrl}
                  width="100%"
                  height="600px"
                  type="application/pdf"
                />
              )}
              
              {selectedMaterial.type === 'VIDEO' && (
                <video
                  width="100%"
                  height="400px"
                  controls
                  src={selectedMaterial.fileUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {selectedMaterial.type === 'IMAGE' && (
                <img
                  src={selectedMaterial.fileUrl}
                  alt={selectedMaterial.title}
                  style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                />
              )}
              
              {selectedMaterial.type === 'LINK' && (
                <Box textAlign="center" py={4}>
                  <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    External Link
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => window.open(selectedMaterial.fileUrl, '_blank')}
                  >
                    Open Link
                  </Button>
                </Box>
              )}
              
              {['DOCUMENT', 'PRESENTATION', 'AUDIO', 'OTHER'].includes(selectedMaterial.type) && (
                <Box textAlign="center" py={4}>
                  {getTypeIcon(selectedMaterial.type)}
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    {selectedMaterial.type} File
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    This file type cannot be previewed. Please download to view.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<GetApp />}
                    onClick={() => handleDownload(selectedMaterial)}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewer(false)}>Close</Button>
          {selectedMaterial && (
            <Button
              startIcon={<GetApp />}
              onClick={() => handleDownload(selectedMaterial)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudyMaterials;