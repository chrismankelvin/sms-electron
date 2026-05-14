// services/roomService.js

const API_BASE_URL = 'http://localhost:8000/api/rooms';

export const roomService = {
  // Get all rooms with optional filters
  async getAll(roomType = null, building = null, isActive = null) {
    let url = `${API_BASE_URL}/`;
    const params = [];
    if (roomType) params.push(`room_type=${roomType}`);
    if (building) params.push(`building=${encodeURIComponent(building)}`);
    if (isActive !== null) params.push(`is_active=${isActive}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get room by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get room types
  async getTypes() {
    const response = await fetch(`${API_BASE_URL}/types`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create room
  async create(roomData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update room
  async update(id, roomData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete room
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};