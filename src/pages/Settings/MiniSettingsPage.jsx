// import { useState, useEffect } from "react";
// import { 
//   Sun, Moon, Monitor, School, Loader2, Check, X, Cloud, 
//   CheckCircle, AlertCircle, Building, Database, Smartphone 
// } from "lucide-react";
// import Intro from "../../components/Intro.jsx";
// import { useNavigate } from "react-router-dom";
// import "../../styles/mini-settings.css";

// const SCHOOL_TYPES = ["JHS", "SHS", "Basic School"];

// export default function MiniSettingsPage({ onComplete }) {
//   const [step, setStep] = useState(1);
//   const [darkMode, setDarkMode] = useState(false);
//   const [screensaver, setScreensaver] = useState(false);
//   const [schoolType, setSchoolType] = useState("SHS");
//   const [showIntro, setShowIntro] = useState(true);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncMessage, setSyncMessage] = useState("");
//   const [syncError, setSyncError] = useState(null);
//   const [syncProgress, setSyncProgress] = useState({
//     school: { status: 'pending', message: 'Waiting to start...' },
//     activation: { status: 'pending', message: 'Waiting...' },
//     devices: { status: 'pending', message: 'Waiting...' }
//   });
//   const [syncResult, setSyncResult] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");
//     const savedScreensaver = localStorage.getItem("screensaver");
//     const savedSchoolType = localStorage.getItem("schoolType");
    
//     if (savedTheme) {
//       setDarkMode(savedTheme === "dark");
//       document.body.classList.toggle("dark-mode", savedTheme === "dark");
//     }
    
//     if (savedScreensaver) {
//       setScreensaver(savedScreensaver === "true");
//     }
    
//     if (savedSchoolType) {
//       setSchoolType(savedSchoolType);
//     }

//     const timer = setTimeout(() => {
//       setShowIntro(false);
//     }, 10000);
    
//     return () => clearTimeout(timer);
//   }, []);

//   const toggleTheme = (mode) => {
//     document.body.classList.toggle("dark-mode", mode === "dark");
//     setDarkMode(mode === "dark");
//     localStorage.setItem("theme", mode);
//   };

//   const handleScreensaver = (enabled) => {
//     setScreensaver(enabled);
//     localStorage.setItem("screensaver", enabled.toString());
//   };

//   const handleSchoolType = (type) => {
//     setSchoolType(type);
//     localStorage.setItem("schoolType", type);
//   };

//   const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
//   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

//   // Enhanced API helper
//   const apiFetch = async (endpoint, options = {}, timeout = 30000) => {
//     const url = `http://localhost:8000${endpoint}`;
    
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), timeout);
    
//     try {
//       const response = await fetch(url, {
//         ...options,
//         signal: controller.signal,
//         headers: {
//           "Content-Type": "application/json",
//           ...options.headers,
//         },
//       });
      
//       clearTimeout(timeoutId);
      
//       if (!response.ok) {
//         let errorMessage = `HTTP ${response.status}`;
//         try {
//           const errorData = await response.json();
//           errorMessage = errorData.detail || errorData.message || errorMessage;
//         } catch {
//           const text = await response.text();
//           if (text) errorMessage = text;
//         }
//         throw new Error(errorMessage);
//       }
      
//       return await response.json();
//     } catch (error) {
//       clearTimeout(timeoutId);
//       if (error.name === 'AbortError') {
//         throw new Error('Request timeout - server is not responding');
//       }
//       throw error;
//     }
//   };

//   // SINGLE COMPLETE SYNC FUNCTION
//   const performCompleteSync = async () => {
//     try {
//       // Reset progress
//       setSyncProgress({
//         school: { status: 'pending', message: 'Starting...' },
//         activation: { status: 'pending', message: 'Waiting...' },
//         devices: { status: 'pending', message: 'Waiting...' }
//       });
      
//       setSyncMessage("Starting complete sync to cloud...");
      
//       // Test if backend is running
//       try {
//         await apiFetch("/health/test", {}, 5000);
//       } catch {
//         throw new Error("Backend server is not running or not responding");
//       }
      
//       // Make ONE call to /sync/complete
//       setSyncMessage("Syncing all data to cloud...");
      
//  const result = await apiFetch("/sync/complete", {
//   method: "POST",
//   body: JSON.stringify({
//     sync_school: true,        // Changed from syncSchool
//     sync_activation: true,    // Changed from syncActivation
//     sync_devices: true,       // Changed from syncDevices
//     device_batch_size: 20     // Changed from deviceBatchSize
//   })
// });
      
//       // Store the full result
//       setSyncResult(result);
      
//       // Update progress based on result
//       const steps = result.steps || {};
      
//       // Update school progress
//       if (steps.school) {
//         setSyncProgress(prev => ({
//           ...prev,
//           school: {
//             status: steps.school.success ? 'completed' : 'failed',
//             message: steps.school.message || 
//                      (steps.school.success ? 'School synced' : 'School sync failed')
//           }
//         }));
//       }
      
//       // Update activation progress
//       if (steps.activation) {
//         setSyncProgress(prev => ({
//           ...prev,
//           activation: {
//             status: steps.activation.success ? 'completed' : 'failed',
//             message: steps.activation.message || 
//                      (steps.activation.success ? 'Activation synced' : 'Activation sync failed')
//           }
//         }));
//       }
      
//       // Update devices progress
//       if (steps.devices) {
//         setSyncProgress(prev => ({
//           ...prev,
//           devices: {
//             status: steps.devices.success ? 'completed' : 'failed',
//             message: steps.devices.message || 
//                      `${steps.devices.synced || 0} devices synced` ||
//                      (steps.devices.success ? 'Devices synced' : 'Device sync failed')
//           }
//         }));
//       }
      
//       // Check if sync was successful overall
//       if (!result.success) {
//         // Check which steps failed
//         const failedSteps = Object.entries(steps)
//           .filter(([_, step]) => !step.success)
//           .map(([name]) => name);
        
//         if (failedSteps.length === Object.keys(steps).length) {
//           throw new Error(`All sync steps failed: ${failedSteps.join(', ')}`);
//         } else if (failedSteps.length > 0) {
//           // Some steps failed but others succeeded
//           console.warn(`Partial sync: ${failedSteps.join(', ')} failed`);
//           // We'll continue anyway since some data was synced
//         }
//       }
      
//       return result.success;
      
//     } catch (error) {
//       console.error("Complete sync error:", error);
//       throw error;
//     }
//   };

//   const handleSaveSettings = async () => {
//     // Save all to localStorage
//     localStorage.setItem("theme", darkMode ? "dark" : "light");
//     localStorage.setItem("screensaver", screensaver.toString());
//     localStorage.setItem("schoolType", schoolType);
    
//     // Mark that user has seen mini-settings
//     localStorage.setItem("hasSeenMiniSettings", "true");
    
//     // Start sync
//     setIsSyncing(true);
//     setSyncError(null);
//     setSyncResult(null);
//     setSyncMessage("Preparing to sync all data...");
    
//     try {
//       const success = await performCompleteSync();
      
//       if (success) {
//         setSyncMessage("✅ All data synced successfully!");
//       } else {
//         setSyncMessage("⚠️ Some data synced with warnings");
//       }
      
//       // Wait a moment, then navigate AND call onComplete
//       setTimeout(() => {
//         if (onComplete) {
//           onComplete(); // This will update the parent state
//         }
//         navigate("/home");
//       }, 1500);
      
//     } catch (error) {
//       console.error("Sync error:", error);
//       setSyncError(error.message);
//       setSyncMessage("❌ Sync failed");
//     }
//   };

//   const handleContinueAnyway = () => {
//     // Mark that user has seen mini-settings
//     localStorage.setItem("hasSeenMiniSettings", "true");
    
//     if (onComplete) {
//       onComplete(); // This will update the parent state
//     }
//     navigate("/home");
//   };

//   const handleRetrySync = () => {
//     setSyncError(null);
//     setSyncResult(null);
//     handleSaveSettings();
//   };

//   // Skip intro if user wants
//   const handleSkipIntro = () => {
//     setShowIntro(false);
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'completed': return <CheckCircle size={16} className="text-green-500" />;
//       case 'failed': return <X size={16} className="text-red-500" />;
//       case 'in_progress': return <Loader2 size={16} className="animate-spin text-blue-500" />;
//       default: return <div className="w-4 h-4 rounded-full border border-gray-400" />;
//     }
//   };

//   const renderProgressSteps = () => {
//     // Only show steps that were actually attempted
//     const stepsToShow = [];
    
//     if (syncResult?.steps?.school) {
//       stepsToShow.push({
//         key: 'school',
//         title: 'School Information',
//         ...syncProgress.school
//       });
//     }
    
//     if (syncResult?.steps?.activation) {
//       stepsToShow.push({
//         key: 'activation',
//         title: 'Activation Data',
//         ...syncProgress.activation
//       });
//     }
    
//     if (syncResult?.steps?.devices) {
//       stepsToShow.push({
//         key: 'devices',
//         title: 'Device Data',
//         ...syncProgress.devices
//       });
//     }
    
//     return stepsToShow.map(step => (
//       <div key={step.key} className="progress-step" data-status={step.status}>
//         <div className="step-header">
//           {getStatusIcon(step.status)}
//           <span className="step-title">{step.title}</span>
//         </div>
//         <div className={`step-message ${step.status === 'failed' ? 'text-red-600' : ''}`}>
//           {step.message}
//         </div>
//       </div>
//     ));
//   };

//   if (showIntro) {
//     return <Intro onSkip={handleSkipIntro} />;
//   }

//   return (
//     <div className="mini-settings-wrapper full-screen flex-center">
//       <div className="mini-settings-content seed-drop">
//         <h2 className="settings-title">Final Setup</h2>
//         <p className="settings-subtitle">Configure your preferences before using the system</p>

//         <div className="step-indicator">
//           <span className={step >= 1 ? "active" : ""}>1</span>
//           <span className={step >= 2 ? "active" : ""}>2</span>
//           <span className={step >= 3 ? "active" : ""}>3</span>
//         </div>

//         {step === 1 && (
//           <div className="step-content">
//             <p>Select Theme</p>
//             <div className="option-buttons">
//               <button
//                 className={`option-btn ${!darkMode ? "selected" : ""}`}
//                 onClick={() => toggleTheme("light")}
//               >
//                 <Sun className="icon" /> Light
//               </button>
//               <button
//                 className={`option-btn ${darkMode ? "selected" : ""}`}
//                 onClick={() => toggleTheme("dark")}
//               >
//                 <Moon className="icon" /> Dark
//               </button>
//             </div>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="step-content">
//             <p>Enable Screensaver?</p>
//             <div className="option-buttons">
//               <button
//                 className={`option-btn ${screensaver ? "selected" : ""}`}
//                 onClick={() => handleScreensaver(true)}
//               >
//                 <Monitor className="icon" /> Enable
//               </button>
//               <button
//                 className={`option-btn ${!screensaver ? "selected" : ""}`}
//                 onClick={() => handleScreensaver(false)}
//               >
//                 <Monitor className="icon" /> Disable
//               </button>
//             </div>
//           </div>
//         )}

//         {step === 3 && (
//           <div className="step-content">
//             <p>Select School Mode</p>
//             <div className="option-buttons">
//               {SCHOOL_TYPES.map((type) => (
//                 <button
//                   key={type}
//                   className={`option-btn ${schoolType === type ? "selected" : ''}`}
//                   onClick={() => handleSchoolType(type)}
//                 >
//                   <School className="icon" /> {type}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="step-navigation">
//           {step > 1 && <button className="button prev-btn" onClick={prevStep}>Back</button>}
//           {step < 3 && <button className="button next-btn" onClick={nextStep}>Next</button>}
//           {step === 3 && (
//             <button className="button save-btn" onClick={handleSaveSettings}>
//               Finish Setup
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Enhanced Sync Modal */}
//       {isSyncing && (
//         <div className="sync-modal-overlay">
//           <div className="sync-modal">
//             <div className="sync-modal-header">
//               <Cloud className="sync-icon" />
//               <h3>Completing Setup</h3>
//               <p>Syncing all data to cloud database...</p>
//             </div>

//             <div className="sync-content">
//               {syncError ? (
//                 <div className="sync-error">
//                   <AlertCircle className="error-icon" size={48} />
//                   <p className="error-title">Sync Failed</p>
//                   <p className="error-message">{syncError}</p>
                  
//                   {syncResult && (
//                     <div className="sync-details mt-3">
//                       <p className="text-sm text-gray-600">Response from server:</p>
//                       <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
//                         {JSON.stringify(syncResult, null, 2)}
//                       </pre>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   <Loader2 className="spinner" size={48} />
//                   <p className="sync-message font-medium">{syncMessage}</p>
                  
//                   {/* Progress Steps */}
//                   {syncResult && (
//                     <>
//                       <div className="sync-progress-steps mt-4">
//                         {renderProgressSteps()}
//                       </div>
                      
//                       {/* Sync Summary */}
//                       <div className="sync-summary mt-4 p-3 bg-blue-50 rounded-lg">
//                         <div className="text-center mb-2">
//                           <span className="font-medium">Sync Summary</span>
//                         </div>
//                         <div className="grid grid-cols-3 gap-2 text-sm">
//                           <div className="text-center">
//                             <Building size={20} className="mx-auto mb-1" />
//                             <span>School</span>
//                             <div className="text-xs">
//                               {syncResult.steps?.school?.success ? '✓ Done' : '✗ Failed'}
//                             </div>
//                           </div>
//                           <div className="text-center">
//                             <Database size={20} className="mx-auto mb-1" />
//                             <span>Activation</span>
//                             <div className="text-xs">
//                               {syncResult.steps?.activation?.success ? '✓ Done' : '✗ Failed'}
//                             </div>
//                           </div>
//                           <div className="text-center">
//                             <Smartphone size={20} className="mx-auto mb-1" />
//                             <span>Devices</span>
//                             <div className="text-xs">
//                               {syncResult.steps?.devices?.synced || 0} synced
//                             </div>
//                           </div>
//                         </div>
                        
//                         {syncResult.summary && (
//                           <div className="mt-2 pt-2 border-t border-blue-100 text-xs text-center">
//                             <span className="text-gray-600">
//                               {syncResult.summary.successful_steps} of {syncResult.summary.total_steps} steps completed
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className="sync-actions">
//               {syncError ? (
//                 <>
//                   <button className="button retry-btn" onClick={handleRetrySync}>
//                     <Loader2 size={16} className="mr-2 animate-spin" />
//                     Retry Sync
//                   </button>
//                   <button className="button continue-btn" onClick={handleContinueAnyway}>
//                     Continue Anyway
//                   </button>
//                 </>
//               ) : (
//                 <button 
//                   className="button cancel-btn" 
//                   onClick={() => setIsSyncing(false)}
//                   disabled={syncMessage.includes("✅") || syncMessage.includes("⚠️")}
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// MiniSettingsPage.jsx - Updated with JSON storage
import { useState, useEffect } from "react";
import { 
  Sun, Moon, Monitor, School, Loader2, Check, X, Cloud, 
  CheckCircle, AlertCircle, Building, Database, Smartphone 
} from "lucide-react";
import Intro from "../../components/Intro.jsx";
import { useNavigate } from "react-router-dom";
import "../../styles/mini-settings.css";

// Import the mini settings service
import { miniSettingsService } from "../../services/miniSettingsService";

const SCHOOL_TYPES = ["JHS", "SHS", "Basic School"];

export default function MiniSettingsPage({ onComplete }) {
  const [step, setStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const [schoolType, setSchoolType] = useState("SHS");
  const [showIntro, setShowIntro] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState(null);
  const [syncProgress, setSyncProgress] = useState({
    school: { status: 'pending', message: 'Waiting to start...' },
    activation: { status: 'pending', message: 'Waiting...' },
    devices: { status: 'pending', message: 'Waiting...' }
  });
  const [syncResult, setSyncResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load settings from JSON file instead of localStorage
    loadSettingsFromJson();
    
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load settings from JSON file
  const loadSettingsFromJson = async () => {
    try {
      const settings = await miniSettingsService.getAllMiniSettings();
      
      // Apply theme
      const theme = settings.theme || 'light';
      setDarkMode(theme === "dark");
      document.body.classList.toggle("dark-mode", theme === "dark");
      
      // Apply screensaver setting
      if (settings.screensaver !== undefined) {
        setScreensaver(settings.screensaver);
      }
      
      // Apply school type
      if (settings.schoolType) {
        setSchoolType(settings.schoolType);
      }
    } catch (error) {
      console.error("Failed to load settings from JSON, falling back to localStorage:", error);
      
      // Fallback to localStorage if JSON fails
      const savedTheme = localStorage.getItem("theme");
      const savedScreensaver = localStorage.getItem("screensaver");
      const savedSchoolType = localStorage.getItem("schoolType");
      
      if (savedTheme) {
        setDarkMode(savedTheme === "dark");
        document.body.classList.toggle("dark-mode", savedTheme === "dark");
      }
      
      if (savedScreensaver) {
        setScreensaver(savedScreensaver === "true");
      }
      
      if (savedSchoolType) {
        setSchoolType(savedSchoolType);
      }
    }
  };

  // Toggle theme and save to JSON
  const toggleTheme = async (mode) => {
    // Update UI immediately
    document.body.classList.toggle("dark-mode", mode === "dark");
    setDarkMode(mode === "dark");
    
    // Save to JSON file
    try {
      await miniSettingsService.updateTheme(mode);
    } catch (error) {
      console.error("Failed to save theme to JSON, falling back to localStorage:", error);
      localStorage.setItem("theme", mode);
    }
  };

  // Toggle screensaver and save to JSON
  const handleScreensaver = async (enabled) => {
    // Update UI immediately
    setScreensaver(enabled);
    
    // Save to JSON file
    try {
      await miniSettingsService.updateScreensaver(enabled);
    } catch (error) {
      console.error("Failed to save screensaver to JSON, falling back to localStorage:", error);
      localStorage.setItem("screensaver", enabled.toString());
    }
  };

  // Select school type and save to JSON
  const handleSchoolType = async (type) => {
    // Update UI immediately
    setSchoolType(type);
    
    // Save to JSON file
    try {
      await miniSettingsService.updateSchoolType(type);
    } catch (error) {
      console.error("Failed to save school type to JSON, falling back to localStorage:", error);
      localStorage.setItem("schoolType", type);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Enhanced API helper (unchanged)
  const apiFetch = async (endpoint, options = {}, timeout = 30000) => {
    const url = `http://localhost:8000${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server is not responding');
      }
      throw error;
    }
  };

  // SINGLE COMPLETE SYNC FUNCTION (unchanged)
  const performCompleteSync = async () => {
    try {
      // Reset progress
      setSyncProgress({
        school: { status: 'pending', message: 'Starting...' },
        activation: { status: 'pending', message: 'Waiting...' },
        devices: { status: 'pending', message: 'Waiting...' }
      });
      
      setSyncMessage("Starting complete sync to cloud...");
      
      // Test if backend is running
      try {
        await apiFetch("/health/test", {}, 5000);
      } catch {
        throw new Error("Backend server is not running or not responding");
      }
      
      // Make ONE call to /sync/complete
      setSyncMessage("Syncing all data to cloud...");
      
      const result = await apiFetch("/sync/complete", {
        method: "POST",
        body: JSON.stringify({
          sync_school: true,
          sync_activation: true,
          sync_devices: true,
          device_batch_size: 20
        })
      });
      
      // Store the full result
      setSyncResult(result);
      
      // Update progress based on result
      const steps = result.steps || {};
      
      // Update school progress
      if (steps.school) {
        setSyncProgress(prev => ({
          ...prev,
          school: {
            status: steps.school.success ? 'completed' : 'failed',
            message: steps.school.message || 
                     (steps.school.success ? 'School synced' : 'School sync failed')
          }
        }));
      }
      
      // Update activation progress
      if (steps.activation) {
        setSyncProgress(prev => ({
          ...prev,
          activation: {
            status: steps.activation.success ? 'completed' : 'failed',
            message: steps.activation.message || 
                     (steps.activation.success ? 'Activation synced' : 'Activation sync failed')
          }
        }));
      }
      
      // Update devices progress
      if (steps.devices) {
        setSyncProgress(prev => ({
          ...prev,
          devices: {
            status: steps.devices.success ? 'completed' : 'failed',
            message: steps.devices.message || 
                     `${steps.devices.synced || 0} devices synced` ||
                     (steps.devices.success ? 'Devices synced' : 'Device sync failed')
          }
        }));
      }
      
      // Check if sync was successful overall
      if (!result.success) {
        // Check which steps failed
        const failedSteps = Object.entries(steps)
          .filter(([_, step]) => !step.success)
          .map(([name]) => name);
        
        if (failedSteps.length === Object.keys(steps).length) {
          throw new Error(`All sync steps failed: ${failedSteps.join(', ')}`);
        } else if (failedSteps.length > 0) {
          // Some steps failed but others succeeded
          console.warn(`Partial sync: ${failedSteps.join(', ')} failed`);
          // We'll continue anyway since some data was synced
        }
      }
      
      return result.success;
      
    } catch (error) {
      console.error("Complete sync error:", error);
      throw error;
    }
  };

  // Save all settings to JSON file and start sync
  const handleSaveSettings = async () => {
    // Prepare all mini settings
    const allMiniSettings = {
      hasSeenMiniSettings: true,
      theme: darkMode ? "dark" : "light",
      screensaver: screensaver,
      schoolType: schoolType
    };
    
    // Save ALL mini settings to JSON file
    try {
      await miniSettingsService.saveAllMiniSettings(allMiniSettings);
      console.log("✅ Mini settings saved to JSON file successfully");
    } catch (error) {
      console.error("❌ Failed to save mini settings to JSON, falling back to localStorage:", error);
      // Fallback to localStorage
      localStorage.setItem("theme", darkMode ? "dark" : "light");
      localStorage.setItem("screensaver", screensaver.toString());
      localStorage.setItem("schoolType", schoolType);
      localStorage.setItem("hasSeenMiniSettings", "true");
    }
    
    // Mark that user has seen mini-settings (also saved above, but call specifically)
    try {
      await miniSettingsService.setSeenMiniSettings();
    } catch (error) {
      console.error("Failed to mark as seen in JSON:", error);
      localStorage.setItem("hasSeenMiniSettings", "true");
    }
    
    // Start sync (your existing sync functionality - UNCHANGED)
    setIsSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    setSyncMessage("Preparing to sync all data...");
    
    try {
      const success = await performCompleteSync();
      
      if (success) {
        setSyncMessage("✅ All data synced successfully!");
      } else {
        setSyncMessage("⚠️ Some data synced with warnings");
      }
      
      // Wait a moment, then navigate AND call onComplete
      setTimeout(() => {
        if (onComplete) {
          onComplete(); // This will update the parent state
        }
        navigate("/home");
      }, 1500);
      
    } catch (error) {
      console.error("Sync error:", error);
      setSyncError(error.message);
      setSyncMessage("❌ Sync failed");
    }
  };

  const handleContinueAnyway = () => {
    // Mark that user has seen mini-settings in JSON file
    const markAsSeen = async () => {
      try {
        await miniSettingsService.setSeenMiniSettings();
      } catch (error) {
        console.error("Failed to mark as seen in JSON, using localStorage:", error);
        localStorage.setItem("hasSeenMiniSettings", "true");
      }
    };
    
    markAsSeen();
    
    if (onComplete) {
      onComplete();
    }
    navigate("/home");
  };

  const handleRetrySync = () => {
    setSyncError(null);
    setSyncResult(null);
    handleSaveSettings();
  };

  // Skip intro if user wants
  const handleSkipIntro = () => {
    setShowIntro(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'failed': return <X size={16} className="text-red-500" />;
      case 'in_progress': return <Loader2 size={16} className="animate-spin text-blue-500" />;
      default: return <div className="w-4 h-4 rounded-full border border-gray-400" />;
    }
  };

  const renderProgressSteps = () => {
    // Only show steps that were actually attempted
    const stepsToShow = [];
    
    if (syncResult?.steps?.school) {
      stepsToShow.push({
        key: 'school',
        title: 'School Information',
        ...syncProgress.school
      });
    }
    
    if (syncResult?.steps?.activation) {
      stepsToShow.push({
        key: 'activation',
        title: 'Activation Data',
        ...syncProgress.activation
      });
    }
    
    if (syncResult?.steps?.devices) {
      stepsToShow.push({
        key: 'devices',
        title: 'Device Data',
        ...syncProgress.devices
      });
    }
    
    return stepsToShow.map(step => (
      <div key={step.key} className="progress-step" data-status={step.status}>
        <div className="step-header">
          {getStatusIcon(step.status)}
          <span className="step-title">{step.title}</span>
        </div>
        <div className={`step-message ${step.status === 'failed' ? 'text-red-600' : ''}`}>
          {step.message}
        </div>
      </div>
    ));
  };

  if (showIntro) {
    return <Intro onSkip={handleSkipIntro} />;
  }

  return (
    <div className="mini-settings-wrapper full-screen flex-center">
      <div className="mini-settings-content seed-drop">
        <h2 className="settings-title">Final Setup</h2>
        <p className="settings-subtitle">Configure your preferences before using the system</p>

        <div className="step-indicator">
          <span className={step >= 1 ? "active" : ""}>1</span>
          <span className={step >= 2 ? "active" : ""}>2</span>
          <span className={step >= 3 ? "active" : ""}>3</span>
        </div>

        {step === 1 && (
          <div className="step-content">
            <p>Select Theme</p>
            <div className="option-buttons">
              <button
                className={`option-btn ${!darkMode ? "selected" : ""}`}
                onClick={() => toggleTheme("light")}
              >
                <Sun className="icon" /> Light
              </button>
              <button
                className={`option-btn ${darkMode ? "selected" : ""}`}
                onClick={() => toggleTheme("dark")}
              >
                <Moon className="icon" /> Dark
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <p>Enable Screensaver?</p>
            <div className="option-buttons">
              <button
                className={`option-btn ${screensaver ? "selected" : ""}`}
                onClick={() => handleScreensaver(true)}
              >
                <Monitor className="icon" /> Enable
              </button>
              <button
                className={`option-btn ${!screensaver ? "selected" : ""}`}
                onClick={() => handleScreensaver(false)}
              >
                <Monitor className="icon" /> Disable
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <p>Select School Mode</p>
            <div className="option-buttons">
              {SCHOOL_TYPES.map((type) => (
                <button
                  key={type}
                  className={`option-btn ${schoolType === type ? "selected" : ''}`}
                  onClick={() => handleSchoolType(type)}
                >
                  <School className="icon" /> {type}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="step-navigation">
          {step > 1 && <button className="button prev-btn" onClick={prevStep}>Back</button>}
          {step < 3 && <button className="button next-btn" onClick={nextStep}>Next</button>}
          {step === 3 && (
            <button className="button save-btn" onClick={handleSaveSettings}>
              Finish Setup
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Sync Modal */}
      {isSyncing && (
        <div className="sync-modal-overlay">
          <div className="sync-modal">
            <div className="sync-modal-header">
              <Cloud className="sync-icon" />
              <h3>Completing Setup</h3>
              <p>Syncing all data to cloud database...</p>
            </div>

            <div className="sync-content">
              {syncError ? (
                <div className="sync-error">
                  <AlertCircle className="error-icon" size={48} />
                  <p className="error-title">Sync Failed</p>
                  <p className="error-message">{syncError}</p>
                  
                  {syncResult && (
                    <div className="sync-details mt-3">
                      <p className="text-sm text-gray-600">Response from server:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
                        {JSON.stringify(syncResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Loader2 className="spinner" size={48} />
                  <p className="sync-message font-medium">{syncMessage}</p>
                  
                  {/* Progress Steps */}
                  {syncResult && (
                    <>
                      <div className="sync-progress-steps mt-4">
                        {renderProgressSteps()}
                      </div>
                      
                      {/* Sync Summary */}
                      <div className="sync-summary mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-center mb-2">
                          <span className="font-medium">Sync Summary</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <Building size={20} className="mx-auto mb-1" />
                            <span>School</span>
                            <div className="text-xs">
                              {syncResult.steps?.school?.success ? '✓ Done' : '✗ Failed'}
                            </div>
                          </div>
                          <div className="text-center">
                            <Database size={20} className="mx-auto mb-1" />
                            <span>Activation</span>
                            <div className="text-xs">
                              {syncResult.steps?.activation?.success ? '✓ Done' : '✗ Failed'}
                            </div>
                          </div>
                          <div className="text-center">
                            <Smartphone size={20} className="mx-auto mb-1" />
                            <span>Devices</span>
                            <div className="text-xs">
                              {syncResult.steps?.devices?.synced || 0} synced
                            </div>
                          </div>
                        </div>
                        
                        {syncResult.summary && (
                          <div className="mt-2 pt-2 border-t border-blue-100 text-xs text-center">
                            <span className="text-gray-600">
                              {syncResult.summary.successful_steps} of {syncResult.summary.total_steps} steps completed
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="sync-actions">
              {syncError ? (
                <>
                  <button className="button retry-btn" onClick={handleRetrySync}>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Retry Sync
                  </button>
                  <button className="button continue-btn" onClick={handleContinueAnyway}>
                    Continue Anyway
                  </button>
                </>
              ) : (
                <button 
                  className="button cancel-btn" 
                  onClick={() => setIsSyncing(false)}
                  disabled={syncMessage.includes("✅") || syncMessage.includes("⚠️")}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}