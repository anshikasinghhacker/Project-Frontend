import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
// @ts-ignore
import Grid from '@mui/material/GridLegacy';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import batchService, { Batch } from '../../services/batchService';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`batch-tabpanel-${index}`}
      aria-labelledby={`batch-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BatchManagement: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Batch>({
    batchName: '',
    batchCode: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
    maxStudents: 30
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchService.getAllBatches();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (batch: Batch | null = null) => {
    if (batch) {
      setSelectedBatch(batch);
      setFormData(batch);
    } else {
      setSelectedBatch(null);
      setFormData({
        batchName: '',
        batchCode: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'UPCOMING',
        maxStudents: 30
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedBatch) {
        await batchService.updateBatch(selectedBatch.id!, formData);
      } else {
        await batchService.createBatch(formData);
      }
      await fetchBatches();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await batchService.deleteBatch(id);
        await fetchBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'default';
      case 'UPCOMING': return 'info';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Batch Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create New Batch
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Batches" />
          <Tab label="Active" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {batches.map((batch) => (
            <Grid item xs={12} md={6} lg={4} key={batch.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h6" gutterBottom>
                      {batch.batchName}
                    </Typography>
                    <Chip 
                      label={batch.status} 
                      color={getStatusColor(batch.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Code: {batch.batchCode}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {batch.description}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Start: {new Date(batch.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {batch.endDate && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        End: {new Date(batch.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Max Students: {batch.maxStudents}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Button
                      size="small"
                      startIcon={<PeopleIcon />}
                      onClick={() => {/* Navigate to batch details */}}
                    >
                      View Details
                    </Button>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(batch)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBatch(batch.id!)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {batches.filter(b => b.status === 'ACTIVE').map((batch) => (
            <Grid item xs={12} md={6} lg={4} key={batch.id}>
              {/* Render batch card */}
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Dialog for Create/Edit Batch */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBatch ? 'Edit Batch' : 'Create New Batch'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Batch Name"
                name="batchName"
                value={formData.batchName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Code"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as any}))}
                  label="Status"
                >
                  <MenuItem value="UPCOMING">Upcoming</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maximum Students"
                name="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedBatch ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BatchManagement;