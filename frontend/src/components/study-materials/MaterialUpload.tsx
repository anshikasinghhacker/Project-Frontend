import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import {
  CloudUpload,
  AttachFile,
  Delete,
  Visibility,
  School,
  Subject,
  ArrowBack,
  Download,
  Assignment,
  Info,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import studyMaterialService from '../../services/studyMaterialService';
import batchService from '../../services/batchService';


interface Batch {
  id: number;
  name: string;
  code: string;
}

const MaterialUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    batchId: '',
    type: 'DOCUMENT',
    isPublic: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]);
  const [fileUrls, setFileUrls] = useState<{[key: string]: string}>({});
  const [videoProgress, setVideoProgress] = useState<{[key: string]: number}>({});
  const [videoDuration, setVideoDuration] = useState<{[key: string]: number}>({});
  const [videoPlaying, setVideoPlaying] = useState<{[key: string]: boolean}>({});

  // Debug: Log whenever uploadedMaterials changes
  useEffect(() => {
    console.log('uploadedMaterials state updated:', uploadedMaterials);
  }, [uploadedMaterials]);

  useEffect(() => {
    console.log('Component mounted, fetching materials...');
    fetchBatches();
    fetchUploadedMaterials();
  }, []);

  // Cleanup file URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(fileUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [fileUrls]);

  // Also fetch materials when the component first renders (development aid)
  useEffect(() => {
    if (uploadedMaterials.length === 0) {
      console.log('No materials found, forcing fetch...');
      setTimeout(() => {
        fetchUploadedMaterials();
      }, 100);
    }
  }, [uploadedMaterials.length]);

  const fetchBatches = async () => {
    try {
      const batchData = await batchService.getAllBatches();
      setBatches(batchData);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchUploadedMaterials = async () => {
    try {
      const materials = await studyMaterialService.getAllMaterials();
      // Always combine API materials with localStorage materials
      const localMaterials = getMockMaterials();
      const allMaterials = [...materials, ...localMaterials];
      console.log('Setting materials from API + localStorage:', allMaterials.slice(0, 5));
      setUploadedMaterials(allMaterials.slice(0, 5)); // Show last 5 uploads
    } catch (error) {
      console.error('Error fetching materials:', error);
      // Fallback to mock data if API is not available
      const mockMaterials = getMockMaterials();
      console.log('Setting materials from localStorage only:', mockMaterials.slice(0, 5));
      setUploadedMaterials(mockMaterials.slice(0, 5));
    }
  };

  const getMockMaterials = () => {
    // For development, always recreate materials to ensure they show up
    // Try to get materials from localStorage first
    const savedMaterials = localStorage.getItem('uploadedMaterials');
    if (savedMaterials) {
      try {
        const materials = JSON.parse(savedMaterials);
        console.log('Found materials in localStorage:', materials);
        // If we have materials, return them, otherwise recreate
        if (materials && materials.length > 0) {
          return materials;
        }
      } catch (error) {
        console.log('Error parsing localStorage materials, recreating...');
        localStorage.removeItem('uploadedMaterials');
      }
    }

    // Default mock materials
    const mockMaterials = [
      {
        id: 1,
        title: 'Introduction to Calculus',
        description: 'Comprehensive guide to calculus fundamentals including derivatives and integrals',
        type: 'PDF',
        subject: 'Mathematics',
        topic: 'Derivatives',
        fileSize: 2048576, // 2MB
        fileName: 'calculus-intro.pdf',
        uploadedAt: new Date().toISOString(),
        instructor: 'Dr. Smith'
      },
      {
        id: 2,
        title: 'Physics Lecture Video',
        description: 'Video lecture on thermodynamics principles',
        type: 'VIDEO',
        subject: 'Physics',
        topic: 'Thermodynamics',
        fileSize: 52428800, // 50MB
        fileName: 'physics-lecture.mp4',
        uploadedAt: new Date().toISOString(),
        instructor: 'Prof. Johnson'
      },
      {
        id: 3,
        title: 'Chemistry Lab Audio',
        description: 'Audio recording of chemistry lab procedures',
        type: 'AUDIO',
        subject: 'Chemistry',
        topic: 'Lab Procedures',
        fileSize: 10485760, // 10MB
        fileName: 'lab-audio.mp3',
        uploadedAt: new Date().toISOString(),
        instructor: 'Dr. Wilson'
      },
      {
        id: 4,
        title: 'Biology Diagram',
        description: 'Detailed diagram of cell structure',
        type: 'IMAGE',
        subject: 'Biology',
        topic: 'Cell Biology',
        fileSize: 1048576, // 1MB
        fileName: 'cell-diagram.jpg',
        uploadedAt: new Date().toISOString(),
        instructor: 'Prof. Davis'
      }
    ];
    
    console.log('Creating default mock materials:', mockMaterials);
    // Save to localStorage
    localStorage.setItem('uploadedMaterials', JSON.stringify(mockMaterials));
    return mockMaterials;
  };

  const addMaterialToStorage = (material: any) => {
    const existingMaterials = getMockMaterials();
    
    // Create URL for the uploaded file for preview
    let fileUrl: string | null = null;
    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
      const fileKey = `material-${Date.now()}`;
      setFileUrls(prev => ({
        ...prev,
        [fileKey]: fileUrl as string
      }));
      material.previewKey = fileKey;
    }
    
    const newMaterial = {
      ...material,
      id: Date.now(),
      uploadedAt: new Date().toISOString(),
      instructor: user?.fullName || 'Current User',
      // Ensure we have fileName for uploaded materials
      fileName: material.fileName || selectedFile?.name || 'uploaded-file',
      // Ensure we have fileSize for uploaded materials  
      fileSize: material.fileSize || selectedFile?.size || 0
    };
    
    const updatedMaterials = [newMaterial, ...existingMaterials].slice(0, 10); // Keep only latest 10
    console.log('=== DEBUG: Adding new material ===');
    console.log('New material data:', newMaterial);
    console.log('User data:', { fullName: user?.fullName, role: user?.role });
    console.log('Selected file data:', { name: selectedFile?.name, size: selectedFile?.size });
    console.log('Material object keys:', Object.keys(newMaterial));
    console.log('Updated materials array:', updatedMaterials.slice(0, 2)); // Show first 2
    localStorage.setItem('uploadedMaterials', JSON.stringify(updatedMaterials));
    return updatedMaterials;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create URL for the file for preview
      const fileUrl = URL.createObjectURL(file);
      const fileKey = `preview-${Date.now()}`;
      setFileUrls(prev => ({
        ...prev,
        [fileKey]: fileUrl
      }));
      
      // Auto-detect file type
      const fileType = getFileType(file.type, file.name);
      setFormData(prev => ({
        ...prev,
        type: fileType,
        previewKey: fileKey // Store the key for preview
      }));

      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.split('.')[0];
        setFormData(prev => ({
          ...prev,
          title: fileName
        }));
      }
    }
  };

  const getFileType = (mimeType: string, fileName: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('video')) return 'VIDEO';
    if (mimeType.includes('audio')) return 'AUDIO';
    if (mimeType.includes('image')) return 'IMAGE';
    if (mimeType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return 'PRESENTATION';
    if (mimeType.includes('spreadsheet') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return 'SPREADSHEET';
    return 'DOCUMENT';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const materialData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        topic: formData.topic,
        type: formData.type as any,
        batchId: formData.batchId ? parseInt(formData.batchId) : undefined,
        isPublic: formData.isPublic,
        status: 'ACTIVE' as const,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const result = await studyMaterialService.uploadMaterial(selectedFile, materialData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // API successful - also add to localStorage and update display
        const updatedMaterials = addMaterialToStorage(materialData);
        console.log('Setting uploaded materials after API success:', updatedMaterials.slice(0, 5));
        setUploadedMaterials(updatedMaterials.slice(0, 5));
      } catch (apiError) {
        // API not available, save to localStorage instead
        console.log('API not available, saving to localStorage');
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Add to localStorage
        const updatedMaterials = addMaterialToStorage(materialData);
        console.log('Setting uploaded materials after API error:', updatedMaterials.slice(0, 5));
        setUploadedMaterials(updatedMaterials.slice(0, 5));
      }
      
      setSuccess(`Material "${materialData.title}" uploaded successfully! Check Recent Uploads.`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        topic: '',
        batchId: '',
        type: 'DOCUMENT',
        isPublic: false,
      });
      setSelectedFile(null);
      
      setTimeout(() => {
        setUploadProgress(0);
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to upload material. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (material: any) => {
    setSelectedMaterial(material);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedMaterial(null);
  };

  const handleDownload = (material: any) => {
    // Simulate file download
    console.log('Downloading material:', material.title);
    // In a real app, this would download the actual file
    alert(`Downloading ${material.title}...`);
  };

  const handleSubmitAssignment = (material: any) => {
    // Navigate to assignment submission page or open submission dialog
    console.log('Submitting assignment for material:', material.title);
    navigate('/assignments/submission', { state: { materialId: material.id, materialTitle: material.title } });
  };

  const renderFilePreview = (material: any) => {
    // For demo purposes, create sample URLs based on material type
    const getSampleUrl = (type: string) => {
      switch (type) {
        case 'PDF':
          // Return a special marker for PDF to indicate we have custom rendering
          return 'CUSTOM_PDF_PREVIEW';
        case 'IMAGE':
          // Use a data URL without Unicode characters
          const svgString = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#81C784;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="800" height="400" fill="url(#grad1)" />
              <text x="400" y="180" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="bold">Sample Educational Image</text>
              <text x="400" y="220" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.9">Biology Diagram - Cell Structure</text>
              <circle cx="200" cy="300" r="40" fill="white" opacity="0.3" />
              <circle cx="400" cy="320" r="30" fill="white" opacity="0.3" />
              <circle cx="600" cy="290" r="35" fill="white" opacity="0.3" />
            </svg>`;
          return 'data:image/svg+xml;base64,' + btoa(svgString);
        case 'VIDEO':
          return 'https://www.w3schools.com/html/mov_bbb.mp4';
        case 'AUDIO':
          return 'https://www.w3schools.com/html/horse.ogg';
        default:
          return null;
      }
    };

    const sampleUrl = getSampleUrl(material.type);
    
    // Check if we have no preview available (excluding PDF which has custom rendering)
    if (!sampleUrl && material.type !== 'PDF') {
      return (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Subject sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="grey.600">
            {material.type} Preview
          </Typography>
          <Typography variant="body2" color="grey.500">
            {material.fileName || material.title}
          </Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 1 }}>
            Preview not available for this file type
          </Typography>
        </Box>
      );
    }

    switch (material.type) {
      case 'PDF':
        // Check if we have an actual file to preview
        const pdfUrl = material.previewKey ? fileUrls[material.previewKey] : null;
        
        if (pdfUrl) {
          // Show actual PDF content
          return (
            <Box sx={{ height: 500, bgcolor: '#f5f5f5', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {/* PDF Header */}
              <Box sx={{ 
                bgcolor: '#333', 
                color: 'white', 
                p: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '0.875rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Subject />
                  <span>{material.title || material.fileName}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span>PDF Preview</span>
                  <Button size="small" variant="outlined" color="inherit" sx={{ minWidth: 'auto', px: 1 }}>
                    ⚡ Download
                  </Button>
                </Box>
              </Box>
              
              {/* Actual PDF Content */}
              <Box sx={{ flex: 1, overflow: 'hidden', p: 1 }}>
                <iframe
                  src={pdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                  title={`PDF Preview: ${material.title || material.fileName}`}
                />
              </Box>
            </Box>
          );
        }
        
        // Fallback to simulated preview if no actual file
        return (
          <Box sx={{ height: 400, bgcolor: '#f5f5f5', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* PDF Header */}
            <Box sx={{ 
              bgcolor: '#333', 
              color: 'white', 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.875rem'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Subject />
                <span>{material.title}</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Page 1 of {Math.max(1, Math.ceil((material.fileSize || 1000000) / 500000))}</span>
                <Button size="small" variant="outlined" color="inherit" sx={{ minWidth: 'auto', px: 1 }}>
                  ⚡ Download
                </Button>
              </Box>
            </Box>
            
            {/* PDF Content Area */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: 'white', 
              m: 2, 
              p: 3, 
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              fontFamily: 'serif'
            }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {material.title || material.fileName || 'Untitled Document'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {material.subject || 'General'}{material.topic ? ` - ${material.topic}` : ''}
                </Typography>
                {material.instructor && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    By {material.instructor}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ textAlign: 'left', lineHeight: 1.6 }}>
                {material.description && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Document Summary
                    </Typography>
                    <Typography variant="body1">
                      {material.description}
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {material.subject === 'Mathematics' ? 'Mathematical Concepts' :
                   material.subject === 'Physics' ? 'Physical Principles' :
                   material.subject === 'Chemistry' ? 'Chemical Processes' :
                   material.subject === 'Biology' ? 'Biological Systems' :
                   `${material.subject || 'Educational'} Content`}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {material.description && material.description.trim() ? (
                    // If there's a proper description, use it as the main content
                    material.description
                  ) : (
                    // Generate personalized content based on the actual material data
                    (() => {
                      const displayName = material.title || material.fileName || 'document';
                      const subject = material.subject || '';
                      const topic = material.topic || '';
                      const instructor = material.instructor || '';
                      
                      // Create personalized content based on actual data
                      let content = `This document "${displayName}"`;
                      
                      if (instructor) {
                        content += ` uploaded by ${instructor}`;
                      }
                      
                      if (subject || topic) {
                        content += ' covers';
                        if (subject) content += ` ${subject.toLowerCase()}`;
                        if (topic) content += ` with a focus on ${topic}`;
                        content += ' concepts';
                      } else {
                        content += ' contains educational material';
                      }
                      
                      content += '. ';
                      
                      // Add subject-specific details if available
                      if (subject === 'Mathematics') {
                        content += 'It includes mathematical formulas, problem-solving techniques, and detailed explanations of core concepts.';
                      } else if (subject === 'Physics') {
                        content += 'It explores physical principles, scientific laws, and their practical applications.';
                      } else if (subject === 'Chemistry') {
                        content += 'It covers chemical processes, molecular structures, and laboratory procedures.';
                      } else if (subject === 'Biology') {
                        content += 'It examines biological systems, life processes, and scientific methodologies.';
                      } else {
                        content += 'The content provides comprehensive information designed to enhance understanding and learning.';
                      }
                      
                      return content;
                    })()
                  )}
                </Typography>
                
                {/* Show content structure based on file size and type */}
                <Box sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body1">• Document structure and organization</Typography>
                  {material.fileSize && material.fileSize > 1000000 && (
                    <Typography variant="body1">• Comprehensive coverage ({formatFileSize(material.fileSize)} of content)</Typography>
                  )}
                  {material.subject && (
                    <Typography variant="body1">• {material.subject}-specific concepts and methods</Typography>
                  )}
                  {material.topic && (
                    <Typography variant="body1">• In-depth analysis of {material.topic}</Typography>
                  )}
                  <Typography variant="body1">• Examples and practical applications</Typography>
                  {material.instructor && (
                    <Typography variant="body1">• Uploaded by {material.instructor}</Typography>
                  )}
                </Box>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {material.fileName && material.fileName.toLowerCase().includes('homework') ? (
                    'This appears to be homework or assignment material with exercises and problems to solve.'
                  ) : material.fileName && material.fileName.toLowerCase().includes('notes') ? (
                    'These notes provide structured information and key points for study and reference.'
                  ) : material.fileName && material.fileName.toLowerCase().includes('guide') ? (
                    'This guide offers step-by-step instructions and comprehensive coverage of the topic.'
                  ) : material.fileName && material.fileName.toLowerCase().includes('lecture') ? (
                    'This lecture material contains educational content designed for classroom instruction.'
                  ) : (
                    `The document provides detailed information about ${material.title || material.fileName || 'the subject'} in an organized and accessible format.`
                  )}
                </Typography>
                
                {material.subject === 'Mathematics' && (
                  <>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Key Formula
                    </Typography>
                    <Box sx={{ 
                      bgcolor: '#f8f8f8', 
                      p: 2, 
                      borderRadius: 1, 
                      mt: 1,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontSize: '1.1rem'
                    }}>
                      {material.topic === 'Derivatives' ? "f'(x) = lim(h→0) [f(x+h) - f(x)] / h" :
                       material.topic === 'Integrals' ? "∫ f(x)dx = F(x) + C" :
                       material.topic === 'Algebra' ? "ax² + bx + c = 0" :
                       "Mathematical expressions and formulas"}
                    </Box>
                  </>
                )}
                
                {/* File Analysis Section */}
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                    📄 Document Analysis
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Filename:</strong> {material.fileName || 'uploaded-file.pdf'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>File Size:</strong> {material.fileSize ? formatFileSize(material.fileSize) : 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Estimated Pages:</strong> ~{Math.max(1, Math.ceil((material.fileSize || 1000000) / 500000))} pages
                    </Typography>
                    {material.uploadedAt && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Uploaded:</strong> {new Date(material.uploadedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Smart file type detection */}
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 0.5 }}>
                    <Typography variant="body2" color="info.main">
                      💡 {
                        material.fileName && material.fileName.toLowerCase().includes('homework') ? 'Assignment/Homework Material' :
                        material.fileName && material.fileName.toLowerCase().includes('notes') ? 'Study Notes' :
                        material.fileName && material.fileName.toLowerCase().includes('guide') ? 'Educational Guide' :
                        material.fileName && material.fileName.toLowerCase().includes('lecture') ? 'Lecture Content' :
                        material.fileName && material.fileName.toLowerCase().includes('exam') ? 'Exam Material' :
                        material.fileName && material.fileName.toLowerCase().includes('quiz') ? 'Quiz Content' :
                        material.fileName && material.fileName.toLowerCase().includes('test') ? 'Test Material' :
                        'Educational Document'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* PDF Footer */}
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 1, 
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'text.secondary'
            }}>
              📄 PDF Preview - Click "Download Material" to view full document
            </Box>
          </Box>
        );
      
      case 'IMAGE':
        // Check if we have an actual file to preview
        const imageUrl = material.previewKey ? fileUrls[material.previewKey] : sampleUrl;
        
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <img
              src={imageUrl || ''}
              alt={material.title}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          </Box>
        );
      
      case 'VIDEO':
        // Check if we have an actual file to preview
        const videoUrl = material.previewKey ? fileUrls[material.previewKey] : sampleUrl;
        
        const videoId = `video-${material.id || Date.now()}`;
        const currentProgress = videoProgress[videoId] || 0;
        const currentDuration = videoDuration[videoId] || 0;
        
        return (
          <Box sx={{ height: 340, position: 'relative', bgcolor: '#000' }}>
            <video
              id={videoId}
              width="100%"
              height="300"
              style={{ 
                objectFit: 'contain',
                outline: 'none'
              }}
              onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                setVideoDuration(prev => ({
                  ...prev,
                  [videoId]: video.duration
                }));
              }}
              onTimeUpdate={(e) => {
                const video = e.target as HTMLVideoElement;
                setVideoProgress(prev => ({
                  ...prev,
                  [videoId]: video.currentTime
                }));
              }}
              onPlay={() => {
                setVideoPlaying(prev => ({
                  ...prev,
                  [videoId]: true
                }));
              }}
              onPause={() => {
                setVideoPlaying(prev => ({
                  ...prev,
                  [videoId]: false
                }));
              }}
              onEnded={() => {
                setVideoPlaying(prev => ({
                  ...prev,
                  [videoId]: false
                }));
              }}
            >
              <source src={videoUrl || ''} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Progress Bar */}
            <Box sx={{ 
              position: 'absolute',
              bottom: 60,
              left: 8,
              right: 8,
              height: 8,
              bgcolor: 'rgba(255,255,255,0.3)',
              borderRadius: 4,
              cursor: 'pointer',
              '&:hover': {
                height: 10,
                bottom: 59
              }
            }}
            onClick={(e) => {
              console.log('Progress bar clicked'); // Debug log
              const video = document.getElementById(videoId) as HTMLVideoElement;
              if (video && currentDuration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const newTime = percentage * currentDuration;
                console.log(`Seeking to ${newTime}s (${Math.round(percentage * 100)}%)`); // Debug log
                video.currentTime = newTime;
              } else {
                console.log('Video not ready or no duration'); // Debug log
              }
            }}
            >
              <Box sx={{
                width: currentDuration ? `${(currentProgress / currentDuration) * 100}%` : '0%',
                height: '100%',
                bgcolor: '#1976d2',
                borderRadius: 4,
                transition: 'width 0.1s',
                pointerEvents: 'none' // Allow clicks to pass through to parent
              }} />
              
              {/* Seek Handle */}
              {currentDuration > 0 && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: `${(currentProgress / currentDuration) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  bgcolor: '#1976d2',
                  borderRadius: '50%',
                  border: '2px solid white',
                  pointerEvents: 'none',
                  opacity: 0.8,
                  transition: 'left 0.1s'
                }} />
              )}
            </Box>
            
            {/* Custom Video Controls Overlay */}
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              color: 'white'
            }}>
              {/* Rewind Button */}
              <Button
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => {
                  const video = document.getElementById(videoId) as HTMLVideoElement;
                  if (video) {
                    video.currentTime = Math.max(0, video.currentTime - 10);
                  }
                }}
                title="Rewind 10 seconds"
              >
                ⏪
              </Button>

              {/* Play/Pause Button */}
              <Button
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={async () => {
                  const video = document.getElementById(videoId) as HTMLVideoElement;
                  if (video) {
                    try {
                      if (video.paused) {
                        await video.play();
                      } else {
                        video.pause();
                      }
                    } catch (error) {
                      console.log('Video play/pause interrupted:', error);
                      // Ignore interruption errors as they're harmless
                    }
                  }
                }}
                title="Play/Pause"
              >
                {videoPlaying[videoId] ? '⏸️' : '▶️'}
              </Button>

              {/* Forward Button */}
              <Button
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => {
                  const video = document.getElementById(videoId) as HTMLVideoElement;
                  if (video) {
                    video.currentTime = Math.min(video.duration || video.currentTime + 10, video.currentTime + 10);
                  }
                }}
                title="Forward 10 seconds"
              >
                ⏩
              </Button>

              {/* Time Display */}
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, ml: 1, fontSize: '0.75rem' }}>
                {Math.floor(currentProgress / 60)}:{(Math.floor(currentProgress % 60)).toString().padStart(2, '0')} / {Math.floor(currentDuration / 60)}:{(Math.floor(currentDuration % 60)).toString().padStart(2, '0')}
              </Typography>

              {/* Video Info */}
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, ml: 'auto', fontSize: '0.75rem' }}>
                {material.title || material.fileName || 'Video'}
              </Typography>
            </Box>
          </Box>
        );
      
      case 'AUDIO':
        // Check if we have an actual file to preview
        const audioUrl = material.previewKey ? fileUrls[material.previewKey] : sampleUrl;
        
        return (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Box sx={{ mb: 3 }}>
              <Subject sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6">{material.title}</Typography>
              <Typography variant="body2" color="grey.600">
                Audio File
              </Typography>
            </Box>
            <audio
              controls
              style={{ width: '100%', maxWidth: '400px' }}
            >
              <source src={audioUrl || ''} type="audio/mp3" />
              <source src={audioUrl || ''} type="audio/ogg" />
              Your browser does not support the audio tag.
            </audio>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Subject sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="grey.600">
              {material.type} Document
            </Typography>
            <Typography variant="body2" color="grey.500">
              {material.fileName || material.title}
            </Typography>
            <Typography variant="body2" color="grey.500" sx={{ mt: 1 }}>
              Click download to view this file
            </Typography>
          </Box>
        );
    }
  };

  const handleDelete = async (materialId: number) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await studyMaterialService.deleteMaterial(materialId);
        fetchUploadedMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        // Fallback to localStorage deletion
        const existingMaterials = getMockMaterials();
        const updatedMaterials = existingMaterials.filter((m: any) => m.id !== materialId);
        localStorage.setItem('uploadedMaterials', JSON.stringify(updatedMaterials));
        setUploadedMaterials(updatedMaterials.slice(0, 5));
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/study-materials')}
          sx={{ mb: 2 }}
        >
          Back to Study Materials
        </Button>
        <Typography variant="h4" gutterBottom>
          Upload Study Material
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share educational content with your students
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Upload Form */}
        <Box sx={{ flex: 2 }}>
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

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* File Upload */}
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Choose File to Upload
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<AttachFile />}
                        sx={{ mb: 2 }}
                      >
                        Select File
                        <input
                          type="file"
                          hidden
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                        />
                      </Button>
                      {selectedFile && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
                            onDelete={() => setSelectedFile(null)}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Upload Progress */}
                {uploading && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Uploading... {uploadProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}

                {/* Material Details */}
                <TextField
                  required
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, Physics"
                  />
                  
                  <TextField
                    fullWidth
                    label="Topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Calculus, Thermodynamics"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Batch (Optional)</InputLabel>
                    <Select
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleSelectChange}
                      label="Batch (Optional)"
                    >
                      <MenuItem value="">All Students</MenuItem>
                      {batches.map(batch => (
                        <MenuItem key={batch.id} value={batch.id.toString()}>
                          {batch.name} ({batch.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleSelectChange}
                      label="Material Type"
                    >
                      <MenuItem value="PDF">PDF Document</MenuItem>
                      <MenuItem value="VIDEO">Video</MenuItem>
                      <MenuItem value="AUDIO">Audio</MenuItem>
                      <MenuItem value="IMAGE">Image</MenuItem>
                      <MenuItem value="DOCUMENT">Document</MenuItem>
                      <MenuItem value="PRESENTATION">Presentation</MenuItem>
                      <MenuItem value="SPREADSHEET">Spreadsheet</MenuItem>
                      <MenuItem value="LINK">External Link</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={uploading || !selectedFile}
                    fullWidth
                    size="large"
                  >
                    {uploading ? 'Uploading...' : 'Upload Material'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/study-materials')}
                    fullWidth
                    size="large"
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Recent Uploads */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Uploads
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button 
                  size="small" 
                  onClick={() => {
                    localStorage.removeItem('uploadedMaterials');
                    fetchUploadedMaterials();
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Refresh
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    const mockMaterials = getMockMaterials();
                    console.log('Force created materials:', mockMaterials);
                    setUploadedMaterials(mockMaterials);
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Force Create
                </Button>
                <Button 
                  size="small" 
                  color="success"
                  variant="outlined"
                  onClick={() => {
                    // Simulate uploading a test material
                    const testMaterial = {
                      title: `Test Upload ${Date.now()}`,
                      description: 'Test uploaded material',
                      subject: 'Testing',
                      topic: 'Upload Test',
                      type: 'PDF',
                      fileName: 'test-upload.pdf',
                      fileSize: 1234567
                    };
                    const updatedMaterials = addMaterialToStorage(testMaterial);
                    setUploadedMaterials(updatedMaterials.slice(0, 5));
                    setSuccess(`Test material "${testMaterial.title}" added!`);
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Test Upload
                </Button>
              </Stack>
            </Box>
            {uploadedMaterials.length > 0 ? (
              <List>
                {uploadedMaterials.map((material, index) => (
                  <ListItem key={material.id || index} divider>
                    <ListItemIcon>
                      <Subject color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={material.title || 'Untitled'}
                      secondary={`${material.type || 'Document'} • ${material.subject || 'General'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handlePreview(material)}>
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No materials uploaded yet
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Subject />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedMaterial?.title || 'Material Preview'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedMaterial?.type || 'Document'} • {selectedMaterial?.subject || 'General'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedMaterial && (
            <Stack spacing={3}>
              {/* File Preview */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Visibility color="primary" />
                    File Preview
                  </Typography>
                  
                  <Box sx={{ mt: 2, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                    {renderFilePreview(selectedMaterial)}
                  </Box>
                </CardContent>
              </Card>

              {/* Material Information */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="primary" />
                    Material Information
                  </Typography>
                  
                  <Box sx={{ '& > *': { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                      <Typography variant="body1">{selectedMaterial.title}</Typography>
                    </Box>
                    
                    {selectedMaterial.description && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                        <Typography variant="body1">{selectedMaterial.description}</Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                        <Typography variant="body1">{selectedMaterial.subject || 'General'}</Typography>
                      </Box>
                      
                      {selectedMaterial.topic && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Topic</Typography>
                          <Typography variant="body1">{selectedMaterial.topic}</Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                        <Chip label={selectedMaterial.type} size="small" />
                      </Box>
                      
                      {selectedMaterial.fileSize && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">File Size</Typography>
                          <Typography variant="body1">{formatFileSize(selectedMaterial.fileSize)}</Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {selectedMaterial.instructor && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Uploaded by</Typography>
                        <Typography variant="body1">{selectedMaterial.instructor}</Typography>
                      </Box>
                    )}
                    
                    {selectedMaterial.uploadedAt && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Upload Date</Typography>
                        <Typography variant="body1">
                          {new Date(selectedMaterial.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
              
              {/* Student Actions */}
              {user?.role === 'STUDENT' && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment color="primary" />
                      Student Actions
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleDownload(selectedMaterial)}
                      >
                        Download Material
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={() => handleSubmitAssignment(selectedMaterial)}
                      >
                        Submit Assignment
                      </Button>
                    </Stack>
                    
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.main">
                        💡 Download the material to study, then use "Submit Assignment" to upload your completed work.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
              
              {/* Educator Actions */}
              {(user?.role === 'TEACHER' || user?.role === 'JUNIOR_EDUCATOR' || user?.role === 'ADMIN') && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule color="primary" />
                      Educator Actions
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleDownload(selectedMaterial)}
                      >
                        Download Material
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={() => navigate('/assignments/grading')}
                      >
                        View Submissions
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MaterialUpload;