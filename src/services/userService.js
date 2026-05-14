// services/userService.js

const API_BASE_URL = 'http://localhost:8000/api/users';

export const userService = {
  // Get all users with pagination and filters
  async getAll(role = null, status = null, search = null, page = 1, pageSize = 50) {
    const params = new URLSearchParams({
      page,
      page_size: pageSize
    });
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/?${params}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get user by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create user
  async create(userData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update user
  async update(id, userData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete user (soft delete)
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Reset user password
  async resetPassword(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/reset-password`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Toggle user status (active/suspended)
  async toggleStatus(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/toggle-status`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get available roles
  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles/list`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Check username availability
  async checkUsername(username) {
    const response = await fetch(`${API_BASE_URL}/check/username/${username}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.available;
  },

  // Check email availability
  async checkEmail(email) {
    const response = await fetch(`${API_BASE_URL}/check/email/${email}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.available;
  }
};