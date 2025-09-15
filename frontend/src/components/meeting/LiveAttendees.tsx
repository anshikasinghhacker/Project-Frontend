import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Circle,
  Refresh,
  VideoCall,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Person,
  Schedule,
} from '@mui/icons-material';

interface Attendee {
  id: string;
  name: string;
  email?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  joinedAt: Date;
  hasVideo: boolean;
  hasAudio: boolean;
  isPresenting: boolean;
  role: 'organizer' | 'presenter' | 'attendee';
}

interface LiveAttendeesProps {
  meetingId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const LiveAttendees: React.FC<LiveAttendeesProps> = ({ 
  meetingId, 
  autoRefresh = true, 
  refreshInterval = 10000 
}) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simulate real-time attendees (in production, this would connect to Teams API)
  const fetchLiveAttendees = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate dynamic attendee data
    const currentTime = new Date();
    const mockAttendees: Attendee[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@school.edu',
        status: Math.random() > 0.3 ? 'online' : 'away',
        joinedAt: new Date(currentTime.getTime() - Math.random() * 300000), // Random join time within 5 mins
        hasVideo: Math.random() > 0.4,
        hasAudio: Math.random() > 0.2,
        isPresenting: false,
        role: 'attendee'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@school.edu',
        status: 'online',
        joinedAt: new Date(currentTime.getTime() - Math.random() * 600000),
        hasVideo: true,
        hasAudio: true,
        isPresenting: Math.random() > 0.8,
        role: 'presenter'
      },
      {
        id: '3',
        name: 'Mike Williams',
        email: 'mike.williams@school.edu',
        status: Math.random() > 0.5 ? 'online' : 'busy',
        joinedAt: new Date(currentTime.getTime() - Math.random() * 240000),
        hasVideo: Math.random() > 0.6,
        hasAudio: Math.random() > 0.3,
        isPresenting: false,
        role: 'attendee'
      },
      {
        id: '4',
        name: 'Emma Davis',
        email: 'emma.davis@school.edu',
        status: 'online',
        joinedAt: new Date(currentTime.getTime() - Math.random() * 480000),
        hasVideo: Math.random() > 0.5,
        hasAudio: true,
        isPresenting: false,
        role: 'organizer'
      },
      {
        id: '5',
        name: 'James Brown',
        email: 'james.brown@school.edu',
        status: Math.random() > 0.4 ? 'away' : 'offline',
        joinedAt: new Date(currentTime.getTime() - Math.random() * 720000),
        hasVideo: false,
        hasAudio: Math.random() > 0.7,
        isPresenting: false,
        role: 'attendee'
      }
    ];

    // Add some randomness - sometimes people leave/join
    const activeAttendees = mockAttendees.filter(() => Math.random() > 0.1);
    
    setAttendees(activeAttendees);
    setLastUpdated(currentTime);
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveAttendees();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLiveAttendees, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [meetingId, autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'busy': return '#f44336';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organizer': return '👑';
      case 'presenter': return '🎤';
      default: return '';
    }
  };

  const formatJoinTime = (joinedAt: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - joinedAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just joined';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <Paper sx={{ p: 2, height: 'fit-content' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Live Attendees ({attendees.length})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <IconButton 
            size="small" 
            onClick={fetchLiveAttendees}
            disabled={loading}
          >
            <Refresh sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          size="small" 
          label={`Online: ${attendees.filter(a => a.status === 'online').length}`}
          color="success"
        />
        <Chip 
          size="small" 
          label={`Away: ${attendees.filter(a => a.status === 'away').length}`}
          sx={{ bgcolor: '#ff9800', color: 'white' }}
        />
        <Chip 
          size="small" 
          label={`Video: ${attendees.filter(a => a.hasVideo).length}`}
          color="primary"
        />
      </Box>

      <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
        {attendees.map((attendee, index) => (
          <React.Fragment key={attendee.id}>
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Circle 
                      sx={{ 
                        color: getStatusColor(attendee.status),
                        fontSize: 12
                      }} 
                    />
                  }
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                    {attendee.name.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {attendee.name}
                    </Typography>
                    {getRoleIcon(attendee.role) && (
                      <span style={{ fontSize: '0.75rem' }}>
                        {getRoleIcon(attendee.role)}
                      </span>
                    )}
                    {attendee.isPresenting && (
                      <Chip 
                        size="small" 
                        label="Presenting" 
                        color="secondary"
                        sx={{ height: 16, fontSize: '0.6rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {getStatusText(attendee.status)} • {formatJoinTime(attendee.joinedAt)}
                    </Typography>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title={attendee.hasVideo ? "Video on" : "Video off"}>
                    <IconButton size="small" disabled>
                      {attendee.hasVideo ? 
                        <Videocam sx={{ fontSize: 16, color: 'success.main' }} /> : 
                        <VideocamOff sx={{ fontSize: 16, color: 'grey.400' }} />
                      }
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={attendee.hasAudio ? "Audio on" : "Audio off"}>
                    <IconButton size="small" disabled>
                      {attendee.hasAudio ? 
                        <Mic sx={{ fontSize: 16, color: 'success.main' }} /> : 
                        <MicOff sx={{ fontSize: 16, color: 'grey.400' }} />
                      }
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            {index < attendees.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {attendees.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Person sx={{ fontSize: 48, color: 'grey.300' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No attendees found
          </Typography>
          <Button 
            size="small" 
            onClick={fetchLiveAttendees}
            sx={{ mt: 1 }}
          >
            Refresh
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Updating attendees...
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
        🔴 Live • Auto-refresh every {refreshInterval / 1000}s
      </Typography>
    </Paper>
  );
};

export default LiveAttendees;