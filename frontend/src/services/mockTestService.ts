import axios from 'axios';
import API_BASE_URL from '../config/api';

export interface MockTestQuestion {
  id?: number;
  questionText: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
  subject: string;
  questionOrder: number;
}

export interface MockTest {
  id?: number;
  title: string;
  description?: string;
  batchId: number;
  educatorId?: number;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  isProctored: boolean;
  enableWebcam: boolean;
  enableScreenCapture: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
  tabSwitchLimit: number;
  instructions?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  subjects: string[];
  questions: MockTestQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MockTestAttempt {
  id?: number;
  mockTestId: number;
  studentId: number;
  startTime: string;
  endTime?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank?: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED';
  feedback?: string;
  performanceAnalysis?: string;
}

export interface MockTestAnswer {
  id?: number;
  questionId: number;
  answer: string;
  isCorrect?: boolean;
  marksObtained?: number;
  feedback?: string;
}

export interface ProctoringSettings {
  enableWebcam: boolean;
  enableScreenCapture: boolean;
  tabSwitchLimit: number;
  enableMicrophoneDetection: boolean;
  enableFullScreenMode: boolean;
  allowCopyPaste: boolean;
  showTimer: boolean;
  enableAutoSubmit: boolean;
}

class MockTestService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // Mock Test CRUD operations
  async createMockTest(mockTest: MockTest): Promise<MockTest> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mock-tests`,
      mockTest,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getAllMockTests(): Promise<MockTest[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getMockTestById(id: number): Promise<MockTest> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateMockTest(id: number, mockTest: Partial<MockTest>): Promise<MockTest> {
    const response = await axios.put(
      `${API_BASE_URL}/api/mock-tests/${id}`,
      mockTest,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteMockTest(id: number): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/api/mock-tests/${id}`,
      this.getAuthHeaders()
    );
  }

  // Mock Test by batch
  async getMockTestsByBatch(batchId: number): Promise<MockTest[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/batch/${batchId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Upcoming mock tests
  async getUpcomingMockTests(): Promise<MockTest[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/upcoming`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Mock Test Questions
  async addQuestionToMockTest(mockTestId: number, question: MockTestQuestion): Promise<MockTestQuestion> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/questions`,
      question,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateQuestion(questionId: number, question: Partial<MockTestQuestion>): Promise<MockTestQuestion> {
    const response = await axios.put(
      `${API_BASE_URL}/api/mock-test-questions/${questionId}`,
      question,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteQuestion(questionId: number): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/api/mock-test-questions/${questionId}`,
      this.getAuthHeaders()
    );
  }

  // Mock Test Attempts (Student)
  async startMockTest(mockTestId: number): Promise<MockTestAttempt> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/start`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async submitAnswer(attemptId: number, questionId: number, answer: string): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/api/mock-test-attempts/${attemptId}/answers`,
      { questionId, answer },
      this.getAuthHeaders()
    );
  }

  async submitMockTest(attemptId: number): Promise<MockTestAttempt> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mock-test-attempts/${attemptId}/submit`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getStudentAttempt(attemptId: number): Promise<MockTestAttempt> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-test-attempts/${attemptId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getStudentAttempts(studentId: number): Promise<MockTestAttempt[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-test-attempts/student/${studentId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Mock Test Results
  async getMockTestResults(mockTestId: number): Promise<MockTestAttempt[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/results`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async evaluateMockTest(attemptId: number): Promise<MockTestAttempt> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mock-test-attempts/${attemptId}/evaluate`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Proctoring
  async startProctoring(mockTestId: number): Promise<{ sessionId: string; instructions: string[] }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/start-proctoring`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async reportProctoringEvent(sessionId: string, event: {
    type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'COPY' | 'PASTE' | 'FULLSCREEN_EXIT' | 'SUSPICIOUS_ACTIVITY';
    timestamp: string;
    details?: any;
  }): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/api/proctoring/${sessionId}/events`,
      event,
      this.getAuthHeaders()
    );
  }

  async getProctoringReport(mockTestId: number): Promise<any[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/proctoring-report`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Statistics and Analytics
  async getMockTestStats(mockTestId: number): Promise<{
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    subjectWisePerformance: { subject: string; averageScore: number }[];
  }> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/stats`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Bulk operations
  async importQuestions(mockTestId: number, questions: MockTestQuestion[]): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/import-questions`,
      { questions },
      this.getAuthHeaders()
    );
  }

  async exportResults(mockTestId: number, format: 'CSV' | 'EXCEL'): Promise<Blob> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/${mockTestId}/export?format=${format}`,
      {
        ...this.getAuthHeaders(),
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // For Junior Educator supervision
  async getActiveMockTestSessions(): Promise<{
    mockTestId: number;
    title: string;
    activeStudents: number;
    startTime: string;
    endTime: string;
    proctoringAlerts: number;
  }[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-tests/active-sessions`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async superviseStudent(attemptId: number): Promise<{
    studentName: string;
    currentQuestion: number;
    totalQuestions: number;
    timeRemaining: number;
    proctoringEvents: any[];
    webcamSnapshot?: string;
    screenSnapshot?: string;
  }> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mock-test-attempts/${attemptId}/supervise`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Mock data fallback (for development when backend is not available)
  async getMockTestsWithFallback(): Promise<MockTest[]> {
    try {
      return await this.getAllMockTests();
    } catch (error) {
      console.log('Backend not available, using mock data');
      return [
        {
          id: 1,
          title: 'Mathematics Mid-term Mock',
          description: 'Comprehensive test covering algebra, geometry, and calculus',
          batchId: 1,
          educatorId: 2,
          startTime: '2024-02-15T10:00:00',
          endTime: '2024-02-15T12:00:00',
          duration: 120,
          totalMarks: 100,
          isProctored: true,
          enableWebcam: true,
          enableScreenCapture: true,
          shuffleQuestions: true,
          showResults: true,
          tabSwitchLimit: 3,
          instructions: 'Read all questions carefully. No calculators allowed.',
          status: 'SCHEDULED',
          subjects: ['Algebra', 'Geometry', 'Calculus'],
          questions: [],
        },
        {
          id: 2,
          title: 'Physics Chapter Test',
          description: 'Test on Quantum Mechanics and Thermodynamics',
          batchId: 2,
          educatorId: 3,
          startTime: '2024-02-18T14:00:00',
          endTime: '2024-02-18T15:00:00',
          duration: 60,
          totalMarks: 50,
          isProctored: true,
          enableWebcam: true,
          enableScreenCapture: false,
          shuffleQuestions: false,
          showResults: false,
          tabSwitchLimit: 2,
          instructions: 'Show all working for calculation questions.',
          status: 'SCHEDULED',
          subjects: ['Quantum Mechanics', 'Thermodynamics'],
          questions: [],
        },
      ];
    }
  }
}

const mockTestService = new MockTestService();
export default mockTestService;