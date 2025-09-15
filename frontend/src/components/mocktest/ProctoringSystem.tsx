import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  VideoCall,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Warning,
  Person,
  Close,
  Visibility,
  Tab,
  Security,
  Timer,
  Block
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import mockTestService from '../../services/mockTestService';

interface StudentSession {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'disconnected' | 'suspicious' | 'violation';
  startTime: Date;
  lastActivity: Date;
  tabSwitches: number;
  violations: Violation[];
  webcamEnabled: boolean;
  screenShareEnabled: boolean;
}

interface Violation {
  id: number;
  type: 'tab_switch' | 'window_blur' | 'copy_paste' | 'right_click' | 'fullscreen_exit';
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface ProctoringSystemProps {
  testId: number;
  onClose: () => void;
}

const ProctoringSystem: React.FC<ProctoringSystemProps> = ({ testId, onClose }) => {
  const { user } = useAuth();
  const [testInfo, setTestInfo] = useState<any>(null);
  const [students, setStudents] = useState<StudentSession[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [proctoringSettings, setProctoringSettings] = useState({
    webcamMonitoring: true,
    screenCapture: true,
    tabSwitchLimit: 3,
    autoBlock: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadTestInfo();
    startProctoringSession();
    const interval = setInterval(updateStudentStatuses, 5000);
    
    return () => {
      clearInterval(interval);
      stopProctoring();
    };
  }, [testId]);

  const loadTestInfo = async () => {
    try {
      const test = await mockTestService.getMockTestById(testId);
      setTestInfo(test);
      
      // Initialize mock student sessions
      const mockStudents: StudentSession[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@student.com',
          status: 'active',
          startTime: new Date(),
          lastActivity: new Date(),
          tabSwitches: 1,
          violations: [],
          webcamEnabled: true,
          screenShareEnabled: false
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@student.com',
          status: 'suspicious',
          startTime: new Date(Date.now() - 600000),
          lastActivity: new Date(Date.now() - 30000),
          tabSwitches: 4,
          violations: [
            {
              id: 1,
              type: 'tab_switch',
              timestamp: new Date(Date.now() - 120000),
              description: 'Exceeded tab switch limit',
              severity: 'high'
            }
          ],
          webcamEnabled: false,
          screenShareEnabled: true
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike@student.com',
          status: 'active',
          startTime: new Date(Date.now() - 300000),
          lastActivity: new Date(),
          tabSwitches: 0,
          violations: [],
          webcamEnabled: true,
          screenShareEnabled: true
        }
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to load test info:', error);
    }
  };

  const startProctoringSession = async () => {
    try {
      await mockTestService.startProctoring(testId);
      
      if (proctoringSettings.screenCapture) {
        await startScreenRecording();
      }
      
      addAlert('Proctoring session started successfully');
    } catch (error) {
      console.error('Failed to start proctoring:', error);
      addAlert('Failed to start proctoring session');
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      screenStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenRecording();
      };
      
    } catch (error) {
      console.error('Failed to start screen recording:', error);
      addAlert('Screen recording failed to start');
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  };

  const updateStudentStatuses = () => {
    // Simulate real-time updates
    setStudents(prev => prev.map(student => {
      const timeSinceLastActivity = Date.now() - student.lastActivity.getTime();
      
      if (timeSinceLastActivity > 120000) {
        return { ...student, status: 'disconnected' };
      }
      
      // Randomly simulate violations for demo
      if (Math.random() < 0.1 && student.violations.length < 3) {
        const newViolation: Violation = {
          id: Date.now(),
          type: 'window_blur',
          timestamp: new Date(),
          description: 'Window lost focus',
          severity: 'medium'
        };
        
        return {
          ...student,
          status: 'suspicious',
          violations: [...student.violations, newViolation]
        };
      }
      
      return student;
    }));
  };

  const addAlert = (message: string) => {
    setAlerts(prev => [...prev.slice(-4), message]);
  };

  const handleBlockStudent = (studentId: number) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, status: 'violation' }
        : student
    ));
    addAlert(`Student ${students.find(s => s.id === studentId)?.name} has been blocked`);
  };

  const handleViewStudent = (student: StudentSession) => {
    setSelectedStudent(student);
  };

  const stopProctoring = () => {
    stopScreenRecording();
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspicious': return 'warning';
      case 'violation': return 'error';
      case 'disconnected': return 'default';
      default: return 'default';
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'tab_switch': return <Tab />;
      case 'window_blur': return <Visibility />;
      case 'copy_paste': return <Security />;
      case 'right_click': return <Block />;
      case 'fullscreen_exit': return <StopScreenShare />;
      default: return <Warning />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Proctoring: {testInfo?.title}
        </Typography>
        <Box>
          <Chip 
            icon={<Timer />}
            label={`${students.filter(s => s.status === 'active').length} Active`}
            color="success"
            sx={{ mr: 1 }}
          />
          <Button variant="outlined" color="error" onClick={onClose}>
            End Proctoring
          </Button>
        </Box>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Proctoring Controls</Typography>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControlLabel
              control={
                <Switch
                  checked={proctoringSettings.webcamMonitoring}
                  onChange={(e) => setProctoringSettings(prev => ({
                    ...prev,
                    webcamMonitoring: e.target.checked
                  }))}
                />
              }
              label="Webcam Monitoring"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={isRecording}
                  onChange={(e) => e.target.checked ? startScreenRecording() : stopScreenRecording()}
                />
              }
              label="Screen Recording"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={proctoringSettings.autoBlock}
                  onChange={(e) => setProctoringSettings(prev => ({
                    ...prev,
                    autoBlock: e.target.checked
                  }))}
                />
              }
              label="Auto-block Violations"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Recent Activity:</Typography>
          {alerts.map((alert, index) => (
            <Typography key={index} variant="body2">• {alert}</Typography>
          ))}
        </Alert>
      )}

      {/* Student Grid */}
      <Grid container spacing={2}>
        {students.map((student) => (
          // @ts-ignore
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6">{student.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={student.status.toUpperCase()}
                    color={getStatusColor(student.status) as any}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Timer fontSize="small" />
                  <Typography variant="body2">
                    Started: {student.startTime.toLocaleTimeString()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Tab fontSize="small" />
                  <Typography variant="body2">
                    Tab switches: {student.tabSwitches}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  {student.webcamEnabled ? (
                    <VideoCall color="success" fontSize="small" />
                  ) : (
                    <VideocamOff color="disabled" fontSize="small" />
                  )}
                  {student.screenShareEnabled ? (
                    <ScreenShare color="success" fontSize="small" />
                  ) : (
                    <StopScreenShare color="disabled" fontSize="small" />
                  )}
                </Box>

                {student.violations.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    <Badge badgeContent={student.violations.length} color="error">
                      <Warning />
                    </Badge>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {student.violations.length} violation(s)
                    </Typography>
                  </Alert>
                )}

                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewStudent(student)}
                    startIcon={<Visibility />}
                  >
                    View
                  </Button>
                  {student.status !== 'violation' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleBlockStudent(student.id)}
                      startIcon={<Block />}
                    >
                      Block
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Student Detail Dialog */}
      <Dialog
        open={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details: {selectedStudent?.name}
          <IconButton
            onClick={() => setSelectedStudent(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Typography variant="h6" gutterBottom>Session Information</Typography>
              <Typography>Email: {selectedStudent.email}</Typography>
              <Typography>Status: {selectedStudent.status}</Typography>
              <Typography>Start Time: {selectedStudent.startTime.toLocaleString()}</Typography>
              <Typography>Last Activity: {selectedStudent.lastActivity.toLocaleString()}</Typography>
              <Typography>Tab Switches: {selectedStudent.tabSwitches}</Typography>

              {selectedStudent.violations.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>Violations</Typography>
                  <List>
                    {selectedStudent.violations.map((violation) => (
                      <ListItem key={violation.id}>
                        <ListItemIcon>
                          {getViolationIcon(violation.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={violation.description}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {violation.timestamp.toLocaleString()}
                              </Typography>
                              <Chip
                                label={violation.severity.toUpperCase()}
                                color={
                                  violation.severity === 'high' ? 'error' :
                                  violation.severity === 'medium' ? 'warning' : 'default'
                                }
                                size="small"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Box mt={3}>
                <Typography variant="h6" gutterBottom>Actions</Typography>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" color="warning">
                    Send Warning
                  </Button>
                  <Button variant="outlined" color="error">
                    Block Student
                  </Button>
                  <Button variant="outlined">
                    Export Report
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ProctoringSystem;