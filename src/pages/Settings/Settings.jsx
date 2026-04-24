// // Settings.jsx - Updated with imported Updates component
// import { useState, useEffect } from "react";
// import {
//   Settings as SettingsIcon,
//   Monitor,
//   Users,
//   School,
//   Building,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   User,
//   UserCog,
//   Globe,
//   Wifi,
//   WifiOff,
//   Shield,
//   AlertTriangle,
//   Download,
//   RefreshCw,
//   CheckCircle,
//   XCircle,
//   Save,
//   Edit,
//   Eye,
//   EyeOff,
//   Database,
//   Cloud
// } from "lucide-react";
// import Notification from "../../components/Notification";
// import Updates from "./Updates";
// import "../../styles/settings.css";

// export default function Settings() {
//   const [activeTab, setActiveTab] = useState("general");
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);

//   // GENERAL Settings
//   const [screensaver, setScreensaver] = useState(false);
//   const [peakMode, setPeakMode] = useState(false);

//   // SCHOOL INFORMATION
//   const [schoolInfo, setSchoolInfo] = useState({
//     name: "PHASH-C International School",
//     logo: "",
//     motto: "Excellence in Education",
//     address: "123 Education Street",
//     postalCode: "00233",
//     principalName: "Dr. John Doe",
//     principalEmail: "principal@phashc.edu",
//     vicePrincipalName: "Mrs. Jane Smith",
//     vicePrincipalEmail: "vp@phashc.edu",
//     establishmentYear: "2010"
//   });

//   // CONFIGURATION - Login Enabled
//   const [loginConfig, setLoginConfig] = useState({
//     student: true,
//     teacher: true,
//     teachingAssistant: false,
//     nonStaff: false,
//     accountant: true
//   });

//   // MODE Settings
//   const [mode, setMode] = useState("online");
//   const [liveMode, setLiveMode] = useState(true);
//   const [lastSync, setLastSync] = useState("2024-01-15 10:30 AM");

//   // ACTIVATION Status
//   const [activation, setActivation] = useState({
//     isActivated: true,
//     licenseKey: "XXXX-XXXX-XXXX-XXXX",
//     expiryDate: "2025-12-31",
//     deviceId: "DEV-12345-ABCDE"
//   });

//   // Load settings from localStorage on mount
//   useEffect(() => {
//     loadSettings();
//   }, []);

//   const loadSettings = () => {
//     const saved = localStorage.getItem("app_settings");
//     if (saved) {
//       try {
//         const settings = JSON.parse(saved);
//         setScreensaver(settings.screensaver || false);
//         setPeakMode(settings.peakMode || false);
//         if (settings.schoolInfo) setSchoolInfo(settings.schoolInfo);
//         if (settings.loginConfig) setLoginConfig(settings.loginConfig);
//         if (settings.mode) setMode(settings.mode);
//         if (settings.liveMode !== undefined) setLiveMode(settings.liveMode);
//       } catch (e) {
//         console.error("Failed to load settings");
//       }
//     }
//   };

//   const saveSettings = () => {
//     const settings = {
//       screensaver,
//       peakMode,
//       schoolInfo,
//       loginConfig,
//       mode,
//       liveMode
//     };
//     localStorage.setItem("app_settings", JSON.stringify(settings));
//     setNotification({ message: "Settings saved successfully!", type: "success" });
//     setEditMode(false);
//   };

//   const handleSchoolInfoChange = (field, value) => {
//     setSchoolInfo({ ...schoolInfo, [field]: value });
//   };

//   const handleLoginConfigChange = (key, value) => {
//     setLoginConfig({ ...loginConfig, [key]: value });
//   };

//   const handleDeactivate = () => {
//     if (window.confirm("Are you sure you want to deactivate this software? You will need a new activation code to reactivate.")) {
//       setActivation({ ...activation, isActivated: false });
//       setNotification({ message: "Software deactivated", type: "warning" });
//     }
//   };

//   const syncData = async () => {
//     setLoading(true);
//     setNotification({ message: "Syncing data...", type: "info" });
//     setTimeout(() => {
//       setLastSync(new Date().toLocaleString());
//       setNotification({ message: "Sync completed!", type: "success" });
//       setLoading(false);
//     }, 2000);
//   };

//   const tabs = [
//     { id: "general", label: "General", icon: <SettingsIcon size={18} /> },
//     { id: "school", label: "School Info", icon: <School size={18} /> },
//     { id: "config", label: "Configuration", icon: <Users size={18} /> },
//     { id: "mode", label: "Mode", icon: <Globe size={18} /> },
//     { id: "activation", label: "Activation", icon: <Shield size={18} /> },
//     { id: "updates", label: "Updates", icon: <Download size={18} /> }
//   ];

//   return (
//     <div className="settings-page">
//       <Notification
//         message={notification.message}
//         type={notification.type}
//         onClose={() => setNotification({ message: "", type: "" })}
//       />

//       <div className="settings-container">
//         {/* Header */}
//         <div className="settings-header">
//           <div className="header-title">
//             <SettingsIcon size={28} />
//             <h1>Settings</h1>
//           </div>
//           <div className="header-actions">
//             {editMode && (
//               <>
//                 <button className="btn-secondary" onClick={() => setEditMode(false)}>
//                   Cancel
//                 </button>
//                 <button className="btn-primary" onClick={saveSettings}>
//                   <Save size={16} /> Save Changes
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="settings-tabs">
//           {tabs.map(tab => (
//             <button
//               key={tab.id}
//               className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               {tab.icon}
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="settings-content">
//           {/* GENERAL */}
//           {activeTab === "general" && (
//             <div className="settings-section">
//               <h2>General Settings</h2>

//               <div className="setting-card">
//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <Monitor size={20} />
//                     <div>
//                       <h4>Screensaver</h4>
//                       <p>Enable screensaver when idle</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={screensaver} onChange={(e) => setScreensaver(e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>

//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <Users size={20} />
//                     <div>
//                       <h4>Peak Mode</h4>
//                       <p>Allow new registrations from login screen</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={peakMode} onChange={(e) => setPeakMode(e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* SCHOOL INFORMATION */}
//           {activeTab === "school" && (
//             <div className="settings-section">
//               <div className="section-header">
//                 <h2>School Information</h2>
//                 <button className="btn-icon" onClick={() => setEditMode(!editMode)}>
//                   {editMode ? <EyeOff size={16} /> : <Edit size={16} />}
//                   {editMode ? "View Mode" : "Edit"}
//                 </button>
//               </div>

//               <div className="setting-card">
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>School Name</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.name}
//                       onChange={(e) => handleSchoolInfoChange("name", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Motto</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.motto}
//                       onChange={(e) => handleSchoolInfoChange("motto", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group full-width">
//                     <label>Address</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.address}
//                       onChange={(e) => handleSchoolInfoChange("address", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Postal Code</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.postalCode}
//                       onChange={(e) => handleSchoolInfoChange("postalCode", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Establishment Year</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.establishmentYear}
//                       onChange={(e) => handleSchoolInfoChange("establishmentYear", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Principal Name</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.principalName}
//                       onChange={(e) => handleSchoolInfoChange("principalName", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Principal Email</label>
//                     <input
//                       type="email"
//                       value={schoolInfo.principalEmail}
//                       onChange={(e) => handleSchoolInfoChange("principalEmail", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Vice Principal</label>
//                     <input
//                       type="text"
//                       value={schoolInfo.vicePrincipalName}
//                       onChange={(e) => handleSchoolInfoChange("vicePrincipalName", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Vice Principal Email</label>
//                     <input
//                       type="email"
//                       value={schoolInfo.vicePrincipalEmail}
//                       onChange={(e) => handleSchoolInfoChange("vicePrincipalEmail", e.target.value)}
//                       disabled={!editMode}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* CONFIGURATION */}
//           {activeTab === "config" && (
//             <div className="settings-section">
//               <h2>Login Configuration</h2>
//               <p className="section-desc">Enable/disable login access for different roles</p>

//               <div className="setting-card">
//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <Users size={20} />
//                     <div>
//                       <h4>Student Login</h4>
//                       <p>Allow students to access the system</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={loginConfig.student} onChange={(e) => handleLoginConfigChange("student", e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>

//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <User size={20} />
//                     <div>
//                       <h4>Teacher Login</h4>
//                       <p>Allow teachers to access the system</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={loginConfig.teacher} onChange={(e) => handleLoginConfigChange("teacher", e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>

//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <UserCog size={20} />
//                     <div>
//                       <h4>Teaching Assistant Login</h4>
//                       <p>Allow teaching assistants to access the system</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={loginConfig.teachingAssistant} onChange={(e) => handleLoginConfigChange("teachingAssistant", e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>

//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <User size={20} />
//                     <div>
//                       <h4>Non-Staff Login</h4>
//                       <p>Allow non-staff members to access the system</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={loginConfig.nonStaff} onChange={(e) => handleLoginConfigChange("nonStaff", e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>

//                 <div className="setting-item">
//                   <div className="setting-info">
//                     <Building size={20} />
//                     <div>
//                       <h4>Accountant Login</h4>
//                       <p>Allow accountant to access financial modules</p>
//                     </div>
//                   </div>
//                   <label className="toggle-switch">
//                     <input type="checkbox" checked={loginConfig.accountant} onChange={(e) => handleLoginConfigChange("accountant", e.target.checked)} />
//                     <span className="toggle-slider"></span>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* MODE */}
//           {activeTab === "mode" && (
//             <div className="settings-section">
//               <h2>System Mode</h2>

//               <div className="mode-cards">
//                 {/* Online Mode */}
//                 <div className={`mode-card ${mode === "online" ? "active" : ""}`}>
//                   <div className="mode-icon online">
//                     <Wifi size={32} />
//                   </div>
//                   <h3>Online Mode</h3>
//                   <p>Real-time cloud sync, live data access</p>
//                   <button
//                     className={`mode-btn ${mode === "online" ? "active" : ""}`}
//                     onClick={() => setMode("online")}
//                   >
//                     {mode === "online" ? "Active" : "Switch to Online"}
//                   </button>
//                   {mode === "online" && (
//                     <div className="mode-actions">
//                       <button className="btn-sm" onClick={syncData} disabled={loading}>
//                         <RefreshCw size={14} /> Backup
//                       </button>
//                       <button className="btn-sm primary" onClick={() => setLiveMode(true)}>
//                         <Cloud size={14} /> Turn on live mode
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Offline Mode */}
//                 <div className={`mode-card ${mode === "offline" ? "active" : ""}`}>
//                   <div className="mode-icon offline">
//                     <WifiOff size={32} />
//                   </div>
//                   <h3>Offline Mode</h3>
//                   <p>Local storage, sync when online</p>
//                   <button
//                     className={`mode-btn ${mode === "offline" ? "active" : ""}`}
//                     onClick={() => setMode("offline")}
//                   >
//                     {mode === "offline" ? "Active" : "Switch to Offline"}
//                   </button>
//                   {mode === "offline" && (
//                     <div className="mode-actions">
//                       <button className="btn-sm" onClick={syncData} disabled={loading}>
//                         <Download size={14} /> Pull latest update
//                       </button>
//                       <button className="btn-sm warning" onClick={() => setLiveMode(false)}>
//                         <XCircle size={14} /> Turn off live mode
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="sync-info">
//                 <Database size={16} />
//                 <span>Last sync: {lastSync}</span>
//                 {loading && <span className="syncing">Syncing...</span>}
//               </div>
//             </div>
//           )}

//           {/* ACTIVATION */}
//           {activeTab === "activation" && (
//             <div className="settings-section">
//               <h2>Activation Status</h2>

//               <div className={`activation-card ${activation.isActivated ? "active" : "inactive"}`}>
//                 <div className="activation-icon">
//                   {activation.isActivated ? <CheckCircle size={48} /> : <XCircle size={48} />}
//                 </div>
//                 <div className="activation-info">
//                   <h3>{activation.isActivated ? "Software is Activated" : "Software Not Activated"}</h3>
//                   <p>License Key: {activation.licenseKey}</p>
//                   <p>Device ID: {activation.deviceId}</p>
//                   <p>Expiry Date: {activation.expiryDate}</p>
//                 </div>
//                 {activation.isActivated && (
//                   <button className="deactivate-btn" onClick={handleDeactivate}>
//                     <AlertTriangle size={16} /> Deactivate
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* UPDATES - Imported Component */}
//           {activeTab === "updates" && (
//             <div className="settings-section">
//               <h2>Software Updates</h2>
//               <Updates />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// Settings.jsx - Updated with ModeSettings component
import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Monitor,
  Users,
  School,
  Building,
  User,
  UserCog,
  Globe,
  Shield,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Save,
  Database,
  GraduationCap,
  BookOpen
} from "lucide-react";
import Notification from "../../components/Notification";
import "../../styles/settings.css";

// Import System Administration Components
import UserManagement from "../Adminpages/SystemAdmin/UserManagement";
import RolesPermissions from "../Adminpages/SystemAdmin/RolesPermissions";
import LicenseManagement from "../Adminpages/SystemAdmin/LicenseManagement";
import SystemHealth from "../Adminpages/SystemAdmin/SystemHealth";
import SystemLogs from "../Adminpages/SystemAdmin/SystemLogs";
import GlobalSettings from "../Adminpages/SystemAdmin/GlobalSettings";

// Import Mode Settings Component
import ModeSettings from "./ModeSettings";

// API Base URL
const API_BASE_URL = "http://localhost:8000/api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  // GENERAL Settings
  const [screensaver, setScreensaver] = useState(false);
  const [peakMode, setPeakMode] = useState(false);

  // SCHOOL TYPE Settings
  const [schoolTypes, setSchoolTypes] = useState({
    kindergarten: false,
    primary: false,
    jhs: false,
    shs: false,
    institute: false
  });

  // ASSESSMENT TYPE Settings
  const [assessmentTypes, setAssessmentTypes] = useState({
    montessori: false,
    internationalIbCambridge: false,
    gpa: false
  });

  // CONFIGURATION - Login Enabled
  const [loginConfig, setLoginConfig] = useState({
    student: true,
    teachers: true,
    ta: false,
    parent: false,
    nonStaff: false,
    accountant: true
  });

  // MODE Settings
  const [mode, setMode] = useState("online");
  const [liveMode, setLiveMode] = useState(true);
  const [lastSync, setLastSync] = useState("");

  // ACTIVATION Status
  const [activation, setActivation] = useState({
    isActivated: true,
    licenseKey: "XXXX-XXXX-XXXX-XXXX",
    expiryDate: "2025-12-31",
    deviceId: "DEV-12345-ABCDE"
  });

  // Load settings from backend on mount
  useEffect(() => {
    loadAllSettings();
  }, []);

  const showNotification = (notif) => {
    setNotification(notif);
  };

  // Load all settings from backend
  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/all`);
      const result = await response.json();
      
      if (result.success) {
        const { general, config, system } = result.data;
        
        setScreensaver(general.screensaver);
        setPeakMode(general.peakMode);
        setLoginConfig(config.loginConfig);
        setSchoolTypes(config.schoolTypes);
        setAssessmentTypes(config.assessmentTypes);
        
        if (system.lastUpdated) {
          setLastSync(new Date(system.lastUpdated).toLocaleString());
        }
        
        // Load mode from localStorage or default to online
        const savedMode = localStorage.getItem("system_mode");
        const savedLiveMode = localStorage.getItem("live_mode");
        if (savedMode) setMode(savedMode);
        if (savedLiveMode !== null) setLiveMode(savedLiveMode === "true");
        
        setNotification({ message: "Settings loaded successfully", type: "success" });
      } else {
        setNotification({ message: result.error || "Failed to load settings", type: "error" });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setNotification({ message: "Failed to connect to server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Save all settings
  const saveAllSettings = async () => {
    const selectedAssessmentCount = Object.values(assessmentTypes).filter(v => v === true).length;
    if (selectedAssessmentCount > 2) {
      setNotification({ message: "You can only select up to 2 assessment types!", type: "error" });
      return;
    }
    
    setLoading(true);
    
    try {
      const generalResponse = await fetch(`${API_BASE_URL}/settings/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screensaver, peakMode })
      });
      
      const configResponse = await fetch(`${API_BASE_URL}/settings/config/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginConfig,
          schoolTypes,
          assessmentTypes
        })
      });
      
      const generalResult = await generalResponse.json();
      const configResult = await configResponse.json();
      
      if (generalResult.success && configResult.success) {
        // Save mode to localStorage
        localStorage.setItem("system_mode", mode);
        localStorage.setItem("live_mode", liveMode);
        
        setNotification({ message: "All settings saved successfully!", type: "success" });
        await loadAllSettings();
      } else {
        setNotification({ message: "Failed to save some settings", type: "error" });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setNotification({ message: "Failed to save settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screensaver, peakMode })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotification({ message: "General settings saved!", type: "success" });
      } else {
        setNotification({ message: result.error || "Failed to save", type: "error" });
      }
    } catch (error) {
      console.error("Error saving general settings:", error);
      setNotification({ message: "Failed to save settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const saveLoginConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/config/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginConfig)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotification({ message: "Login configuration saved!", type: "success" });
      } else {
        setNotification({ message: result.error || "Failed to save", type: "error" });
      }
    } catch (error) {
      console.error("Error saving login config:", error);
      setNotification({ message: "Failed to save settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const saveSchoolTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/config/school-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolTypes)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotification({ message: "School types saved!", type: "success" });
      } else {
        setNotification({ message: result.error || "Failed to save", type: "error" });
      }
    } catch (error) {
      console.error("Error saving school types:", error);
      setNotification({ message: "Failed to save settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const saveAssessmentTypes = async () => {
    const selectedCount = Object.values(assessmentTypes).filter(v => v === true).length;
    if (selectedCount > 2) {
      setNotification({ message: "You can only select up to 2 assessment types!", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/config/assessment-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentTypes)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotification({ message: "Assessment types saved!", type: "success" });
      } else {
        setNotification({ message: result.error || "Failed to save", type: "error" });
      }
    } catch (error) {
      console.error("Error saving assessment types:", error);
      setNotification({ message: "Failed to save settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetAllSettings = async () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults? This cannot be undone.")) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/settings/reset`, {
          method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
          setNotification({ message: "All settings reset to defaults!", type: "success" });
          await loadAllSettings();
        } else {
          setNotification({ message: result.error || "Failed to reset", type: "error" });
        }
      } catch (error) {
        console.error("Error resetting settings:", error);
        setNotification({ message: "Failed to reset settings", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSchoolTypeChange = (key, value) => {
    setSchoolTypes({ ...schoolTypes, [key]: value });
  };

  const handleAssessmentTypeChange = (key, value) => {
    const currentSelected = Object.values(assessmentTypes).filter(v => v === true).length;
    if (value && currentSelected >= 2 && !assessmentTypes[key]) {
      setNotification({ message: "You can only select up to 2 assessment types!", type: "error" });
      return;
    }
    setAssessmentTypes({ ...assessmentTypes, [key]: value });
  };

  const handleLoginConfigChange = (key, value) => {
    setLoginConfig({ ...loginConfig, [key]: value });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleLiveModeChange = (newLiveMode) => {
    setLiveMode(newLiveMode);
  };

  const handleSyncComplete = (newSyncTime) => {
    setLastSync(newSyncTime);
  };

  const handleDeactivate = () => {
    if (window.confirm("Are you sure you want to deactivate this software?")) {
      setActivation({ ...activation, isActivated: false });
      setNotification({ message: "Software deactivated", type: "warning" });
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <SettingsIcon size={18} /> },
    { id: "config", label: "Configuration", icon: <Users size={18} /> },
    { id: "mode", label: "Mode", icon: <Globe size={18} /> },
    { id: "activation", label: "Activation", icon: <Shield size={18} /> },
    { id: "roles", label: "Roles & Permissions", icon: <Shield size={18} /> },
    { id: "global", label: "Global Settings", icon: <Database size={18} /> }
  ];

  return (
    <div className="settings-page">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <div className="settings-container">
        <div className="settings-header">
          <div className="header-title">
            <SettingsIcon size={28} />
            <h1>System Administration</h1>
          </div>
          <div className="header-actions">
            <button 
              className="btn-secondary" 
              onClick={resetAllSettings}
              disabled={loading}
            >
              <RefreshCw size={16} /> Reset to Defaults
            </button>
            <button 
              className="btn-primary" 
              onClick={saveAllSettings}
              disabled={loading}
            >
              <Save size={16} /> {loading ? "Saving..." : "Save All Settings"}
            </button>
          </div>
        </div>

        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="setting-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <Monitor size={20} />
                    <div>
                      <h4>Screensaver</h4>
                      <p>Enable screensaver when idle</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={screensaver} 
                      onChange={(e) => setScreensaver(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Users size={20} />
                    <div>
                      <h4>Peak Mode</h4>
                      <p>Allow new registrations from login screen</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={peakMode} 
                      onChange={(e) => setPeakMode(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={saveGeneralSettings}
                  disabled={loading}
                >
                  <Save size={16} /> Save General Settings
                </button>
              </div>
            </div>
          )}

          {/* CONFIGURATION */}
          {activeTab === "config" && (
            <div className="settings-section">
              <h2>Login Configuration</h2>
              <p className="section-desc">Enable/disable login access for different roles</p>

              <div className="setting-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <Users size={20} />
                    <div>
                      <h4>Student Login</h4>
                      <p>Allow students to access the system</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={loginConfig.student} 
                      onChange={(e) => handleLoginConfigChange("student", e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <User size={20} />
                    <div>
                      <h4>Teacher Login</h4>
                      <p>Allow teachers to access the system</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={loginConfig.teachers} 
                      onChange={(e) => handleLoginConfigChange("teachers", e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <UserCog size={20} />
                    <div>
                      <h4>Teaching Assistant Login</h4>
                      <p>Allow teaching assistants to access the system</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={loginConfig.ta} 
                      onChange={(e) => handleLoginConfigChange("ta", e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <UserCog size={20} />
                    <div>
                      <h4>Parent Login</h4>
                      <p>Allow parents to access the system</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={loginConfig.parent} 
                      onChange={(e) => handleLoginConfigChange("parent", e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <User size={20} />
                    <div>
                      <h4>Non-Staff Login</h4>
                      <p>Allow non-staff members to access the system</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={loginConfig.nonStaff} 
                      onChange={(e) => handleLoginConfigChange("nonStaff", e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Building size={20} />
                    <div>
                      <h4>Accountant Login</h4>
                      <p>Allow accountant to access financial modules</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={loginConfig.accountant} 
                      onChange={(e) => handleLoginConfigChange("accountant", e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={saveLoginConfig}
                  disabled={loading}
                >
                  <Save size={16} /> Save Login Config
                </button>
              </div>

              {/* School Type Configuration */}
              <div style={{ marginTop: '2rem' }}>
                <h2>School Type Configuration</h2>
                <p className="section-desc">Select all applicable school types</p>

                <div className="setting-card">
                  <div className="setting-item">
                    <div className="setting-info">
                      <GraduationCap size={20} />
                      <div>
                        <h4>Kindergarten</h4>
                        <p>Early childhood education</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={schoolTypes.kindergarten} 
                        onChange={(e) => handleSchoolTypeChange("kindergarten", e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <GraduationCap size={20} />
                      <div>
                        <h4>Primary School</h4>
                        <p>Includes grades 1-6</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={schoolTypes.primary} 
                        onChange={(e) => handleSchoolTypeChange("primary", e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <School size={20} />
                      <div>
                        <h4>Junior High School (JHS)</h4>
                        <p>Includes JHS 1-3</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={schoolTypes.jhs} 
                        onChange={(e) => handleSchoolTypeChange("jhs", e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Building size={20} />
                      <div>
                        <h4>Senior High School (SHS)</h4>
                        <p>Includes SHS 1-3</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={schoolTypes.shs} 
                        onChange={(e) => handleSchoolTypeChange("shs", e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Building size={20} />
                      <div>
                        <h4>Institute / Vocational</h4>
                        <p>Technical and vocational training</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={schoolTypes.institute} 
                        onChange={(e) => handleSchoolTypeChange("institute", e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button 
                    className="btn-primary" 
                    onClick={saveSchoolTypes}
                    disabled={loading}
                  >
                    <Save size={16} /> Save School Types
                  </button>
                </div>
              </div>

              {/* Assessment Type Configuration */}
              <div style={{ marginTop: '2rem' }}>
                <h2>Assessment Type Configuration</h2>
                <p className="section-desc">Select up to 2 assessment types</p>

                <div className="setting-card">
                  <div className="setting-item">
                    <div className="setting-info">
                      <BookOpen size={20} />
                      <div>
                        <h4>Montessori Assessment</h4>
                        <p>Child-centered, self-directed learning assessment</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={assessmentTypes.montessori}
                        onChange={(e) => handleAssessmentTypeChange("montessori", e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Globe size={20} />
                      <div>
                        <h4>International Assessment</h4>
                        <p>Cambridge/IB style grading and assessment</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={assessmentTypes.internationalIbCambridge}
                        onChange={(e) => handleAssessmentTypeChange("internationalIbCambridge", e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Shield size={20} />
                      <div>
                        <h4>GPA Type Assessment</h4>
                        <p>Grade Point Average based grading system</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={assessmentTypes.gpa}
                        onChange={(e) => handleAssessmentTypeChange("gpa", e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button 
                    className="btn-primary" 
                    onClick={saveAssessmentTypes}
                    disabled={loading}
                  >
                    <Save size={16} /> Save Assessment Types
                  </button>
                </div>

                <div className="info-banner" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  You can select up to 2 assessment types. Currently selected: {Object.values(assessmentTypes).filter(v => v === true).length}
                </div>
              </div>
            </div>
          )}

          {/* MODE - Using the separated component */}
          {activeTab === "mode" && (
            <ModeSettings
              mode={mode}
              liveMode={liveMode}
              lastSync={lastSync}
              onModeChange={handleModeChange}
              onLiveModeChange={handleLiveModeChange}
              onSyncComplete={handleSyncComplete}
              showNotification={showNotification}
            />
          )}

          {/* ACTIVATION */}
          {activeTab === "activation" && (
            <div className="settings-section">
              <h2>Activation Status</h2>
              <div className={`activation-card ${activation.isActivated ? "active" : "inactive"}`}>
                <div className="activation-icon">
                  {activation.isActivated ? <CheckCircle size={48} /> : <XCircle size={48} />}
                </div>
                <div className="activation-info">
                  <h3>{activation.isActivated ? "Software is Activated" : "Software Not Activated"}</h3>
                  <p>License Key: {activation.licenseKey}</p>
                  <p>Device ID: {activation.deviceId}</p>
                  <p>Expiry Date: {activation.expiryDate}</p>
                </div>
                {activation.isActivated && (
                  <button className="deactivate-btn" onClick={handleDeactivate}>
                    <AlertTriangle size={16} /> Deactivate
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ROLES & PERMISSIONS */}
          {activeTab === "roles" && <RolesPermissions />}

          {/* GLOBAL SETTINGS */}
          {activeTab === "global" && <GlobalSettings />}
        </div>
      </div>
    </div>
  );
}