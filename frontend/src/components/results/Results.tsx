import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Assessment,
  CheckCircle,
  Cancel,
  School,
  Timer,
  Grade,
  Leaderboard,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { downloadReport } from '../../utils/reportGenerator';

interface Result {
  id: number;
  testName: string;
  testType: 'Quiz' | 'Mock Test' | 'Assignment';
  subject: string;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'Pass' | 'Fail';
  timeTaken: number;
  rank?: number;
  totalStudents?: number;
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  testsAttempted: number;
  improvement: number;
}

const Results: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [overallStats, setOverallStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    improvement: 0,
  });

  useEffect(() => {
    // Mock data
    const mockResults: Result[] = [
      {
        id: 1,
        testName: 'Algebra Basics Quiz',
        testType: 'Quiz',
        subject: 'Mathematics',
        date: new Date(Date.now() - 86400000).toISOString(),
        score: 85,
        totalMarks: 100,
        percentage: 85,
        status: 'Pass',
        timeTaken: 25,
        rank: 5,
        totalStudents: 30,
      },
      {
        id: 2,
        testName: 'Physics Mock Test #1',
        testType: 'Mock Test',
        subject: 'Physics',
        date: new Date(Date.now() - 172800000).toISOString(),
        score: 78,
        totalMarks: 100,
        percentage: 78,
        status: 'Pass',
        timeTaken: 45,
        rank: 8,
        totalStudents: 25,
      },
      {
        id: 3,
        testName: 'Chemistry Chapter 3 Quiz',
        testType: 'Quiz',
        subject: 'Chemistry',
        date: new Date(Date.now() - 259200000).toISOString(),
        score: 92,
        totalMarks: 100,
        percentage: 92,
        status: 'Pass',
        timeTaken: 30,
        rank: 2,
        totalStudents: 28,
      },
      {
        id: 4,
        testName: 'Biology Assignment 2',
        testType: 'Assignment',
        subject: 'Biology',
        date: new Date(Date.now() - 345600000).toISOString(),
        score: 88,
        totalMarks: 100,
        percentage: 88,
        status: 'Pass',
        timeTaken: 60,
      },
      {
        id: 5,
        testName: 'English Grammar Test',
        testType: 'Quiz',
        subject: 'English',
        date: new Date(Date.now() - 432000000).toISOString(),
        score: 72,
        totalMarks: 100,
        percentage: 72,
        status: 'Pass',
        timeTaken: 20,
        rank: 12,
        totalStudents: 32,
      },
      {
        id: 6,
        testName: 'History Mock Test',
        testType: 'Mock Test',
        subject: 'History',
        date: new Date(Date.now() - 518400000).toISOString(),
        score: 65,
        totalMarks: 100,
        percentage: 65,
        status: 'Pass',
        timeTaken: 50,
        rank: 15,
        totalStudents: 30,
      },
      {
        id: 7,
        testName: 'Trigonometry Quiz',
        testType: 'Quiz',
        subject: 'Mathematics',
        date: new Date(Date.now() - 604800000).toISOString(),
        score: 58,
        totalMarks: 100,
        percentage: 58,
        status: 'Fail',
        timeTaken: 35,
        rank: 20,
        totalStudents: 25,
      },
      {
        id: 8,
        testName: 'Organic Chemistry Test',
        testType: 'Quiz',
        subject: 'Chemistry',
        date: new Date(Date.now() - 691200000).toISOString(),
        score: 95,
        totalMarks: 100,
        percentage: 95,
        status: 'Pass',
        timeTaken: 40,
        rank: 1,
        totalStudents: 35,
      },
    ];

    setResults(mockResults);

    // Calculate subject performance
    const subjectMap = new Map<string, { total: number; count: number; scores: number[] }>();
    mockResults.forEach(result => {
      if (!subjectMap.has(result.subject)) {
        subjectMap.set(result.subject, { total: 0, count: 0, scores: [] });
      }
      const data = subjectMap.get(result.subject)!;
      data.total += result.percentage;
      data.count += 1;
      data.scores.push(result.percentage);
    });

    const performance: SubjectPerformance[] = [];
    subjectMap.forEach((data, subject) => {
      const scores = data.scores.sort((a, b) => a - b);
      const improvement = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
      performance.push({
        subject,
        averageScore: Math.round(data.total / data.count),
        testsAttempted: data.count,
        improvement,
      });
    });
    setSubjectPerformance(performance);

    // Calculate overall stats
    const totalTests = mockResults.length;
    const averageScore = Math.round(mockResults.reduce((sum, r) => sum + r.percentage, 0) / totalTests);
    const bestScore = Math.max(...mockResults.map(r => r.percentage));
    const recentScores = mockResults.slice(0, 3).map(r => r.percentage);
    const olderScores = mockResults.slice(-3).map(r => r.percentage);
    const improvement = Math.round(
      (recentScores.reduce((a, b) => a + b, 0) / recentScores.length) -
      (olderScores.reduce((a, b) => a + b, 0) / olderScores.length)
    );

    setOverallStats({
      totalTests,
      averageScore,
      bestScore,
      improvement,
    });
  }, []);

  const handleViewDetails = (result: Result) => {
    setSelectedResult(result);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedResult(null);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredResults = tabValue === 0 
    ? results 
    : results.filter(r => r.testType === (tabValue === 1 ? 'Quiz' : 'Mock Test'));

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Performance Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your progress and performance across all tests
        </Typography>
      </Box>

      {/* Overall Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Assessment color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4">{overallStats.totalTests}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Tests Taken
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <School color="success" sx={{ mr: 1 }} />
              <Typography variant="h4">{overallStats.averageScore}%</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Average Score
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle color="warning" sx={{ mr: 1 }} />
              <Typography variant="h4">{overallStats.bestScore}%</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Best Score
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {overallStats.improvement >= 0 ? (
                <TrendingUp color="success" sx={{ mr: 1 }} />
              ) : (
                <TrendingDown color="error" sx={{ mr: 1 }} />
              )}
              <Typography variant="h4">
                {overallStats.improvement > 0 ? '+' : ''}{overallStats.improvement}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Overall Improvement
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Subject Performance */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Subject-wise Performance
        </Typography>
        <Box sx={{ mt: 2 }}>
          {subjectPerformance.map((subject) => (
            <Box key={subject.subject} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{subject.subject}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${subject.averageScore}%`}
                    size="small"
                    color={getScoreColor(subject.averageScore)}
                  />
                  <Chip
                    label={`${subject.testsAttempted} tests`}
                    size="small"
                    variant="outlined"
                  />
                  {subject.improvement !== 0 && (
                    <Chip
                      label={`${subject.improvement > 0 ? '+' : ''}${subject.improvement}%`}
                      size="small"
                      color={subject.improvement > 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={subject.averageScore}
                color={getScoreColor(subject.averageScore)}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Results Table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="All Results" />
            <Tab label="Quizzes" />
            <Tab label="Mock Tests" />
          </Tabs>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="center">Percentage</TableCell>
                <TableCell align="center">Rank</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.testName}</TableCell>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell>
                    <Chip label={result.testType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatDate(result.date)}</TableCell>
                  <TableCell align="center">
                    {result.score}/{result.totalMarks}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${result.percentage}%`}
                      size="small"
                      color={getScoreColor(result.percentage)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {result.rank ? `${result.rank}/${result.totalStudents}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={result.status}
                      size="small"
                      color={result.status === 'Pass' ? 'success' : 'error'}
                      icon={result.status === 'Pass' ? <CheckCircle /> : <Cancel />}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleViewDetails(result)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={() => downloadReport(results, user?.fullName || 'Student', 'csv')}
          >
            Download CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={() => downloadReport(results, user?.fullName || 'Student', 'pdf')}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {selectedResult?.testName} - Detailed Results
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Grade color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Score Details</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Score Achieved
                        </Typography>
                        <Typography variant="h4">
                          {selectedResult.score}/{selectedResult.totalMarks}
                        </Typography>
                        <Chip
                          label={`${selectedResult.percentage}%`}
                          color={getScoreColor(selectedResult.percentage)}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={selectedResult.percentage}
                        color={getScoreColor(selectedResult.percentage)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Timer color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Time & Performance</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Time Taken
                        </Typography>
                        <Typography variant="h5">
                          {selectedResult.timeTaken} minutes
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedResult.status}
                          color={selectedResult.status === 'Pass' ? 'success' : 'error'}
                          icon={selectedResult.status === 'Pass' ? <CheckCircle /> : <Cancel />}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {selectedResult.rank && (
                  /* @ts-ignore */
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Leaderboard color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">Ranking</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Your Rank
                          </Typography>
                          <Typography variant="h4">
                            #{selectedResult.rank}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            out of {selectedResult.totalStudents} students
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* @ts-ignore */}
                <Grid item xs={12} sm={selectedResult.rank ? 6 : 12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Assessment color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Test Information</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Subject
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {selectedResult.subject}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Test Type
                        </Typography>
                        <Chip
                          label={selectedResult.testType}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date Taken
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedResult.date)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Insights
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedResult.percentage >= 90 && (
                    <Chip
                      label="Excellent Performance"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {selectedResult.percentage >= 80 && selectedResult.percentage < 90 && (
                    <Chip
                      label="Good Performance"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {selectedResult.percentage >= 60 && selectedResult.percentage < 80 && (
                    <Chip
                      label="Average Performance"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {selectedResult.percentage < 60 && (
                    <Chip
                      label="Needs Improvement"
                      color="error"
                      variant="outlined"
                    />
                  )}
                  {selectedResult.rank && selectedResult.rank <= 5 && (
                    <Chip
                      label="Top Performer"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {selectedResult.timeTaken <= 30 && (
                    <Chip
                      label="Quick Finisher"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              if (selectedResult) {
                downloadReport([selectedResult], user?.fullName || 'Student', 'pdf');
              }
            }}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Results;