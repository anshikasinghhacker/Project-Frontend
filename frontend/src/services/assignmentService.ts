import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/assignments`;

export interface Assignment {
  id?: number;
  title: string;
  description?: string;
  instructions?: string;
  teacherId?: number;
  batchId: number;
  dueDate: string;
  maxScore?: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  attachmentUrl?: string;
}

export interface AssignmentSubmission {
  id?: number;
  assignmentId: number;
  studentId?: number;
  submissionText?: string;
  submissionFileUrl?: string;
  submittedAt?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'LATE';
  score?: number;
  feedback?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  approvedBy?: number;
  approvedAt?: string;
}

class AssignmentService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Assignment methods
  async createAssignment(assignment: Assignment) {
    const response = await axios.post(API_URL, assignment, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAllAssignments() {
    const response = await axios.get(API_URL, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAssignmentById(id: number) {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAssignmentsByBatch(batchId: number) {
    const response = await axios.get(`${API_URL}/batch/${batchId}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateAssignment(id: number, assignment: Assignment) {
    const response = await axios.put(`${API_URL}/${id}`, assignment, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async deleteAssignment(id: number) {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  // Submission methods
  async submitAssignment(submission: AssignmentSubmission) {
    const response = await axios.post(`${API_URL}/submit`, submission, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async uploadSubmissionFile(assignmentId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/${assignmentId}/upload`, formData, {
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getSubmissions(assignmentId: number) {
    const response = await axios.get(`${API_URL}/${assignmentId}/submissions`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMySubmissions() {
    const response = await axios.get(`${API_URL}/my-submissions`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async reviewSubmission(submissionId: number, score: number, feedback: string) {
    const response = await axios.post(`${API_URL}/submissions/${submissionId}/review`, 
      { score, feedback }, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async approveSubmission(submissionId: number) {
    const response = await axios.post(`${API_URL}/submissions/${submissionId}/approve`, 
      {}, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async rejectSubmission(submissionId: number, reason: string) {
    const response = await axios.post(`${API_URL}/submissions/${submissionId}/reject`, 
      { reason }, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }
}

export default new AssignmentService();