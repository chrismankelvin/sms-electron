// services/academicYearService.js

const API_BASE_URL = 'http://localhost:8000/api/academic-years';

export const academicYearService = {
  // Get all academic years
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get current academic year
  async getCurrent() {
    const response = await fetch(`${API_BASE_URL}/current`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get academic year by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create a new academic year
  async create(yearData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yearData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update an existing academic year
  async update(id, yearData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yearData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete an academic year
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Set an academic year as current
  async setCurrent(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/set-current`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Clone from previous academic year
  async clone(cloneData) {
    const response = await fetch(`${API_BASE_URL}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloneData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};