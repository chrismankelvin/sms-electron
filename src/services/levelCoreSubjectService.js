// // services/levelCoreSubjectService.js

// const API_BASE_URL = 'http://localhost:8000/api/level-core-subjects';

// export const levelCoreSubjectService = {
//   // Get all core subject assignments
//   async getAll() {
//     const response = await fetch(`${API_BASE_URL}/`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Get levels list
//   async getLevels() {
//     const response = await fetch(`${API_BASE_URL}/levels`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Get all subjects
//   async getSubjects() {
//     const response = await fetch(`${API_BASE_URL}/subjects`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Get core subjects for a specific level
//   async getByLevel(levelId) {
//     const response = await fetch(`${API_BASE_URL}/${levelId}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Get assignment matrix
//   async getMatrix() {
//     const response = await fetch(`${API_BASE_URL}/matrix`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Bulk update core subjects for a level
//   async bulkUpdate(levelId, subjectIds) {
//     const response = await fetch(`${API_BASE_URL}/bulk`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ level_id: levelId, subject_ids: subjectIds })
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Assign a single core subject
//   async assign(levelId, subjectId) {
//     const response = await fetch(`${API_BASE_URL}/assign`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ level_id: levelId, subject_id: subjectId })
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   // Remove a core subject assignment
//   async remove(levelId, subjectId) {
//     const response = await fetch(`${API_BASE_URL}/${levelId}/${subjectId}`, {
//       method: 'DELETE'
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return true;
//   }
// };










// services/levelCoreSubjectService.js

const API_BASE_URL = 'http://localhost:8000/api';

export const levelCoreSubjectService = {
  // Get all core subject assignments
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  // Get levels list
  async getLevels() {
    try {
      // Try to get levels from the level-core-subjects endpoint first
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/levels`);
      if (!response.ok) {
        // Fallback to the levels endpoint from the data you showed
        const fallbackResponse = await fetch(`${API_BASE_URL}/levels/`);
        if (!fallbackResponse.ok) throw new Error(`HTTP ${fallbackResponse.status}`);
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) return fallbackData.data;
        throw new Error(fallbackData.message);
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error in getLevels:', error);
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  // Get all subjects
  async getSubjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error in getSubjects:', error);
      return [];
    }
  },

  // Get core subjects for a specific level
  async getByLevel(levelId) {
    try {
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/level/${levelId}`);
      if (!response.ok) {
        // Fallback to matrix endpoint
        const matrixData = await this.getMatrix();
        const levelMatrix = matrixData.matrix?.find(m => m.level_id === levelId);
        return {
          core_subject_ids: levelMatrix?.subjects?.filter(s => s.is_core).map(s => s.subject_id) || [],
          core_subjects: levelMatrix?.subjects?.filter(s => s.is_core) || []
        };
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error in getByLevel:', error);
      return { core_subject_ids: [], core_subjects: [] };
    }
  },

  // Get assignment matrix
  async getMatrix() {
    try {
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/matrix`);
      
      if (!response.ok) {
        // If matrix endpoint returns 422, try to build matrix from other data
        if (response.status === 422) {
          console.warn('Matrix endpoint returned 422, building matrix from levels and subjects...');
          return await this.buildMatrixFromData();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.success) {
        return data.data;
      }
      
      // If response is already the matrix structure
      if (data.matrix && data.subjects) {
        return data;
      }
      
      // If response is an array of assignments
      if (Array.isArray(data)) {
        return this.transformToMatrix(data);
      }
      
      throw new Error(data.message || 'Failed to load matrix data');
      
    } catch (error) {
      console.error('Error in getMatrix:', error);
      // Return empty structure instead of throwing
      return {
        subjects: [],
        matrix: []
      };
    }
  },

  // Build matrix from levels and subjects data (fallback when matrix endpoint fails)
  async buildMatrixFromData() {
    try {
      const [levels, subjects] = await Promise.all([
        this.getLevels(),
        this.getSubjects()
      ]);
      
      // Get existing assignments if any
      let assignments = [];
      try {
        const assignmentsResponse = await this.getAll();
        assignments = assignmentsResponse || [];
      } catch (e) {
        assignments = [];
      }
      
      const matrix = levels.map(level => ({
        level_id: level.id || level.level_id,
        level_name: level.name || level.level_name,
        subjects: subjects.map(subject => ({
          subject_id: subject.id,
          subject_name: subject.name,
          is_core: assignments.some(a => 
            (a.level_id === level.id || a.level_id === level.level_id) && 
            (a.subject_id === subject.id)
          )
        }))
      }));
      
      return {
        subjects: subjects,
        matrix: matrix
      };
      
    } catch (error) {
      console.error('Error building matrix from data:', error);
      return { subjects: [], matrix: [] };
    }
  },

  // Transform assignments array to matrix format
  transformToMatrix(assignments) {
    const levels = [...new Map(assignments.map(a => [a.level_id, { id: a.level_id, name: a.level_name }])).values()];
    const subjects = [...new Map(assignments.map(a => [a.subject_id, { id: a.subject_id, name: a.subject_name }])).values()];
    
    const matrix = levels.map(level => ({
      level_id: level.id,
      level_name: level.name,
      subjects: subjects.map(subject => ({
        subject_id: subject.id,
        subject_name: subject.name,
        is_core: assignments.some(a => a.level_id === level.id && a.subject_id === subject.id)
      }))
    }));
    
    return { subjects, matrix };
  },

  // Bulk update core subjects for a level
  async bulkUpdate(levelId, subjectIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_id: levelId, subject_ids: subjectIds })
      });
      
      if (!response.ok) {
        // Try alternative endpoint
        const altResponse = await fetch(`${API_BASE_URL}/level-core-subjects/${levelId}/core-subjects`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject_ids: subjectIds })
        });
        if (!altResponse.ok) throw new Error(`HTTP ${altResponse.status}`);
        const altData = await altResponse.json();
        if (!altData.success) throw new Error(altData.message);
        return altData.data;
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
      
    } catch (error) {
      console.error('Error in bulkUpdate:', error);
      throw error;
    }
  },

  // Assign a single core subject
  async assign(levelId, subjectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_id: levelId, subject_id: subjectId })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error('Error in assign:', error);
      throw error;
    }
  },

  // Remove a core subject assignment
  async remove(levelId, subjectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/level-core-subjects/${levelId}/${subjectId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return true;
    } catch (error) {
      console.error('Error in remove:', error);
      throw error;
    }
  }
};