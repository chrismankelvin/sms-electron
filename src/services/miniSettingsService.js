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
  // async updateScreensaver(enabled) {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver?screensaver=${enabled}`, {
  // method: 'POST',
      
  //     });
      
  //     if (!response.ok) throw new Error('Failed to update screensaver');
      
  //     // Also store in localStorage as backup
  //     localStorage.setItem('screensaver', enabled.toString());
      
  //     return true;
  //   } catch (error) {
  //     console.error('Error updating screensaver:', error);
  //     // Fallback to localStorage
  //     localStorage.setItem('screensaver', enabled.toString());
  //     return false;
  //   }
  // }

  async updateScreensaver(enabled) {
  try {
    const response = await fetch(`${API_BASE_URL}/mini-settings/screensaver?enabled=${enabled}`, {
  method: 'POST',
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



  // Get school type
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

  // Update school type
//   async updateSchoolType(schoolType) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mini-settings/school-type?school-type=${schoolType}`, {
//   method: 'POST',
// });
      
//       if (!response.ok) throw new Error('Failed to update school type');
      
//       // Also store in localStorage as backup
//       localStorage.setItem('schoolType', schoolType);
      
//       return true;
//     } catch (error) {
//       console.error('Error updating school type:', error);
//       // Fallback to localStorage
//       localStorage.setItem('schoolType', schoolType);
//       return false;
//     }
//   }

async updateSchoolType(schoolType) {
  try {
    console.log({ school_type: schoolType });
    const response =await fetch(
  `${API_BASE_URL}/mini-settings/school-type?school_type=${schoolType}`,
  { method: 'POST' }
);

    if (!response.ok) throw new Error('Failed to update school type');

    return true;
  } catch (error) {
    console.error('Error updating school type:', error);
    return false;
  }
}

// Get all mini settings at once
  async getAllMiniSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/mini-settings/`);
      if (!response.ok) {
        // Fallback to localStorage
        return this.getLocalMiniSettings();
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all mini settings:', error);
      return this.getLocalMiniSettings();
    }
  }

  // Save all mini settings at once
  async saveAllMiniSettings(settings) {
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
          schoolType: settings.schoolType
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save mini settings');
      
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

  // Helper: Get mini settings from localStorage
  getLocalMiniSettings() {
    return {
      hasSeenMiniSettings: localStorage.getItem('hasSeenMiniSettings') === 'true',
      theme: localStorage.getItem('theme') || 'light',
      screensaver: localStorage.getItem('screensaver') === 'true',
      schoolType: localStorage.getItem('schoolType') || 'SHS'
    };
  }

  // Helper: Save mini settings to localStorage
  saveLocalMiniSettings(settings) {
    localStorage.setItem('hasSeenMiniSettings', settings.hasSeenMiniSettings.toString());
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('screensaver', settings.screensaver.toString());
    localStorage.setItem('schoolType', settings.schoolType);
  }
}

export const miniSettingsService = new MiniSettingsService();