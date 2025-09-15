import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/educator`;

export interface EducatorStats {
  totalBatches: number;
  totalStudents: number;
  totalQuizzes: number;
  totalSchedules: number;
  completedSessions: number;
  upcomingSessions: number;
}

export interface EducatorSchedule {
  id: number;
  title: string;
  batchName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

class EducatorService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getEducatorStats(): Promise<EducatorStats> {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getTodaySchedule(): Promise<EducatorSchedule[]> {
    const response = await axios.get(`${API_URL}/schedule/today`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getUpcomingSchedules(): Promise<EducatorSchedule[]> {
    const response = await axios.get(`${API_URL}/schedules/upcoming`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    const response = await axios.get(`${API_URL}/activities/recent`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMyBatches() {
    const response = await axios.get(`${API_URL}/batches`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMyQuizzes() {
    const response = await axios.get(`${API_URL}/quizzes`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getStudentProgress(batchId: number) {
    const response = await axios.get(`${API_URL}/batches/${batchId}/progress`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }
}

export default new EducatorService();