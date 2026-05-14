// services/exportService.js

const API_BASE_URL = 'http://localhost:8000/api/export';

export const exportService = {
  // Export data to CSV
  async exportToCSV(exportType, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/csv/${exportType}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Export failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true };
  },

  // Export data to Excel
  async exportToExcel(exportType, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/excel/${exportType}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Export failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true };
  },

  // Export data to JSON
  async exportToJSON(exportType, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/json/${exportType}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Export failed');
    }
    
    const data = await response.json();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true };
  },

  // Generic export method
  async exportData(exportType, format, filters = {}) {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(exportType, filters);
      case 'excel':
        return this.exportToExcel(exportType, filters);
      case 'json':
        return this.exportToJSON(exportType, filters);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  },

  // Get available export types
  async getExportTypes() {
    const response = await fetch(`${API_BASE_URL}/types`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get filter options for a specific export type
  async getFilterOptions(exportType) {
    const response = await fetch(`${API_BASE_URL}/filters/${exportType}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};