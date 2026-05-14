// services/programmeSubjectService.js

const API_BASE_URL = 'http://localhost:8000/api/programme-subjects';

export const programmeSubjectService = {
  // Get all programme subject assignments
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get programmes list
  async getProgrammes() {
    const response = await fetch(`${API_BASE_URL}/programmes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get available elective subjects
  async getAvailableSubjects() {
    const response = await fetch(`${API_BASE_URL}/available-subjects`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get subjects for a specific programme
  async getByProgramme(programmeId) {
    const response = await fetch(`${API_BASE_URL}/${programmeId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Bulk update subjects for a programme
  async bulkUpdate(programmeId, subjects) {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programme_id: programmeId, subjects })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Assign a single subject
  async assign(programmeId, subjectId, isRequired = false) {
    const response = await fetch(`${API_BASE_URL}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programme_id: programmeId, subject_id: subjectId, is_required: isRequired })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Remove a subject assignment
  async remove(programmeId, subjectId) {
    const response = await fetch(`${API_BASE_URL}/${programmeId}/${subjectId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Toggle required status
  async toggleRequired(programmeId, subjectId) {
    const response = await fetch(`${API_BASE_URL}/${programmeId}/${subjectId}/toggle-required`, {
      method: 'PUT'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};