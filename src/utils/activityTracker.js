// src/utils/activityTracker.js
class ActivityTracker {
  constructor() {
    this.lastActivity = Date.now();
    this.activities = [];
    this.maxActivities = 50;
    
    // Load last activity from localStorage if exists
    const stored = localStorage.getItem('last_activity');
    if (stored) {
      this.lastActivity = parseInt(stored);
    }
  }
  
  updateActivity(type = 'interaction', details = {}) {
    this.lastActivity = Date.now();
    localStorage.setItem('last_activity', this.lastActivity.toString());
    
    // Optional: Log activity for debugging
    if (process.env.NODE_ENV === 'development') {
      const activity = {
        type,
        timestamp: new Date().toISOString(),
        ...details
      };
      
      this.activities.unshift(activity);
      if (this.activities.length > this.maxActivities) {
        this.activities.pop();
      }
      
      console.log('📊 Activity recorded:', type);
    }
  }
  
  getInactiveTime() {
    return Date.now() - this.lastActivity;
  }
  
  getActivities() {
    return this.activities;
  }
}

export default new ActivityTracker();