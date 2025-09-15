import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/lectures`;

export interface Lecture {
  id?: number;
  title: string;
  description?: string;
  teacherId?: number;
  batchId: number;
  lectureDate: string;
  startTime?: string;
  endTime?: string;
  recordingUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  type: 'LIVE' | 'RECORDED' | 'HYBRID';
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  meetingLink?: string;
  topics?: string;
  resources?: string;
  isRecorded: boolean;
}

class LectureService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createLecture(lecture: Lecture) {
    const response = await axios.post(API_URL, lecture, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAllLectures() {
    const response = await axios.get(API_URL, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getLectureById(id: number) {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getLecturesByBatch(batchId: number) {
    const response = await axios.get(`${API_URL}/batch/${batchId}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getRecordedLectures(batchId?: number) {
    const url = batchId ? `${API_URL}/recorded?batchId=${batchId}` : `${API_URL}/recorded`;
    const response = await axios.get(url, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateLecture(id: number, lecture: Lecture) {
    const response = await axios.put(`${API_URL}/${id}`, lecture, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async uploadRecording(lectureId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lectureId', lectureId.toString());
    
    const response = await axios.post(`${API_BASE_URL}/api/files/recordings/upload`, formData, {
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async startLecture(lectureId: number) {
    const response = await axios.post(`${API_URL}/${lectureId}/start`, 
      {}, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async endLecture(lectureId: number) {
    const response = await axios.post(`${API_URL}/${lectureId}/end`, 
      {}, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async cancelLecture(lectureId: number, reason: string) {
    const response = await axios.post(`${API_URL}/${lectureId}/cancel`, 
      { reason }, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getTodaysLectures() {
    const response = await axios.get(`${API_URL}/today`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getUpcomingLectures() {
    const response = await axios.get(`${API_URL}/upcoming`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }
}

export default new LectureService();