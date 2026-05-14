// services/timeSlotService.js

const API_BASE_URL = 'http://localhost:8000/api/time-slots';

export const timeSlotService = {
  // Get all time slots
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get time slot by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Check time overlap
  async checkOverlap(startTime, endTime, excludeId = null) {
    let url = `${API_BASE_URL}/check-overlap?start_time=${startTime}&end_time=${endTime}`;
    if (excludeId) url += `&exclude_id=${excludeId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create time slot
  async create(slotData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update time slot
  async update(id, slotData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete time slot
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Reorder time slots
  async reorder(slotIds) {
    const response = await fetch(`${API_BASE_URL}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_ids: slotIds })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};