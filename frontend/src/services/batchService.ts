import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/batches`;

export interface Batch {
  id?: number;
  batchName: string;
  batchCode: string;
  description?: string;
  startDate: string;
  endDate?: string;
  adminId?: number;
  teacherId?: number;
  juniorEducatorIds?: number[];
  studentIds?: number[];
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'UPCOMING';
  maxStudents?: number;
}

class BatchService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createBatch(batch: Batch) {
    const response = await axios.post(API_URL, batch, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAllBatches() {
    const response = await axios.get(API_URL, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getBatchById(id: number) {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateBatch(id: number, batch: Batch) {
    const response = await axios.put(`${API_URL}/${id}`, batch, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async deleteBatch(id: number) {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async assignTeacher(batchId: number, teacherId: number) {
    const response = await axios.post(
      `${API_URL}/${batchId}/assign-teacher/${teacherId}`,
      {},
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async assignJuniorEducator(batchId: number, educatorId: number) {
    const response = await axios.post(
      `${API_URL}/${batchId}/assign-junior/${educatorId}`,
      {},
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async addStudent(batchId: number, studentId: number) {
    const response = await axios.post(
      `${API_URL}/${batchId}/assign-student/${studentId}`,
      {},
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async removeStudent(batchId: number, studentId: number) {
    const response = await axios.delete(`${API_URL}/${batchId}/remove-student/${studentId}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getBatchStudents(batchId: number) {
    const response = await axios.get(`${API_URL}/${batchId}/students`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMyBatches() {
    const response = await axios.get(`${API_URL}/my-batches`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }
}

export default new BatchService();