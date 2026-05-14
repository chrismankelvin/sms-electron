// services/systemHealthService.js

const API_BASE_URL = 'http://localhost:8000/api/system-health';

export const systemHealthService = {
  // Get system health metrics
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Run diagnostics
  async runDiagnostics() {
    const response = await fetch(`${API_BASE_URL}/diagnostics`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Clear cache
  async clearCache() {
    const response = await fetch(`${API_BASE_URL}/cache/clear`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get system metrics
  async getSystemMetrics() {
    const response = await fetch(`${API_BASE_URL}/metrics/system`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get database metrics
  async getDatabaseMetrics() {
    const response = await fetch(`${API_BASE_URL}/metrics/database`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};