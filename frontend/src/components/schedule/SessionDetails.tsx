import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import {
  Schedule,
  Person,
  LocationOn,
  Timer,
  Group,
  Book,
  VideoCall,
} from '@mui/icons-material';

interface SessionDetailsProps {
  open: boolean;
  onClose: () => void;
  session: any;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ open, onClose, session }) => {
  if (!session) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{session.title}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip label={session.subject} color="primary" size="small" />
          <Chip label={session.type} size="small" variant="outlined" />
          <Chip 
            label={session.status} 
            size="small" 
            color={session.status === 'Upcoming' ? 'success' : 'default'}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Educator"
              secondary={session.educator}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Schedule />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Date & Time"
              secondary={`${session.date} at ${session.time}`}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Timer />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Duration"
              secondary={`${session.duration} minutes`}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <LocationOn />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Location"
              secondary={session.location}
            />
          </ListItem>
          {session.students && (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <Group />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Enrolled Students"
                secondary={`${session.students} students`}
              />
            </ListItem>
          )}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Session Description
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This session will cover important topics and concepts. Students are expected to come prepared with their study materials and any questions they may have.
        </Typography>
        
        {session.type === 'Live' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Meeting Link
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoCall color="primary" />
              <Typography variant="body2" color="primary">
                {session.location.includes('Zoom') ? 'https://zoom.us/j/123456789' : 'https://meet.google.com/abc-defg-hij'}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {session.status === 'Upcoming' && (
          <Button variant="contained" startIcon={<VideoCall />}>
            Join Session
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionDetails;