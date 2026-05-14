// services/teacherQualificationService.js

const API_BASE_URL = 'http://localhost:8000/api/teacher-qualifications';

export const teacherQualificationService = {
  // Get all teacher qualifications
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get teachers list
  async getTeachers() {
    const response = await fetch(`${API_BASE_URL}/teachers`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get subjects list
  async getSubjects() {
    const response = await fetch(`${API_BASE_URL}/subjects`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get qualifications for a specific teacher
  async getByTeacher(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get qualification matrix
  async getMatrix() {
    const response = await fetch(`${API_BASE_URL}/matrix`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Bulk update qualifications for a teacher
  async bulkUpdate(staffId, qualifications) {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id: staffId, qualifications })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Add a qualification
  async add(staffId, subjectId, qualificationData) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/${subjectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qualificationData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update a qualification
  async update(staffId, subjectId, qualificationData) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qualificationData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Remove a qualification
  async remove(staffId, subjectId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/${subjectId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};