// // services/miniSettingsService.js
// const API_BASE_URL = "http://localhost:8000/api";

// class MiniSettingsService {
//   // Check if user has seen mini settings
//   async hasSeenMiniSettings() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/has-seen`);
//       if (!response.ok) {
//         // Fallback to localStorage
//         return localStorage.getItem('hasSeenMiniSettings') === 'true';
//       }
//       const data = await response.json();
//       return data.hasSeenMiniSettings;
//     } catch (error) {
//       console.error('Error checking mini settings:', error);
//       // Fallback to localStorage
//       return localStorage.getItem('hasSeenMiniSettings') === 'true';
//     }
//   }

//   // Mark as seen
//   async setSeenMiniSettings() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/seen`, {
//         method: 'POST',
//       });
      
//       if (!response.ok) throw new Error('Failed to update mini settings');
      
//       // Also store in localStorage as backup
//       localStorage.setItem('hasSeenMiniSettings', 'true');
      
//       return true;
//     } catch (error) {
//       console.error('Error updating mini settings:', error);
//       // Fallback to localStorage
//       localStorage.setItem('hasSeenMiniSettings', 'true');
//       return false;
//     }
//   }

//   // Get current theme
//   async getTheme() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/theme`);
//       if (!response.ok) {
//         // Fallback to localStorage
//         return localStorage.getItem('theme') || 'light';
//       }
//       const data = await response.json();
//       return data.theme;
//     } catch (error) {
//       console.error('Error fetching theme:', error);
//       return localStorage.getItem('theme') || 'light';
//     }
//   }

//   // Update theme
//   async updateTheme(theme) {
//     try {


//    const response = await fetch(`${API_BASE_URL}/mini-settings/theme?theme=${theme}`, {
//   method: 'POST',
// });
      
//       if (!response.ok) throw new Error('Failed to update theme');
      
//       // Also store in localStorage as backup
//       localStorage.setItem('theme', theme);
      
//       return true;
//     } catch (error) {
//       console.error('Error updating theme:', error);
//       // Fallback to localStorage
//       localStorage.setItem('theme', theme);
//       return false;
//     }
  
//   }

//   // Get screensaver setting
//   async getScreensaver() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver`);
//       if (!response.ok) {
//         // Fallback to localStorage
//         const saved = localStorage.getItem('screensaver');
//         return saved === 'true';
//       }
//       const data = await response.json();
//       return data.screensaver;
//     } catch (error) {
//       console.error('Error fetching screensaver:', error);
//       const saved = localStorage.getItem('screensaver');
//       return saved === 'true';
//     }
//   }

//   // Update screensaver
//   // async updateScreensaver(enabled) {
//   //   try {
//   //     const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver?screensaver=${enabled}`, {
//   // method: 'POST',
      
//   //     });
      
//   //     if (!response.ok) throw new Error('Failed to update screensaver');
      
//   //     // Also store in localStorage as backup
//   //     localStorage.setItem('screensaver', enabled.toString());
      
//   //     return true;
//   //   } catch (error) {
//   //     console.error('Error updating screensaver:', error);
//   //     // Fallback to localStorage
//   //     localStorage.setItem('screensaver', enabled.toString());
//   //     return false;
//   //   }
//   // }

// async updateScreensaver(enabled) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ enabled }), // ✅ FIX
//     });

//     if (!response.ok) throw new Error('Failed to update screensaver');

//     localStorage.setItem("screensaver", enabled.toString());
//     return true;
//   } catch (error) {
//     console.error('Error updating screensaver:', error);
//     localStorage.setItem("screensaver", enabled.toString());
//     return false;
//   }
// }



//   // Get school type
//   async getSchoolType() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/school-type`);
//       if (!response.ok) {
//         // Fallback to localStorage
//         return localStorage.getItem('schoolType') || 'SHS';
//       }
//       const data = await response.json();
//       return data.schoolType;
//     } catch (error) {
//       console.error('Error fetching school type:', error);
//       return localStorage.getItem('schoolType') || 'SHS';
//     }
//   }

//   // Update school type
// //   async updateSchoolType(schoolType) {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mini-settings/school-type?school-type=${schoolType}`, {
// //   method: 'POST',
// // });
      
// //       if (!response.ok) throw new Error('Failed to update school type');
      
// //       // Also store in localStorage as backup
// //       localStorage.setItem('schoolType', schoolType);
      
// //       return true;
// //     } catch (error) {
// //       console.error('Error updating school type:', error);
// //       // Fallback to localStorage
// //       localStorage.setItem('schoolType', schoolType);
// //       return false;
// //     }
// //   }

// async updateSchoolType(schoolType) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/mini-settings/school-type`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ school_type: schoolType }), // ✅ clean
//     });

//     if (!response.ok) throw new Error('Failed to update school type');

//     return true;
//   } catch (error) {
//     console.error('Error updating school type:', error);
//     return false;
//   }
// }

// // Get all mini settings at once
//   async getAllMiniSettings() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/`);
//       if (!response.ok) {
//         // Fallback to localStorage
//         return this.getLocalMiniSettings();
//       }
//       return await response.json();
//     } catch (error) {
//       console.error('Error fetching all mini settings:', error);
//       return this.getLocalMiniSettings();
//     }
//   }

//   // Save all mini settings at once
//   async saveAllMiniSettings(settings) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/save-all`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           hasSeenMiniSettings: settings.hasSeenMiniSettings,
//           theme: settings.theme,
//           screensaver: settings.screensaver,
//           schoolType: settings.schoolType
//         }),
//       });
      
//       if (!response.ok) throw new Error('Failed to save mini settings');
      
//       // Also store in localStorage as backup
//       this.saveLocalMiniSettings(settings);
      
//       return true;
//     } catch (error) {
//       console.error('Error saving all mini settings:', error);
//       // Fallback to localStorage
//       this.saveLocalMiniSettings(settings);
//       return false;
//     }
//   }

//   // Helper: Get mini settings from localStorage
//   getLocalMiniSettings() {
//     return {
//       hasSeenMiniSettings: localStorage.getItem('hasSeenMiniSettings') === 'true',
//       theme: localStorage.getItem('theme') || 'light',
//       screensaver: localStorage.getItem('screensaver') === 'true',
//       schoolType: localStorage.getItem('schoolType') || 'SHS'
//     };
//   }

//   // Helper: Save mini settings to localStorage
//   saveLocalMiniSettings(settings) {
//     localStorage.setItem('hasSeenMiniSettings', settings.hasSeenMiniSettings.toString());
//     localStorage.setItem('theme', settings.theme);
//     localStorage.setItem('screensaver', settings.screensaver.toString());
//     localStorage.setItem('schoolType', settings.schoolType);
//   }
// }

// export const miniSettingsService = new MiniSettingsService();



// services/miniSettingsService.js
const API_BASE_URL = "http://localhost:8000/api";

class MiniSettingsService {
  // Check if user has seen mini settings
  async hasSeenMiniSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/has-seen`);
      if (!response.ok) {
        // Fallback to localStorage
        return localStorage.getItem('hasSeenMiniSettings') === 'true';
      }
      const data = await response.json();
      return data.hasSeenMiniSettings;
    } catch (error) {
      console.error('Error checking mini settings:', error);
      // Fallback to localStorage
      return localStorage.getItem('hasSeenMiniSettings') === 'true';
    }
  }

  // Mark as seen
  async setSeenMiniSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/seen`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to update mini settings');
      
      // Also store in localStorage as backup
      localStorage.setItem('hasSeenMiniSettings', 'true');
      
      return true;
    } catch (error) {
      console.error('Error updating mini settings:', error);
      // Fallback to localStorage
      localStorage.setItem('hasSeenMiniSettings', 'true');
      return false;
    }
  }

  // Get current theme
  async getTheme() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/theme`);
      if (!response.ok) {
        // Fallback to localStorage
        return localStorage.getItem('theme') || 'light';
      }
      const data = await response.json();
      return data.theme;
    } catch (error) {
      console.error('Error fetching theme:', error);
      return localStorage.getItem('theme') || 'light';
    }
  }

  // Update theme
  async updateTheme(theme) {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/theme?theme=${theme}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to update theme');
      
      // Also store in localStorage as backup
      localStorage.setItem('theme', theme);
      
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      // Fallback to localStorage
      localStorage.setItem('theme', theme);
      return false;
    }
  }

  // Get screensaver setting
  async getScreensaver() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver`);
      if (!response.ok) {
        // Fallback to localStorage
        const saved = localStorage.getItem('screensaver');
        return saved === 'true';
      }
      const data = await response.json();
      return data.screensaver;
    } catch (error) {
      console.error('Error fetching screensaver:', error);
      const saved = localStorage.getItem('screensaver');
      return saved === 'true';
    }
  }

  // Update screensaver
  async updateScreensaver(enabled) {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) throw new Error('Failed to update screensaver');

      localStorage.setItem("screensaver", enabled.toString());
      return true;
    } catch (error) {
      console.error('Error updating screensaver:', error);
      localStorage.setItem("screensaver", enabled.toString());
      return false;
    }
  }

  // ========== LEGACY SCHOOL TYPE METHODS (Backward Compatible) ==========
  // Get school type (legacy - single value)
  async getSchoolType() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/school-type`);
      if (!response.ok) {
        // Fallback to localStorage
        return localStorage.getItem('schoolType') || 'SHS';
      }
      const data = await response.json();
      return data.schoolType;
    } catch (error) {
      console.error('Error fetching school type:', error);
      return localStorage.getItem('schoolType') || 'SHS';
    }
  }

  // Update school type (legacy - single value)
  async updateSchoolType(schoolType) {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/school-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ school_type: schoolType }),
      });

      if (!response.ok) throw new Error('Failed to update school type');

      // Also store in localStorage as backup
      localStorage.setItem('schoolType', schoolType);
      
      return true;
    } catch (error) {
      console.error('Error updating school type:', error);
      localStorage.setItem('schoolType', schoolType);
      return false;
    }
  }

  // ========== NEW: SCHOOL TYPES ARRAY METHODS ==========
  // Get school types (array - up to 4)
  async getSchoolTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/school-types`);
      if (!response.ok) {
        // Fallback to localStorage
        const saved = localStorage.getItem('schoolTypes');
        return saved ? JSON.parse(saved) : ['shs'];
      }
      const data = await response.json();
      return data.schoolTypes;
    } catch (error) {
      console.error('Error fetching school types:', error);
      const saved = localStorage.getItem('schoolTypes');
      return saved ? JSON.parse(saved) : ['shs'];
    }
  }

  // Update school types (max 4)
  async updateSchoolTypes(schoolTypes) {
    if (schoolTypes.length > 4) {
      console.error('Maximum 4 school types allowed');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/school-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ school_types: schoolTypes }),
      });

      if (!response.ok) throw new Error('Failed to update school types');

      localStorage.setItem('schoolTypes', JSON.stringify(schoolTypes));
      return true;
    } catch (error) {
      console.error('Error updating school types:', error);
      localStorage.setItem('schoolTypes', JSON.stringify(schoolTypes));
      return false;
    }
  }

  // ========== NEW: ASSESSMENT TYPES METHODS ==========
  // Get assessment types (array - up to 2)
  async getAssessmentTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/assessment-types`);
      if (!response.ok) {
        // Fallback to localStorage
        const saved = localStorage.getItem('assessmentTypes');
        return saved ? JSON.parse(saved) : ['GPA'];
      }
      const data = await response.json();
      return data.assessmentTypes;
    } catch (error) {
      console.error('Error fetching assessment types:', error);
      const saved = localStorage.getItem('assessmentTypes');
      return saved ? JSON.parse(saved) : ['GPA'];
    }
  }

  // Update assessment types (max 2)
  async updateAssessmentTypes(assessmentTypes) {
    if (assessmentTypes.length > 2) {
      console.error('Maximum 2 assessment types allowed');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/assessment-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assessment_types: assessmentTypes }),
      });

      if (!response.ok) throw new Error('Failed to update assessment types');

      localStorage.setItem('assessmentTypes', JSON.stringify(assessmentTypes));
      return true;
    } catch (error) {
      console.error('Error updating assessment types:', error);
      localStorage.setItem('assessmentTypes', JSON.stringify(assessmentTypes));
      return false;
    }
  }

  // ========== NEW: LOGIN CONFIGURATIONS METHODS ==========
  // Get login configurations (array)
  async getLoginConfigs() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/login-configs`);
      if (!response.ok) {
        // Fallback to localStorage
        const saved = localStorage.getItem('loginConfigs');
        return saved ? JSON.parse(saved) : ['student', 'teachers'];
      }
      const data = await response.json();
      return data.loginConfigs;
    } catch (error) {
      console.error('Error fetching login configs:', error);
      const saved = localStorage.getItem('loginConfigs');
      return saved ? JSON.parse(saved) : ['student', 'teachers'];
    }
  }

  // Update login configurations
  async updateLoginConfigs(loginConfigs) {
    const validRoles = ['student', 'teachers', 'parent', 'non-staff', 'TA', 'accountant'];
    const isValid = loginConfigs.every(role => validRoles.includes(role));
    
    if (!isValid) {
      console.error('Invalid login role detected');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/login-configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login_configs: loginConfigs }),
      });

      if (!response.ok) throw new Error('Failed to update login configs');

      localStorage.setItem('loginConfigs', JSON.stringify(loginConfigs));
      return true;
    } catch (error) {
      console.error('Error updating login configs:', error);
      localStorage.setItem('loginConfigs', JSON.stringify(loginConfigs));
      return false;
    }
  }

  // ========== GET ALL SETTINGS (UPDATED) ==========
  // Get all mini settings at once
  async getAllMiniSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/`);
      if (!response.ok) {
        // Fallback to localStorage
        return this.getLocalMiniSettings();
      }
      const data = await response.json();
      // Ensure all fields exist
      return {
        hasSeenMiniSettings: data.hasSeenMiniSettings || false,
        theme: data.theme || 'light',
        screensaver: data.screensaver || false,
        schoolTypes: data.schoolTypes || data.schoolType ? [data.schoolType.toLowerCase()] : ['shs'],
        assessmentTypes: data.assessmentTypes || ['GPA'],
        loginConfigs: data.loginConfigs || ['student', 'teachers']
      };
    } catch (error) {
      console.error('Error fetching all mini settings:', error);
      return this.getLocalMiniSettings();
    }
  }

  // Save all mini settings at once (UPDATED for new format)
  async saveAllMiniSettings(settings) {
    try {
      // Try to use the new V2 endpoint first
      const response = await fetch(`${API_BASE_URL}/mini-settings/save-all-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasSeenMiniSettings: settings.hasSeenMiniSettings,
          theme: settings.theme,
          screensaver: settings.screensaver,
          schoolTypes: settings.schoolTypes || [settings.schoolType?.toLowerCase() || 'shs'],
          assessmentTypes: settings.assessmentTypes || ['GPA'],
          loginConfigs: settings.loginConfigs || ['student', 'teachers']
        }),
      });
      
      if (!response.ok) {
        // Fallback to legacy endpoint
        return this.saveAllMiniSettingsLegacy(settings);
      }
      
      // Also store in localStorage as backup
      this.saveLocalMiniSettings(settings);
      
      return true;
    } catch (error) {
      console.error('Error saving all mini settings:', error);
      // Fallback to localStorage
      this.saveLocalMiniSettings(settings);
      return false;
    }
  }

  // Legacy save method for backward compatibility
  async saveAllMiniSettingsLegacy(settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/save-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasSeenMiniSettings: settings.hasSeenMiniSettings,
          theme: settings.theme,
          screensaver: settings.screensaver,
          schoolType: settings.schoolType || (settings.schoolTypes && settings.schoolTypes[0]?.toUpperCase()) || 'SHS'
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save mini settings');
      
      return true;
    } catch (error) {
      console.error('Error saving mini settings (legacy):', error);
      return false;
    }
  }

  // Helper: Get mini settings from localStorage (UPDATED)
  getLocalMiniSettings() {
    return {
      hasSeenMiniSettings: localStorage.getItem('hasSeenMiniSettings') === 'true',
      theme: localStorage.getItem('theme') || 'light',
      screensaver: localStorage.getItem('screensaver') === 'true',
      schoolTypes: JSON.parse(localStorage.getItem('schoolTypes') || '["shs"]'),
      assessmentTypes: JSON.parse(localStorage.getItem('assessmentTypes') || '["GPA"]'),
      loginConfigs: JSON.parse(localStorage.getItem('loginConfigs') || '["student", "teachers"]')
    };
  }

  // Helper: Save mini settings to localStorage (UPDATED)
  saveLocalMiniSettings(settings) {
    localStorage.setItem('hasSeenMiniSettings', settings.hasSeenMiniSettings.toString());
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('screensaver', settings.screensaver.toString());
    localStorage.setItem('schoolTypes', JSON.stringify(settings.schoolTypes || [settings.schoolType?.toLowerCase() || 'shs']));
    localStorage.setItem('assessmentTypes', JSON.stringify(settings.assessmentTypes || ['GPA']));
    localStorage.setItem('loginConfigs', JSON.stringify(settings.loginConfigs || ['student', 'teachers']));
    
    // Also maintain legacy fields for backward compatibility
    const primarySchoolType = settings.schoolTypes?.[0] || settings.schoolType || 'SHS';
    localStorage.setItem('schoolType', primarySchoolType.toUpperCase());
  }

  // ========== HELPER METHODS FOR UI ==========
  // Available options for UI components
  getAvailableSchoolTypes() {
    return ['kindergarten', 'primary', 'jhs', 'shs', 'institute'];
  }

  getAvailableAssessmentTypes() {
    return ['montessori', 'international (IB/Cambridge)', 'GPA'];
  }

  getAvailableLoginRoles() {
    return ['student', 'teachers', 'parent', 'non-staff', 'TA', 'accountant'];
  }

  // Reset all settings to defaults
  async resetMiniSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/reset`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to reset mini settings');
      
      // Clear localStorage
      localStorage.removeItem('hasSeenMiniSettings');
      localStorage.removeItem('theme');
      localStorage.removeItem('screensaver');
      localStorage.removeItem('schoolTypes');
      localStorage.removeItem('assessmentTypes');
      localStorage.removeItem('loginConfigs');
      localStorage.removeItem('schoolType');
      
      return true;
    } catch (error) {
      console.error('Error resetting mini settings:', error);
      return false;
    }
  }
}

export const miniSettingsService = new MiniSettingsService();