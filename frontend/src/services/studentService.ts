import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/student`;

export interface StudentStats {
  totalQuizzes: number;
  completedQuizzes: number;
  upcomingSchedules: number;
  averageScore: number;
}

export interface Activity {
  id: number;
  title: string;
  score: number;
  date: string;
  type: string;
}

export interface Schedule {
  id: number;
  subject: string;
  time: string;
  educator: string;
  batchId: number;
}

export interface SubjectProgress {
  subject: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
}

class StudentService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getStudentStats(): Promise<StudentStats> {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getRecentActivities(): Promise<Activity[]> {
    const response = await axios.get(`${API_URL}/activities`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getUpcomingSchedules(): Promise<Schedule[]> {
    const response = await axios.get(`${API_URL}/schedules`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getLearningProgress(): Promise<SubjectProgress[]> {
    const response = await axios.get(`${API_URL}/progress`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getQuizResults() {
    const response = await axios.get(`${API_URL}/quiz-results`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAssignments() {
    const response = await axios.get(`${API_URL}/assignments`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }
}

export default new StudentService();