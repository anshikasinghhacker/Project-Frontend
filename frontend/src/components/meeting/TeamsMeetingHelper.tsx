import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
  Link,
  Tabs,
  Tab,
} from '@mui/material';
import {
  VideoCall,
  Videocam,
  VolumeUp,
  Settings,
  Computer,
  Refresh,
  CheckCircle,
  Error,
  Info,
  People,
  Help,
} from '@mui/icons-material';
import LiveAttendees from './LiveAttendees';

interface TeamsMeetingHelperProps {
  open: boolean;
  onClose: () => void;
  meetingLink?: string;
  meetingId?: string;
}

const TeamsMeetingHelper: React.FC<TeamsMeetingHelperProps> = ({
  open,
  onClose,
  meetingLink,
  meetingId
}) => {
  const [troubleshootingStep, setTroubleshootingStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const troubleshootingSteps = [
    {
      title: "Camera Permissions",
      icon: <Videocam />,
      description: "Ensure Teams has camera access",
      solutions: [
        "Click the camera icon in Teams to enable video",
        "Allow camera permissions when prompted by browser",
        "Check browser settings → Privacy → Camera → Allow Teams",
        "Try refreshing the page and rejoin the meeting"
      ]
    },
    {
      title: "Browser Compatibility",
      icon: <Computer />,
      description: "Use a supported browser",
      solutions: [
        "Use Chrome, Edge, or Firefox for best compatibility",
        "Clear browser cache and cookies",
        "Disable browser extensions that might block camera",
        "Try incognito/private browsing mode"
      ]
    },
    {
      title: "Hardware Check",
      icon: <Settings />,
      description: "Verify camera hardware",
      solutions: [
        "Test camera in other apps (Zoom, camera app, etc.)",
        "Check if camera is being used by another application",
        "Update camera drivers if on Windows",
        "Try a different camera if you have multiple"
      ]
    },
    {
      title: "Teams App vs Browser",
      icon: <VideoCall />,
      description: "Try different access methods",
      solutions: [
        "If using browser, try Teams desktop app",
        "If using app, try joining through browser",
        "Download latest Teams app version",
        "Restart Teams application completely"
      ]
    }
  ];

  const handleTestCamera = () => {
    // This would open camera test dialog
    window.open('https://www.onlinemictest.com/webcam-test/', '_blank');
  };

  const handleJoinMeeting = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VideoCall color="primary" />
          <Box>
            <Typography variant="h6">Teams Meeting Helper</Typography>
            <Typography variant="body2" color="text.secondary">
              Troubleshoot video and audio issues
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab icon={<People />} label="Live Attendees" />
          <Tab icon={<Help />} label="Troubleshooting" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Meeting Attendees
              </Typography>
              {meetingId ? (
                <LiveAttendees meetingId={meetingId} />
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    Meeting ID required to show live attendees
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Having trouble with video in your Teams meeting? Follow these troubleshooting steps.
                </Typography>
              </Alert>

              {meetingLink && (
                <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Meeting Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {meetingId && (
                        <Typography variant="body2">
                          <strong>Meeting ID:</strong> {meetingId}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VideoCall />}
                          onClick={handleJoinMeeting}
                          sx={{ bgcolor: '#6264A7', '&:hover': { bgcolor: '#5A5A8A' } }}
                        >
                          Join Meeting
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Videocam />}
                          onClick={handleTestCamera}
                        >
                          Test Camera
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Typography variant="h6" gutterBottom>
                Troubleshooting Steps
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {troubleshootingSteps.map((step, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {step.icon}
                        <Box>
                          <Typography variant="subtitle1">{step.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <List dense>
                        {step.solutions.map((solution, solutionIndex) => (
                          <ListItem key={solutionIndex} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={solution}
                              sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Quick Fixes
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        🔄 Refresh & Retry
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Close the meeting, refresh browser, and rejoin
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        📞 Audio Only
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Join audio-only first, then enable video once connected
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Still having issues?</strong> Contact your IT support or try joining from a different device.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {meetingLink && (
          <Button 
            variant="contained" 
            onClick={handleJoinMeeting}
            startIcon={<VideoCall />}
          >
            Try Joining Meeting
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TeamsMeetingHelper;