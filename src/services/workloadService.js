// services/workloadService.js

const API_BASE_URL = 'http://localhost:8000/api/workload';

export const workloadService = {
  // Get all teacher workload data
  async getTeacherWorkload(academicYearId = null, threshold = 25) {
    let url = `${API_BASE_URL}/teachers?threshold=${threshold}`;
    if (academicYearId) url += `&academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get workload statistics
  async getStatistics(academicYearId = null, threshold = 25) {
    let url = `${API_BASE_URL}/statistics?threshold=${threshold}`;
    if (academicYearId) url += `&academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get workload recommendations
  async getRecommendations(academicYearId = null, threshold = 25) {
    let url = `${API_BASE_URL}/recommendations?threshold=${threshold}`;
    if (academicYearId) url += `&academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get threshold
  async getThreshold() {
    const response = await fetch(`${API_BASE_URL}/threshold`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data.threshold;
  },

  // Update threshold
  async updateThreshold(threshold) {
    const response = await fetch(`${API_BASE_URL}/threshold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get detailed workload for a specific teacher
  async getTeacherDetail(teacherId, academicYearId = null) {
    let url = `${API_BASE_URL}/teacher/${teacherId}`;
    if (academicYearId) url += `?academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get available academic years
  async getAcademicYears() {
    const response = await fetch('http://localhost:8000/api/academic-years/');
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// Helper function to get status color
export const getWorkloadStatusColor = (periods, threshold) => {
  if (periods > threshold) return 'overload';
  if (periods < threshold - 10) return 'warning';
  return 'normal';
};

// Helper function to get status text
export const getWorkloadStatusText = (periods, threshold) => {
  if (periods > threshold) return 'Overloaded';
  if (periods < threshold - 10) return 'Underloaded';
  return 'Normal';
};

// Helper function to get status badge class
export const getWorkloadBadgeClass = (periods, threshold) => {
  if (periods > threshold) return 'status-badge status-warning';
  if (periods < threshold - 10) return 'status-badge status-info';
  return 'status-badge status-success';
};

// Helper function to calculate workload percentage
export const getWorkloadPercentage = (periods, threshold) => {
  return Math.min((periods / threshold) * 100, 150);
};

// Helper function to classify workload
export const classifyWorkload = (periods, threshold) => {
  if (periods > threshold) return 'overloaded';
  if (periods < threshold - 10) return 'underloaded';
  return 'normal';
};