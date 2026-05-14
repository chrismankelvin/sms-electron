// services/timetableService.js

const API_BASE_URL = 'http://localhost:8000/api/timetable';

export const timetableService = {
  // Get all timetable entries with filters
  async getEntries(classId = null, academicYearId = null, dayId = null) {
    let url = `${API_BASE_URL}/entries`;
    const params = [];
    if (classId) params.push(`class_id=${classId}`);
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (dayId) params.push(`day_id=${dayId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get timetable by class and academic year
  async getByClass(classId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/by-class/${classId}?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create a single timetable entry
  async createEntry(entryData) {
    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Bulk create timetable entries
  async bulkCreateEntries(entries) {
    const response = await fetch(`${API_BASE_URL}/entries/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update a timetable entry
  async updateEntry(id, entryData) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Delete a timetable entry
  async deleteEntry(id) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Validate timetable
  async validate(classId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/validate?class_id=${classId}&academic_year_id=${academicYearId}`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Copy timetable from source to target
  async copyTimetable(sourceClassId, sourceAcademicYearId, targetClassId, targetAcademicYearId) {
    const response = await fetch(`${API_BASE_URL}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_class_id: sourceClassId,
        source_academic_year_id: sourceAcademicYearId,
        target_class_id: targetClassId,
        target_academic_year_id: targetAcademicYearId
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};