import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/study-materials`;

export interface StudyMaterial {
  id?: number;
  title: string;
  description?: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PRESENTATION' | 'SPREADSHEET' | 'LINK' | 'OTHER';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  batchId?: number;
  lectureId?: number;
  subject?: string;
  topic?: string;
  isPublic: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  downloadCount?: number;
  viewCount?: number;
}

class StudyMaterialService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async uploadMaterial(file: File, metadata: Partial<StudyMaterial>) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async createMaterial(material: StudyMaterial) {
    const response = await axios.post(API_URL, material, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getAllMaterials() {
    const response = await axios.get(API_URL, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMyMaterials() {
    const response = await axios.get(`${API_URL}/my-materials`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMaterialById(id: number) {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMaterialsByBatch(batchId: number) {
    const response = await axios.get(`${API_URL}/batch/${batchId}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMaterialsByLecture(lectureId: number) {
    const response = await axios.get(`${API_URL}/lecture/${lectureId}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async getMaterialsBySubject(subject: string, batchId?: number) {
    const url = batchId 
      ? `${API_URL}/subject/${subject}?batchId=${batchId}`
      : `${API_URL}/subject/${subject}`;
    const response = await axios.get(url, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateMaterial(id: number, material: StudyMaterial) {
    const response = await axios.put(`${API_URL}/${id}`, material, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async deleteMaterial(id: number) {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async downloadMaterial(id: number) {
    const response = await axios.get(`${API_URL}/${id}/download`, {
      headers: this.getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  }

  async incrementViewCount(id: number) {
    const response = await axios.post(`${API_URL}/${id}/view`, 
      {}, 
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async searchMaterials(query: string, filters?: {
    type?: string;
    subject?: string;
    batchId?: number;
  }) {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query, ...filters },
      headers: this.getAuthHeader()
    });
    return response.data;
  }
}

export default new StudyMaterialService();