import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/attendance`;

export interface Attendance {
  studentId: number;
  batchId: number;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HOLIDAY';
  lectureId?: number;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

export interface AttendanceReport {
  studentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

class AttendanceService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async markAttendance(attendance: Attendance) {
    const response = await axios.post(API_URL, attendance, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async markBulkAttendance(batchId: number, date: string, attendanceList: Attendance[]) {
    const response = await axios.post(`${API_URL}/bulk`, 
      { batchId, date, attendanceList }, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getAttendanceByBatchAndDate(batchId: number, date: string) {
    const response = await axios.get(`${API_URL}/batch/${batchId}/date/${date}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getStudentAttendance(studentId: number, batchId: number) {
    const response = await axios.get(`${API_URL}/student/${studentId}/batch/${batchId}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAttendanceReport(batchId: number, startDate: string, endDate: string) {
    const response = await axios.get(`${API_URL}/report`, {
      params: { batchId, startDate, endDate },
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateAttendance(attendance: Attendance) {
    const response = await axios.put(API_URL, attendance, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMyAttendance(batchId?: number) {
    const url = batchId ? `${API_URL}/my-attendance?batchId=${batchId}` : `${API_URL}/my-attendance`;
    const response = await axios.get(url, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getTodaysAttendance(batchId: number) {
    const response = await axios.get(`${API_URL}/batch/${batchId}/today`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async exportAttendanceReport(batchId: number, startDate: string, endDate: string, format: 'csv' | 'pdf' = 'csv') {
    const response = await axios.get(`${API_URL}/export`, {
      params: { batchId, startDate, endDate, format },
      headers: this.getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new AttendanceService();