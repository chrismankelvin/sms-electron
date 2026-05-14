// services/weekDayService.js

const API_BASE_URL = 'http://localhost:8000/api/week-days';

export const weekDayService = {
  // Get all week days
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get active week days only
  async getActive() {
    const response = await fetch(`${API_BASE_URL}/active`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get week day by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create week day
  async create(dayData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dayData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update week day
  async update(id, dayData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dayData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete week day
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Reorder week days
  async reorder(dayIds) {
    const response = await fetch(`${API_BASE_URL}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_ids: dayIds })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Toggle active status
  async toggleActive(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/toggle-active`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};