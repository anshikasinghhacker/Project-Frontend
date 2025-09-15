import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  LinearProgress,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  CalendarToday,
  Search,
  FilterList,
  Download,
  Upload,
  Edit,
  Save,
  Close,
  Group,
  Today
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../services/attendanceService';
import batchService from '../../services/batchService';

interface Student {
  id: number;
  fullName: string;
  email: string;
  batchId: number;
}

interface AttendanceRecord {
  studentId: number;
  studentName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

interface Batch {
  id: number;
  batchName: string;
  batchCode: string;
}

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number>(0);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedBatch, attendanceDate]);

  const fetchBatches = async () => {
    try {
      const batchData = await batchService.getMyBatches();
      setBatches(batchData);
      if (batchData.length > 0) {
        setSelectedBatch(batchData[0].id);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedBatch) return;
    
    try {
      setLoading(true);
      const studentsData = await batchService.getBatchStudents(selectedBatch);
      setStudents(studentsData);
      
      // Initialize attendance records if not already present
      const initialAttendance = studentsData.map((student: Student) => ({
        studentId: student.id,
        studentName: student.fullName,
        status: 'PRESENT' as const,
        checkInTime: '',
        checkOutTime: '',
        remarks: ''
      }));
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedBatch || !attendanceDate) return;
    
    try {
      const attendanceData = await attendanceService.getAttendanceByBatchAndDate(selectedBatch, attendanceDate);
      if (attendanceData.length > 0) {
        setAttendance(attendanceData.map((record: any) => ({
          studentId: record.studentId,
          studentName: record.studentName || students.find(s => s.id === record.studentId)?.fullName || '',
          status: record.status,
          checkInTime: record.checkInTime || '',
          checkOutTime: record.checkOutTime || '',
          remarks: record.remarks || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const updateAttendanceStatus = (studentId: number, status: AttendanceRecord['status']) => {
    setAttendance(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, status }
          : record
      )
    );
  };

  const updateAttendanceField = (studentId: number, field: keyof AttendanceRecord, value: string) => {
    setAttendance(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleBulkUpdate = () => {
    const filteredAttendance = getFilteredAttendance();
    setAttendance(prev => 
      prev.map(record => 
        filteredAttendance.some(fa => fa.studentId === record.studentId)
          ? { ...record, status: bulkStatus }
          : record
      )
    );
    setOpenBulkDialog(false);
  };

  const saveAttendance = async () => {
    if (!selectedBatch || !attendanceDate) return;
    
    try {
      setSaving(true);
      const attendanceList = attendance.map(att => ({
        studentId: att.studentId,
        batchId: selectedBatch,
        attendanceDate: attendanceDate,
        status: att.status,
        remarks: att.remarks
      }));
      await attendanceService.markBulkAttendance(selectedBatch, attendanceDate, attendanceList);
      // Show success message
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFilteredAttendance = () => {
    return attendance.filter(record => 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      case 'LATE': return 'warning';
      case 'EXCUSED': return 'info';
      default: return 'default';
    }
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const excused = attendance.filter(a => a.status === 'EXCUSED').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = getAttendanceStats();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Attendance Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setOpenBulkDialog(true)}
            disabled={attendance.length === 0}
          >
            Bulk Update
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveAttendance}
            disabled={!selectedBatch || saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Batch</InputLabel>
            <Select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(Number(e.target.value))}
              label="Select Batch"
            >
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.batchName} ({batch.batchCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            type="date"
            label="Date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          
          <TextField
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Paper>

      {/* Statistics */}
      {attendance.length > 0 && (
        <Box display="flex" gap={2} mb={3}>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="success.main">{stats.present}</Typography>
              <Typography variant="body2" color="text.secondary">Present</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="error.main">{stats.absent}</Typography>
              <Typography variant="body2" color="text.secondary">Absent</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="warning.main">{stats.late}</Typography>
              <Typography variant="body2" color="text.secondary">Late</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Attendance Table */}
      {loading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Check In</TableCell>
                <TableCell align="center">Check Out</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAttendance().map((record) => (
                <TableRow key={record.studentId}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {record.studentName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{record.studentName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={record.status}
                        onChange={(e) => updateAttendanceStatus(record.studentId, e.target.value as AttendanceRecord['status'])}
                      >
                        <MenuItem value="PRESENT">Present</MenuItem>
                        <MenuItem value="ABSENT">Absent</MenuItem>
                        <MenuItem value="LATE">Late</MenuItem>
                        <MenuItem value="EXCUSED">Excused</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      size="small"
                      value={record.checkInTime}
                      onChange={(e) => updateAttendanceField(record.studentId, 'checkInTime', e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      size="small"
                      value={record.checkOutTime}
                      onChange={(e) => updateAttendanceField(record.studentId, 'checkOutTime', e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="Add remarks..."
                      value={record.remarks}
                      onChange={(e) => updateAttendanceField(record.studentId, 'remarks', e.target.value)}
                      sx={{ minWidth: 200 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Bulk Update Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)}>
        <DialogTitle>Bulk Update Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Update attendance status for {getFilteredAttendance().length} students
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as 'PRESENT' | 'ABSENT')}
              label="Status"
            >
              <MenuItem value="PRESENT">Present</MenuItem>
              <MenuItem value="ABSENT">Absent</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {attendance.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Select a batch and date to start taking attendance.
        </Alert>
      )}
    </Container>
  );
};

export default AttendanceManagement;