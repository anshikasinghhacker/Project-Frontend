import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  LinearProgress
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  VideoCall,
  ScreenShare,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  StopCircle,
  PlayCircle,
  People,
  Chat,
  PresentToAll,
  CloudUpload,
  Timer,
  RadioButtonChecked,
  Assignment,
  QuestionAnswer,
  ContentCopy,
  ExitToApp
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import lectureService from '../../services/lectureService';

const LectureStart: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lectureData, setLectureData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const loadLecture = async () => {
      if (id) {
        try {
          const lecture = await lectureService.getLectureById(parseInt(id));
          setLectureData({
            id: lecture.id,
            title: lecture.title,
            subject: lecture.description || 'General',
            date: lecture.lectureDate,
            time: lecture.startTime ? new Date(lecture.startTime).toLocaleTimeString() : '10:00 AM',
            duration: lecture.duration || 60,
            type: lecture.type === 'LIVE' ? 'Live' : 'Recorded',
            location: lecture.meetingLink || 'Online',
            meetingLink: lecture.meetingLink,
            description: lecture.description || 'Lecture description not available'
          });
        } catch (error) {
          console.error('Failed to load lecture:', error);
          // Mock data if API fails
          setLectureData({
            id: id,
            title: 'Introduction to Calculus',
            subject: 'Mathematics',
            date: new Date().toISOString().split('T')[0],
            time: '10:00 AM',
            duration: 60,
            type: 'Live',
            location: 'Online - Zoom',
            meetingLink: 'https://zoom.us/j/123456789',
            description: 'This lecture covers the fundamental concepts of calculus including limits, derivatives, and basic integration.'
          });
        }
      }
    };

    loadLecture();

    // Mock attendees
    setAttendees([
      { id: 1, name: 'John Smith', status: 'online', joinedAt: '10:02 AM' },
      { id: 2, name: 'Sarah Johnson', status: 'online', joinedAt: '10:00 AM' },
      { id: 3, name: 'Mike Williams', status: 'online', joinedAt: '10:03 AM' },
      { id: 4, name: 'Emma Davis', status: 'online', joinedAt: '10:01 AM' },
      { id: 5, name: 'James Brown', status: 'away', joinedAt: '10:00 AM' }
    ]);

    // Mock chat messages
    setChatMessages([
      { id: 1, sender: 'Sarah Johnson', message: 'Good morning!', time: '10:00 AM' },
      { id: 2, sender: 'Emma Davis', message: 'Ready for the lecture', time: '10:01 AM' },
      { id: 3, sender: 'John Smith', message: 'Can you share the presentation?', time: '10:02 AM' }
    ]);
  }, [id]);

  useEffect(() => {
    // Timer for elapsed time
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In real app, this would start actual recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // In real app, this would stop recording and save
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In real app, this would start/stop screen sharing
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          sender: user?.fullName || 'Teacher',
          message: newMessage,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewMessage('');
    }
  };

  const handleEndLecture = async () => {
    if (window.confirm('Are you sure you want to end this lecture?')) {
      try {
        if (lectureData && id) {
          await lectureService.updateLecture(parseInt(id), { ...lectureData, status: 'COMPLETED' });
        }
      } catch (error) {
        console.error('Failed to update lecture status:', error);
      }
      navigate('/dashboard/teacher');
    }
  };

  const copyMeetingLink = () => {
    if (lectureData?.meetingLink) {
      navigator.clipboard.writeText(lectureData.meetingLink);
    }
  };

  if (!lectureData) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" gutterBottom>
              {lectureData.title}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Chip 
                icon={<RadioButtonChecked />} 
                label="LIVE" 
                color="error" 
                size="small" 
              />
              <Chip
                icon={<Timer />}
                label={formatTime(elapsedTime)}
                color="primary"
                size="small"
              />
              <Chip
                icon={<People />}
                label={`${attendees.filter(a => a.status === 'online').length} Attendees`}
                size="small"
              />
              {isRecording && (
                <Chip
                  icon={<RadioButtonChecked />}
                  label="Recording"
                  color="error"
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToApp />}
            onClick={handleEndLecture}
          >
            End Lecture
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {/* Main Video/Content Area */}
        <Grid item xs={12} lg={9}>
          <Paper elevation={3} sx={{ height: '60vh', bgcolor: 'grey.900', position: 'relative' }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              color="white"
            >
              {isScreenSharing ? (
                <Box textAlign="center">
                  <PresentToAll sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6">Screen Sharing Active</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Your screen is being shared with attendees
                  </Typography>
                </Box>
              ) : (
                <Box textAlign="center">
                  {isVideoOn ? (
                    <>
                      <Videocam sx={{ fontSize: 64, mb: 2 }} />
                      <Typography variant="h6">Camera Active</Typography>
                    </>
                  ) : (
                    <>
                      <VideocamOff sx={{ fontSize: 64, mb: 2 }} />
                      <Typography variant="h6">Camera Off</Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* Control Bar */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bgcolor="rgba(0,0,0,0.8)"
              p={2}
              display="flex"
              justifyContent="center"
              gap={2}
            >
              <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                <IconButton
                  onClick={handleToggleMute}
                  sx={{ bgcolor: isMuted ? 'error.main' : 'grey.700', color: 'white' }}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </IconButton>
              </Tooltip>

              <Tooltip title={isVideoOn ? "Turn off camera" : "Turn on camera"}>
                <IconButton
                  onClick={handleToggleVideo}
                  sx={{ bgcolor: !isVideoOn ? 'error.main' : 'grey.700', color: 'white' }}
                >
                  {isVideoOn ? <Videocam /> : <VideocamOff />}
                </IconButton>
              </Tooltip>

              <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                <IconButton
                  onClick={handleScreenShare}
                  sx={{ bgcolor: isScreenSharing ? 'primary.main' : 'grey.700', color: 'white' }}
                >
                  <ScreenShare />
                </IconButton>
              </Tooltip>

              {!isRecording ? (
                <Tooltip title="Start recording">
                  <IconButton
                    onClick={handleStartRecording}
                    sx={{ bgcolor: 'grey.700', color: 'white' }}
                  >
                    <PlayCircle />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Stop recording">
                  <IconButton
                    onClick={handleStopRecording}
                    sx={{ bgcolor: 'error.main', color: 'white' }}
                  >
                    <StopCircle />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Upload material">
                <IconButton sx={{ bgcolor: 'grey.700', color: 'white' }}>
                  <CloudUpload />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Lecture Info */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lecture Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Subject: {lectureData.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled: {lectureData.date} at {lectureData.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {lectureData.duration} minutes
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {lectureData.meetingLink && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Meeting Link:
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                        {lectureData.meetingLink}
                      </Typography>
                      <IconButton size="small" onClick={copyMeetingLink}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Grid>
              </Grid>
              {lectureData.description && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Description:
                  </Typography>
                  <Typography variant="body2">
                    {lectureData.description}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3}>
          {/* Attendees */}
          <Paper elevation={3} sx={{ mb: 2, height: '35vh', overflow: 'auto' }}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Attendees ({attendees.length})
              </Typography>
              <List dense>
                {attendees.map((attendee) => (
                  <ListItem key={attendee.id}>
                    <ListItemIcon>
                      <Chip
                        size="small"
                        label={attendee.status === 'online' ? 'Online' : 'Away'}
                        color={attendee.status === 'online' ? 'success' : 'warning'}
                        sx={{ width: 60 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={attendee.name}
                      secondary={`Joined at ${attendee.joinedAt}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>

          {/* Chat */}
          <Paper elevation={3} sx={{ height: '35vh', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} pb={1}>
              <Typography variant="h6">
                Chat
              </Typography>
            </Box>
            <Divider />
            <Box flex={1} overflow="auto" p={2}>
              {chatMessages.map((msg) => (
                <Box key={msg.id} mb={1}>
                  <Typography variant="caption" color="primary">
                    {msg.sender} • {msg.time}
                  </Typography>
                  <Typography variant="body2">
                    {msg.message}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box p={2} pt={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleSendMessage}>
                      <Chat />
                    </IconButton>
                  )
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LectureStart;