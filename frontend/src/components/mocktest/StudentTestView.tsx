import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  Timer,
  Warning,
  Visibility,
  VisibilityOff,
  Fullscreen,
  FullscreenExit,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import mockTestService from '../../services/mockTestService';

interface StudentTestViewProps {
  testId: number;
  onTestSubmit: () => void;
}

interface ProctoringState {
  webcamActive: boolean;
  screenRecordingActive: boolean;
  tabSwitches: number;
  violations: string[];
  isFullscreen: boolean;
  lastActivity: Date;
}

const StudentTestView: React.FC<StudentTestViewProps> = ({ testId, onTestSubmit }) => {
  const { user } = useAuth();
  const [testData, setTestData] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testStarted, setTestStarted] = useState(false);
  const [proctoringConsent, setProctoringConsent] = useState(false);
  const [proctoringState, setProctoringState] = useState<ProctoringState>({
    webcamActive: false,
    screenRecordingActive: false,
    tabSwitches: 0,
    violations: [],
    isFullscreen: false,
    lastActivity: new Date()
  });
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  
  const webcamRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    loadTestData();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, [testId]);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const loadTestData = async () => {
    try {
      const test = await mockTestService.getMockTestById(testId);
      setTestData(test);
      setTimeRemaining(test.duration * 60);
    } catch (error) {
      console.error('Failed to load test data:', error);
    }
  };

  const setupEventListeners = () => {
    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted) {
        handleViolation('tab_switch', 'Switched to another tab');
      }
      updateLastActivity();
    };

    // Window blur detection
    const handleWindowBlur = () => {
      if (testStarted) {
        handleViolation('window_blur', 'Window lost focus');
      }
    };

    // Right-click prevention
    const handleRightClick = (e: MouseEvent) => {
      if (testStarted) {
        e.preventDefault();
        handleViolation('right_click', 'Attempted right-click');
      }
    };

    // Copy/Paste prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      if (testStarted && (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      )) {
        e.preventDefault();
        handleViolation('copy_paste', 'Attempted prohibited key combination');
      }
    };

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setProctoringState(prev => ({ ...prev, isFullscreen }));
      
      if (!isFullscreen && testStarted && testData?.isProctored) {
        handleViolation('fullscreen_exit', 'Exited fullscreen mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  };

  const handleViolation = (type: string, description: string) => {
    setProctoringState(prev => {
      const newViolations = [...prev.violations, description];
      const newTabSwitches = type === 'tab_switch' ? prev.tabSwitches + 1 : prev.tabSwitches;
      
      // Check if tab switch limit exceeded
      if (newTabSwitches >= (testData?.proctoringSettings?.tabSwitchLimit || 3)) {
        setTestBlocked(true);
        setShowViolationWarning(true);
      } else if (newViolations.length % 3 === 0) {
        setShowViolationWarning(true);
      }
      
      return {
        ...prev,
        violations: newViolations,
        tabSwitches: newTabSwitches
      };
    });
  };

  const updateLastActivity = () => {
    setProctoringState(prev => ({ ...prev, lastActivity: new Date() }));
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      mediaStreamRef.current = stream;
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      
      setProctoringState(prev => ({ ...prev, webcamActive: true }));
    } catch (error) {
      console.error('Failed to start webcam:', error);
      alert('Webcam access is required for this proctored test');
    }
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setProctoringState(prev => ({ ...prev, isFullscreen: true }));
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const handleStartTest = async () => {
    if (!proctoringConsent && testData?.isProctored) {
      alert('You must consent to proctoring to start this test');
      return;
    }
    
    try {
      await mockTestService.startMockTest(testId);
      
      if (testData?.isProctored) {
        if (testData.proctoringSettings?.enableWebcam) {
          await startWebcam();
        }
        
        await enterFullscreen();
      }
      
      setTestStarted(true);
      startTimeRef.current = new Date();
      
    } catch (error) {
      console.error('Failed to start test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  const handleSubmitTest = async () => {
    try {
      const submissionData = {
        startTime: startTimeRef.current,
        endTime: new Date(),
        violations: proctoringState.violations,
        tabSwitches: proctoringState.tabSwitches
      };
      
      await mockTestService.submitMockTest(testId);
      cleanup();
      onTestSubmit();
      
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!testData) {
    return (
      <Container>
        <LinearProgress />
        <Typography>Loading test...</Typography>
      </Container>
    );
  }

  if (testBlocked) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Test Access Blocked
          </Typography>
          <Typography>
            Your test has been blocked due to multiple violations of the test guidelines.
            Please contact your instructor.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!testStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {testData.title}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {testData.description}
            </Typography>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Test Information:</Typography>
              <Typography>Duration: {testData.duration} minutes</Typography>
              <Typography>Total Marks: {testData.totalMarks}</Typography>
              <Typography>Total Questions: {testData.totalQuestions || 'N/A'}</Typography>
            </Box>
            
            {testData.instructions && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Instructions:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {testData.instructions}
                </Typography>
              </Box>
            )}
            
            {testData.isProctored && (
              <Box mb={3}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    This is a Proctored Test
                  </Typography>
                  <Typography variant="body2">
                    • Webcam monitoring will be enabled throughout the test
                    • Screen recording will be active
                    • Tab switching is limited to {testData.proctoringSettings?.tabSwitchLimit || 3} times
                    • Any violations will be recorded and may result in test termination
                    • The test must be taken in fullscreen mode
                  </Typography>
                </Alert>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <input
                    type="checkbox"
                    id="proctoring-consent"
                    checked={proctoringConsent}
                    onChange={(e) => setProctoringConsent(e.target.checked)}
                  />
                  <label htmlFor="proctoring-consent">
                    <Typography>
                      I consent to proctoring and understand the test guidelines
                    </Typography>
                  </label>
                </Box>
              </Box>
            )}
            
            <Button
              variant="contained"
              size="large"
              onClick={handleStartTest}
              disabled={testData.isProctored && !proctoringConsent}
              fullWidth
            >
              Start Test
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header with timer and status */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, position: 'sticky', top: 0, zIndex: 1000 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{testData.title}</Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
            {proctoringState.tabSwitches > 0 && (
              <Chip
                icon={<Warning />}
                label={`Tab switches: ${proctoringState.tabSwitches}/${testData.proctoringSettings?.tabSwitchLimit || 3}`}
                color={proctoringState.tabSwitches >= (testData.proctoringSettings?.tabSwitchLimit || 3) ? 'error' : 'warning'}
                size="small"
              />
            )}
            
            <Chip
              icon={<Timer />}
              label={formatTime(timeRemaining)}
              color={timeRemaining < 300 ? 'error' : 'primary'}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitTest}
            >
              Submit Test
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Proctoring indicators */}
      {testData.isProctored && (
        <Box display="flex" gap={1} mb={2}>
          <Chip
            icon={proctoringState.webcamActive ? <Visibility /> : <VisibilityOff />}
            label="Webcam"
            color={proctoringState.webcamActive ? 'success' : 'error'}
            size="small"
          />
          <Chip
            icon={proctoringState.isFullscreen ? <Fullscreen /> : <FullscreenExit />}
            label="Fullscreen"
            color={proctoringState.isFullscreen ? 'success' : 'error'}
            size="small"
          />
          <Chip
            icon={<Lock />}
            label="Proctored"
            color="info"
            size="small"
          />
        </Box>
      )}

      {/* Hidden webcam video element for proctoring */}
      {testData.isProctored && testData.proctoringSettings?.enableWebcam && (
        <video
          ref={webcamRef}
          autoPlay
          muted
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: '150px',
            height: '100px',
            borderRadius: '8px',
            border: '2px solid #ccc',
            zIndex: 1000
          }}
        />
      )}

      {/* Test content area */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Question 1 of {testData.totalQuestions || 10}
          </Typography>
          
          <Typography variant="body1" paragraph>
            This is a sample question. In a real implementation, questions would be loaded
            from the backend and displayed here with proper answer options.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            [Question content and options would be rendered here based on test data]
          </Typography>
        </CardContent>
      </Card>

      {/* Violation Warning Dialog */}
      <Dialog open={showViolationWarning} onClose={() => setShowViolationWarning(false)}>
        <DialogTitle>
          <Warning color="error" sx={{ mr: 1 }} />
          Test Violation Warning
        </DialogTitle>
        <DialogContent>
          <Typography>
            You have committed test violations. Please adhere to the test guidelines.
            Continued violations may result in test termination.
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle2">Recent violations:</Typography>
            {proctoringState.violations.slice(-3).map((violation, index) => (
              <Typography key={index} variant="body2">
                • {violation}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViolationWarning(false)} variant="contained">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentTestView;