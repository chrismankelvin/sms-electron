// services/subjectService.js

const API_BASE_URL = 'http://localhost:8000/api/subjects';

export const subjectService = {
  // Get all subjects with optional filters
  async getAll(subjectType = null, category = null) {
    let url = `${API_BASE_URL}/`;
    const params = [];
    if (subjectType) params.push(`subject_type=${subjectType}`);
    if (category) params.push(`category=${category}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get subject by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Generate subject code from name
  async generateCode(name) {
    const response = await fetch(`${API_BASE_URL}/code/generate?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create a new subject
  async create(subjectData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update an existing subject
  async update(id, subjectData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete a subject
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Assign subject to levels
  async assignLevels(id, category, levels = []) {
    const response = await fetch(`${API_BASE_URL}/${id}/assign-levels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, levels })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Assign subject to programmes (for elective subjects)
  async assignProgrammes(id, programmeIds) {
    const response = await fetch(`${API_BASE_URL}/${id}/assign-programmes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programme_ids: programmeIds })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};