// utils/settings.js
export const Settings = {
  // Theme
  getTheme() {
    return localStorage.getItem("theme") || "light";
  },
  setTheme(theme) {
    localStorage.setItem("theme", theme);
    document.body.classList.toggle("dark-mode", theme === "dark");
  },
  
  // Screensaver
  getScreensaver() {
    return localStorage.getItem("screensaver") === "true";
  },
  setScreensaver(enabled) {
    localStorage.setItem("screensaver", enabled.toString());
  },
  
  // School mode
  getSchoolType() {
    return localStorage.getItem("schoolType") || "SHS";
  },
  setSchoolType(type) {
    localStorage.setItem("schoolType", type);
  }
};