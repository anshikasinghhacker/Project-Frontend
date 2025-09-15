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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Schedule,
  CalendarMonth,
  AccessTime,
  Person,
  VideoCall,
  LocationOn,
  Today,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import SessionDetails from './SessionDetails';
import lectureService from '../../services/lectureService';
import TeamsMeetingHelper from '../meeting/TeamsMeetingHelper';

interface ScheduleItem {
  id: number;
  title: string;
  subject: string;
  educator: string;
  date: string;
  time: string;
  duration: number;
  type: 'Live' | 'Recorded';
  location: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  students?: number;
  teamsLink?: string;
  meetingId?: string;
}

const ScheduleList: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<ScheduleItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [teamsHelperOpen, setTeamsHelperOpen] = useState(false);
  const [selectedTeamsMeeting, setSelectedTeamsMeeting] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // Try to fetch real lectures from API
      const lectures = await lectureService.getAllLectures();
      
      // Convert lecture format to schedule format
      const apiSchedules = lectures.map((lecture: any) => ({
        id: lecture.id,
        title: lecture.title,
        subject: lecture.description || 'General',
        educator: user?.fullName || 'Teacher',
        date: lecture.lectureDate,
        time: lecture.startTime ? new Date(lecture.startTime).toLocaleTimeString() : '10:00 AM',
        duration: lecture.duration || 60,
        type: lecture.type === 'LIVE' ? 'Live' : 'Recorded',
        location: lecture.meetingLink || 'Online',
        status: lecture.status === 'SCHEDULED' ? 'Upcoming' : 
                lecture.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
        students: 25,
      }));

      const allSchedules = apiSchedules;
      
      if (allSchedules.length > 0) {
        setSchedules(allSchedules);
        setFilteredSchedules(allSchedules.filter((s: any) => s.status === 'Upcoming'));
      } else {
        // Fall back to mock data if no lectures found
        loadMockData();
      }
    } catch (error) {
      console.log('Using mock data and local storage');
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockSchedules: ScheduleItem[] = [
      {
        id: 1,
        title: 'Algebra Advanced Topics',
        subject: 'Mathematics',
        educator: 'Dr. Smith',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        duration: 60,
        type: 'Live',
        location: 'Online - Microsoft Teams',
        status: 'Upcoming',
        students: 25,
        teamsLink: 'https://teams.live.com/meet/9393490384214?p=x2EkimnMoo3sPPuslR',
        meetingId: '9393490384214',
      },
      {
        id: 2,
        title: 'Physics Lab Session',
        subject: 'Physics',
        educator: 'Prof. Johnson',
        date: new Date().toISOString().split('T')[0],
        time: '2:00 PM',
        duration: 90,
        type: 'Live',
        location: 'Online - Microsoft Teams',
        status: 'Upcoming',
        students: 15,
        teamsLink: 'https://teams.live.com/meet/9876543210123?p=abcd1234efgh',
        meetingId: '9876543210123',
      },
      {
        id: 3,
        title: 'Chemistry Doubt Session',
        subject: 'Chemistry',
        educator: 'Dr. Williams',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '11:00 AM',
        duration: 45,
        type: 'Live',
        location: 'Online - Microsoft Teams',
        status: 'Upcoming',
        students: 30,
        teamsLink: 'https://teams.live.com/meet/5555666677778?p=xyz9876543',
        meetingId: '5555666677778',
      }
    ];
    setSchedules(mockSchedules);
    setFilteredSchedules(mockSchedules.filter(s => s.status === 'Upcoming'));
  };


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setFilteredSchedules(schedules.filter(s => s.status === 'Upcoming'));
    } else if (newValue === 1) {
      setFilteredSchedules(schedules.filter(s => s.status === 'Completed'));
    } else {
      setFilteredSchedules(schedules);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'primary';
      case 'Ongoing':
        return 'success';
      case 'Completed':
        return 'default';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Live' ? <VideoCall /> : <LocationOn />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Class Schedules
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your upcoming classes and sessions
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="All Schedules" />
        </Tabs>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          {filteredSchedules.map((schedule, index) => (
            <Card key={schedule.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {schedule.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Schedule />}
                        label={schedule.subject}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={schedule.status}
                        size="small"
                        color={getStatusColor(schedule.status)}
                      />
                      <Chip
                        icon={getTypeIcon(schedule.type)}
                        label={schedule.type}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>

                <List dense>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        <Person sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Educator"
                      secondary={schedule.educator}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}>
                        <CalendarMonth sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Date & Time"
                      secondary={`${formatDate(schedule.date)} at ${schedule.time}`}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                        <AccessTime sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Duration"
                      secondary={`${schedule.duration} minutes`}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
                        <LocationOn sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Location"
                      secondary={schedule.location}
                    />
                  </ListItem>
                </List>

                {schedule.status === 'Upcoming' && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
                    {schedule.teamsLink && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          sx={{ 
                            flex: 1,
                            bgcolor: '#6264A7', 
                            '&:hover': { bgcolor: '#5A5A8A' }
                          }}
                          startIcon={<VideoCall />}
                          onClick={() => window.open(schedule.teamsLink, '_blank')}
                        >
                          Join Teams Meeting
                        </Button>
                        <Button 
                          variant="outlined"
                          onClick={() => {
                            setSelectedTeamsMeeting(schedule);
                            setTeamsHelperOpen(true);
                          }}
                          sx={{ minWidth: 'auto', px: 2 }}
                        >
                          ?
                        </Button>
                      </Box>
                    )}
                    
                    {schedule.meetingId && (
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: 'grey.100', 
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Meeting ID: {schedule.meetingId}
                        </Typography>
                        <Button 
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(schedule.meetingId!);
                            // You could add a toast notification here
                          }}
                        >
                          Copy ID
                        </Button>
                      </Box>
                    )}
                    
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => {
                        setSelectedSession(schedule);
                        setDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                )}
                {schedule.status === 'Completed' && (
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" fullWidth>
                      View Recording
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Today sx={{ verticalAlign: 'middle', mr: 1 }} />
              Today's Schedule
            </Typography>
            <Divider sx={{ my: 1 }} />
            {schedules
              .filter(s => formatDate(s.date) === 'Today')
              .map(schedule => (
                <Box key={schedule.id} sx={{ py: 1 }}>
                  <Typography variant="subtitle2">{schedule.time}</Typography>
                  <Typography variant="body2">{schedule.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    with {schedule.educator}
                  </Typography>
                </Box>
              ))}
            {schedules.filter(s => formatDate(s.date) === 'Today').length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No classes scheduled for today
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Classes</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {schedules.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Upcoming</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {schedules.filter(s => s.status === 'Upcoming').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Completed</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {schedules.filter(s => s.status === 'Completed').length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      <SessionDetails
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
      />
      
      <TeamsMeetingHelper
        open={teamsHelperOpen}
        onClose={() => {
          setTeamsHelperOpen(false);
          setSelectedTeamsMeeting(null);
        }}
        meetingLink={selectedTeamsMeeting?.teamsLink}
        meetingId={selectedTeamsMeeting?.meetingId}
      />
    </Container>
  );
};

export default ScheduleList;