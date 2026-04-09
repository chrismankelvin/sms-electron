// // // import { useState, useEffect } from "react";
// // // import { 
// // //   Sun, Moon, Monitor, School, Loader2, Check, X, Cloud, 
// // //   CheckCircle, AlertCircle, Building, Database, Smartphone 
// // // } from "lucide-react";
// // // import Intro from "../../components/Intro.jsx";
// // // import { useNavigate } from "react-router-dom";
// // // import "../../styles/mini-settings.css";

// // // const SCHOOL_TYPES = ["JHS", "SHS", "Basic School"];

// // // export default function MiniSettingsPage({ onComplete }) {
// // //   const [step, setStep] = useState(1);
// // //   const [darkMode, setDarkMode] = useState(false);
// // //   const [screensaver, setScreensaver] = useState(false);
// // //   const [schoolType, setSchoolType] = useState("SHS");
// // //   const [showIntro, setShowIntro] = useState(true);
// // //   const [isSyncing, setIsSyncing] = useState(false);
// // //   const [syncMessage, setSyncMessage] = useState("");
// // //   const [syncError, setSyncError] = useState(null);
// // //   const [syncProgress, setSyncProgress] = useState({
// // //     school: { status: 'pending', message: 'Waiting to start...' },
// // //     activation: { status: 'pending', message: 'Waiting...' },
// // //     devices: { status: 'pending', message: 'Waiting...' }
// // //   });
// // //   const [syncResult, setSyncResult] = useState(null);
// // //   const navigate = useNavigate();

// // //   useEffect(() => {
// // //     const savedTheme = localStorage.getItem("theme");
// // //     const savedScreensaver = localStorage.getItem("screensaver");
// // //     const savedSchoolType = localStorage.getItem("schoolType");
    
// // //     if (savedTheme) {
// // //       setDarkMode(savedTheme === "dark");
// // //       document.body.classList.toggle("dark-mode", savedTheme === "dark");
// // //     }
    
// // //     if (savedScreensaver) {
// // //       setScreensaver(savedScreensaver === "true");
// // //     }
    
// // //     if (savedSchoolType) {
// // //       setSchoolType(savedSchoolType);
// // //     }

// // //     const timer = setTimeout(() => {
// // //       setShowIntro(false);
// // //     }, 10000);
    
// // //     return () => clearTimeout(timer);
// // //   }, []);

// // //   const toggleTheme = (mode) => {
// // //     document.body.classList.toggle("dark-mode", mode === "dark");
// // //     setDarkMode(mode === "dark");
// // //     localStorage.setItem("theme", mode);
// // //   };

// // //   const handleScreensaver = (enabled) => {
// // //     setScreensaver(enabled);
// // //     localStorage.setItem("screensaver", enabled.toString());
// // //   };

// // //   const handleSchoolType = (type) => {
// // //     setSchoolType(type);
// // //     localStorage.setItem("schoolType", type);
// // //   };

// // //   const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
// // //   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

// // //   // Enhanced API helper
// // //   const apiFetch = async (endpoint, options = {}, timeout = 30000) => {
// // //     const url = `http://localhost:8000${endpoint}`;
    
// // //     const controller = new AbortController();
// // //     const timeoutId = setTimeout(() => controller.abort(), timeout);
    
// // //     try {
// // //       const response = await fetch(url, {
// // //         ...options,
// // //         signal: controller.signal,
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           ...options.headers,
// // //         },
// // //       });
      
// // //       clearTimeout(timeoutId);
      
// // //       if (!response.ok) {
// // //         let errorMessage = `HTTP ${response.status}`;
// // //         try {
// // //           const errorData = await response.json();
// // //           errorMessage = errorData.detail || errorData.message || errorMessage;
// // //         } catch {
// // //           const text = await response.text();
// // //           if (text) errorMessage = text;
// // //         }
// // //         throw new Error(errorMessage);
// // //       }
      
// // //       return await response.json();
// // //     } catch (error) {
// // //       clearTimeout(timeoutId);
// // //       if (error.name === 'AbortError') {
// // //         throw new Error('Request timeout - server is not responding');
// // //       }
// // //       throw error;
// // //     }
// // //   };

// // //   // SINGLE COMPLETE SYNC FUNCTION
// // //   const performCompleteSync = async () => {
// // //     try {
// // //       // Reset progress
// // //       setSyncProgress({
// // //         school: { status: 'pending', message: 'Starting...' },
// // //         activation: { status: 'pending', message: 'Waiting...' },
// // //         devices: { status: 'pending', message: 'Waiting...' }
// // //       });
      
// // //       setSyncMessage("Starting complete sync to cloud...");
      
// // //       // Test if backend is running
// // //       try {
// // //         await apiFetch("/health/test", {}, 5000);
// // //       } catch {
// // //         throw new Error("Backend server is not running or not responding");
// // //       }
      
// // //       // Make ONE call to /sync/complete
// // //       setSyncMessage("Syncing all data to cloud...");
      
// // //  const result = await apiFetch("/sync/complete", {
// // //   method: "POST",
// // //   body: JSON.stringify({
// // //     sync_school: true,        // Changed from syncSchool
// // //     sync_activation: true,    // Changed from syncActivation
// // //     sync_devices: true,       // Changed from syncDevices
// // //     device_batch_size: 20     // Changed from deviceBatchSize
// // //   })
// // // });
      
// // //       // Store the full result
// // //       setSyncResult(result);
      
// // //       // Update progress based on result
// // //       const steps = result.steps || {};
      
// // //       // Update school progress
// // //       if (steps.school) {
// // //         setSyncProgress(prev => ({
// // //           ...prev,
// // //           school: {
// // //             status: steps.school.success ? 'completed' : 'failed',
// // //             message: steps.school.message || 
// // //                      (steps.school.success ? 'School synced' : 'School sync failed')
// // //           }
// // //         }));
// // //       }
      
// // //       // Update activation progress
// // //       if (steps.activation) {
// // //         setSyncProgress(prev => ({
// // //           ...prev,
// // //           activation: {
// // //             status: steps.activation.success ? 'completed' : 'failed',
// // //             message: steps.activation.message || 
// // //                      (steps.activation.success ? 'Activation synced' : 'Activation sync failed')
// // //           }
// // //         }));
// // //       }
      
// // //       // Update devices progress
// // //       if (steps.devices) {
// // //         setSyncProgress(prev => ({
// // //           ...prev,
// // //           devices: {
// // //             status: steps.devices.success ? 'completed' : 'failed',
// // //             message: steps.devices.message || 
// // //                      `${steps.devices.synced || 0} devices synced` ||
// // //                      (steps.devices.success ? 'Devices synced' : 'Device sync failed')
// // //           }
// // //         }));
// // //       }
      
// // //       // Check if sync was successful overall
// // //       if (!result.success) {
// // //         // Check which steps failed
// // //         const failedSteps = Object.entries(steps)
// // //           .filter(([_, step]) => !step.success)
// // //           .map(([name]) => name);
        
// // //         if (failedSteps.length === Object.keys(steps).length) {
// // //           throw new Error(`All sync steps failed: ${failedSteps.join(', ')}`);
// // //         } else if (failedSteps.length > 0) {
// // //           // Some steps failed but others succeeded
// // //           console.warn(`Partial sync: ${failedSteps.join(', ')} failed`);
// // //           // We'll continue anyway since some data was synced
// // //         }
// // //       }
      
// // //       return result.success;
      
// // //     } catch (error) {
// // //       console.error("Complete sync error:", error);
// // //       throw error;
// // //     }
// // //   };

// // //   const handleSaveSettings = async () => {
// // //     // Save all to localStorage
// // //     localStorage.setItem("theme", darkMode ? "dark" : "light");
// // //     localStorage.setItem("screensaver", screensaver.toString());
// // //     localStorage.setItem("schoolType", schoolType);
    
// // //     // Mark that user has seen mini-settings
// // //     localStorage.setItem("hasSeenMiniSettings", "true");
    
// // //     // Start sync
// // //     setIsSyncing(true);
// // //     setSyncError(null);
// // //     setSyncResult(null);
// // //     setSyncMessage("Preparing to sync all data...");
    
// // //     try {
// // //       const success = await performCompleteSync();
      
// // //       if (success) {
// // //         setSyncMessage("✅ All data synced successfully!");
// // //       } else {
// // //         setSyncMessage("⚠️ Some data synced with warnings");
// // //       }
      
// // //       // Wait a moment, then navigate AND call onComplete
// // //       setTimeout(() => {
// // //         if (onComplete) {
// // //           onComplete(); // This will update the parent state
// // //         }
// // //         navigate("/home");
// // //       }, 1500);
      
// // //     } catch (error) {
// // //       console.error("Sync error:", error);
// // //       setSyncError(error.message);
// // //       setSyncMessage("❌ Sync failed");
// // //     }
// // //   };

// // //   const handleContinueAnyway = () => {
// // //     // Mark that user has seen mini-settings
// // //     localStorage.setItem("hasSeenMiniSettings", "true");
    
// // //     if (onComplete) {
// // //       onComplete(); // This will update the parent state
// // //     }
// // //     navigate("/home");
// // //   };

// // //   const handleRetrySync = () => {
// // //     setSyncError(null);
// // //     setSyncResult(null);
// // //     handleSaveSettings();
// // //   };

// // //   // Skip intro if user wants
// // //   const handleSkipIntro = () => {
// // //     setShowIntro(false);
// // //   };

// // //   const getStatusIcon = (status) => {
// // //     switch (status) {
// // //       case 'completed': return <CheckCircle size={16} className="text-green-500" />;
// // //       case 'failed': return <X size={16} className="text-red-500" />;
// // //       case 'in_progress': return <Loader2 size={16} className="animate-spin text-blue-500" />;
// // //       default: return <div className="w-4 h-4 rounded-full border border-gray-400" />;
// // //     }
// // //   };

// // //   const renderProgressSteps = () => {
// // //     // Only show steps that were actually attempted
// // //     const stepsToShow = [];
    
// // //     if (syncResult?.steps?.school) {
// // //       stepsToShow.push({
// // //         key: 'school',
// // //         title: 'School Information',
// // //         ...syncProgress.school
// // //       });
// // //     }
    
// // //     if (syncResult?.steps?.activation) {
// // //       stepsToShow.push({
// // //         key: 'activation',
// // //         title: 'Activation Data',
// // //         ...syncProgress.activation
// // //       });
// // //     }
    
// // //     if (syncResult?.steps?.devices) {
// // //       stepsToShow.push({
// // //         key: 'devices',
// // //         title: 'Device Data',
// // //         ...syncProgress.devices
// // //       });
// // //     }
    
// // //     return stepsToShow.map(step => (
// // //       <div key={step.key} className="progress-step" data-status={step.status}>
// // //         <div className="step-header">
// // //           {getStatusIcon(step.status)}
// // //           <span className="step-title">{step.title}</span>
// // //         </div>
// // //         <div className={`step-message ${step.status === 'failed' ? 'text-red-600' : ''}`}>
// // //           {step.message}
// // //         </div>
// // //       </div>
// // //     ));
// // //   };

// // //   if (showIntro) {
// // //     return <Intro onSkip={handleSkipIntro} />;
// // //   }

// // //   return (
// // //     <div className="mini-settings-wrapper full-screen flex-center">
// // //       <div className="mini-settings-content seed-drop">
// // //         <h2 className="settings-title">Final Setup</h2>
// // //         <p className="settings-subtitle">Configure your preferences before using the system</p>

// // //         <div className="step-indicator">
// // //           <span className={step >= 1 ? "active" : ""}>1</span>
// // //           <span className={step >= 2 ? "active" : ""}>2</span>
// // //           <span className={step >= 3 ? "active" : ""}>3</span>
// // //         </div>

// // //         {step === 1 && (
// // //           <div className="step-content">
// // //             <p>Select Theme</p>
// // //             <div className="option-buttons">
// // //               <button
// // //                 className={`option-btn ${!darkMode ? "selected" : ""}`}
// // //                 onClick={() => toggleTheme("light")}
// // //               >
// // //                 <Sun className="icon" /> Light
// // //               </button>
// // //               <button
// // //                 className={`option-btn ${darkMode ? "selected" : ""}`}
// // //                 onClick={() => toggleTheme("dark")}
// // //               >
// // //                 <Moon className="icon" /> Dark
// // //               </button>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {step === 2 && (
// // //           <div className="step-content">
// // //             <p>Enable Screensaver?</p>
// // //             <div className="option-buttons">
// // //               <button
// // //                 className={`option-btn ${screensaver ? "selected" : ""}`}
// // //                 onClick={() => handleScreensaver(true)}
// // //               >
// // //                 <Monitor className="icon" /> Enable
// // //               </button>
// // //               <button
// // //                 className={`option-btn ${!screensaver ? "selected" : ""}`}
// // //                 onClick={() => handleScreensaver(false)}
// // //               >
// // //                 <Monitor className="icon" /> Disable
// // //               </button>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {step === 3 && (
// // //           <div className="step-content">
// // //             <p>Select School Mode</p>
// // //             <div className="option-buttons">
// // //               {SCHOOL_TYPES.map((type) => (
// // //                 <button
// // //                   key={type}
// // //                   className={`option-btn ${schoolType === type ? "selected" : ''}`}
// // //                   onClick={() => handleSchoolType(type)}
// // //                 >
// // //                   <School className="icon" /> {type}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         )}

// // //         <div className="step-navigation">
// // //           {step > 1 && <button className="button prev-btn" onClick={prevStep}>Back</button>}
// // //           {step < 3 && <button className="button next-btn" onClick={nextStep}>Next</button>}
// // //           {step === 3 && (
// // //             <button className="button save-btn" onClick={handleSaveSettings}>
// // //               Finish Setup
// // //             </button>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* Enhanced Sync Modal */}
// // //       {isSyncing && (
// // //         <div className="sync-modal-overlay">
// // //           <div className="sync-modal">
// // //             <div className="sync-modal-header">
// // //               <Cloud className="sync-icon" />
// // //               <h3>Completing Setup</h3>
// // //               <p>Syncing all data to cloud database...</p>
// // //             </div>

// // //             <div className="sync-content">
// // //               {syncError ? (
// // //                 <div className="sync-error">
// // //                   <AlertCircle className="error-icon" size={48} />
// // //                   <p className="error-title">Sync Failed</p>
// // //                   <p className="error-message">{syncError}</p>
                  
// // //                   {syncResult && (
// // //                     <div className="sync-details mt-3">
// // //                       <p className="text-sm text-gray-600">Response from server:</p>
// // //                       <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
// // //                         {JSON.stringify(syncResult, null, 2)}
// // //                       </pre>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               ) : (
// // //                 <>
// // //                   <Loader2 className="spinner" size={48} />
// // //                   <p className="sync-message font-medium">{syncMessage}</p>
                  
// // //                   {/* Progress Steps */}
// // //                   {syncResult && (
// // //                     <>
// // //                       <div className="sync-progress-steps mt-4">
// // //                         {renderProgressSteps()}
// // //                       </div>
                      
// // //                       {/* Sync Summary */}
// // //                       <div className="sync-summary mt-4 p-3 bg-blue-50 rounded-lg">
// // //                         <div className="text-center mb-2">
// // //                           <span className="font-medium">Sync Summary</span>
// // //                         </div>
// // //                         <div className="grid grid-cols-3 gap-2 text-sm">
// // //                           <div className="text-center">
// // //                             <Building size={20} className="mx-auto mb-1" />
// // //                             <span>School</span>
// // //                             <div className="text-xs">
// // //                               {syncResult.steps?.school?.success ? '✓ Done' : '✗ Failed'}
// // //                             </div>
// // //                           </div>
// // //                           <div className="text-center">
// // //                             <Database size={20} className="mx-auto mb-1" />
// // //                             <span>Activation</span>
// // //                             <div className="text-xs">
// // //                               {syncResult.steps?.activation?.success ? '✓ Done' : '✗ Failed'}
// // //                             </div>
// // //                           </div>
// // //                           <div className="text-center">
// // //                             <Smartphone size={20} className="mx-auto mb-1" />
// // //                             <span>Devices</span>
// // //                             <div className="text-xs">
// // //                               {syncResult.steps?.devices?.synced || 0} synced
// // //                             </div>
// // //                           </div>
// // //                         </div>
                        
// // //                         {syncResult.summary && (
// // //                           <div className="mt-2 pt-2 border-t border-blue-100 text-xs text-center">
// // //                             <span className="text-gray-600">
// // //                               {syncResult.summary.successful_steps} of {syncResult.summary.total_steps} steps completed
// // //                             </span>
// // //                           </div>
// // //                         )}
// // //                       </div>
// // //                     </>
// // //                   )}
// // //                 </>
// // //               )}
// // //             </div>

// // //             <div className="sync-actions">
// // //               {syncError ? (
// // //                 <>
// // //                   <button className="button retry-btn" onClick={handleRetrySync}>
// // //                     <Loader2 size={16} className="mr-2 animate-spin" />
// // //                     Retry Sync
// // //                   </button>
// // //                   <button className="button continue-btn" onClick={handleContinueAnyway}>
// // //                     Continue Anyway
// // //                   </button>
// // //                 </>
// // //               ) : (
// // //                 <button 
// // //                   className="button cancel-btn" 
// // //                   onClick={() => setIsSyncing(false)}
// // //                   disabled={syncMessage.includes("✅") || syncMessage.includes("⚠️")}
// // //                 >
// // //                   Cancel
// // //                 </button>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }



// // // MiniSettingsPage.jsx - Updated with JSON storage
// // import { useState, useEffect } from "react";
// // import { 
// //   Sun, Moon, Monitor, School, Loader2, Check, X, Cloud, 
// //   CheckCircle, AlertCircle, Building, Database, Smartphone 
// // } from "lucide-react";
// // import Intro from "../../components/Intro.jsx";
// // import { useNavigate } from "react-router-dom";
// // import "../../styles/mini-settings.css";
// // import {syncData,checkBackendHealth} from "../../services/api.service.js";

// // // Import the mini settings service
// // import { miniSettingsService } from "../../services/miniSettingsService";

// // const SCHOOL_TYPES = ["JHS", "SHS", "Basic School"];

// // export default function MiniSettingsPage({ onComplete }) {
// //   const [step, setStep] = useState(1);
// //   const [darkMode, setDarkMode] = useState(false);
// //   const [screensaver, setScreensaver] = useState(false);
// //   const [schoolType, setSchoolType] = useState("SHS");
// //   const [showIntro, setShowIntro] = useState(true);
// //   const [isSyncing, setIsSyncing] = useState(false);
// //   const [syncMessage, setSyncMessage] = useState("");
// //   const [syncError, setSyncError] = useState(null);
// //   const [syncProgress, setSyncProgress] = useState({
// //     school: { status: 'pending', message: 'Waiting to start...' },
// //     activation: { status: 'pending', message: 'Waiting...' },
// //     devices: { status: 'pending', message: 'Waiting...' }
// //   });
// //   const [syncResult, setSyncResult] = useState(null);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     // Load settings from JSON file instead of localStorage
// //     loadSettingsFromJson();
    
// //     const timer = setTimeout(() => {
// //       setShowIntro(false);
// //     }, 10000);
    
// //     return () => clearTimeout(timer);
// //   }, []);

// //   // Load settings from JSON file
// //   const loadSettingsFromJson = async () => {
// //     try {
// //       const settings = await miniSettingsService.getAllMiniSettings();
      
// //       // Apply theme
// //       const theme = settings.theme || 'light';
// //       setDarkMode(theme === "dark");
// //       document.body.classList.toggle("dark-mode", theme === "dark");
      
// //       // Apply screensaver setting
// //       if (settings.screensaver !== undefined) {
// //         setScreensaver(settings.screensaver);
// //       }
      
// //       // Apply school type
// //       if (settings.schoolType) {
// //         setSchoolType(settings.schoolType);
// //       }
// //     } catch (error) {
// //       console.error("Failed to load settings from JSON, falling back to localStorage:", error);
      
// //       // Fallback to localStorage if JSON fails
// //       const savedTheme = localStorage.getItem("theme");
// //       const savedScreensaver = localStorage.getItem("screensaver");
// //       const savedSchoolType = localStorage.getItem("schoolType");
      
// //       if (savedTheme) {
// //         setDarkMode(savedTheme === "dark");
// //         document.body.classList.toggle("dark-mode", savedTheme === "dark");
// //       }
      
// //       if (savedScreensaver) {
// //         setScreensaver(savedScreensaver === "true");
// //       }
      
// //       if (savedSchoolType) {
// //         setSchoolType(savedSchoolType);
// //       }
// //     }
// //   };

// //   // Toggle theme and save to JSON
// //   const toggleTheme = async (mode) => {
// //     // Update UI immediately
// //     document.body.classList.toggle("dark-mode", mode === "dark");
// //     setDarkMode(mode === "dark");
    
// //     // Save to JSON file
// //     try {
// //       await miniSettingsService.updateTheme(mode);
// //     } catch (error) {
// //       console.error("Failed to save theme to JSON, falling back to localStorage:", error);
// //       localStorage.setItem("theme", mode);
// //     }
// //   };

// //   // Toggle screensaver and save to JSON
// //   const handleScreensaver = async (enabled) => {
// //     // Update UI immediately
// //     setScreensaver(enabled);
    
// //     // Save to JSON file
// //     try {
// //       await miniSettingsService.updateScreensaver(enabled);
// //     } catch (error) {
// //       console.error("Failed to save screensaver to JSON, falling back to localStorage:", error);
// //       localStorage.setItem("screensaver", enabled.toString());
// //     }
// //   };

// //   // Select school type and save to JSON
// //   const handleSchoolType = async (type) => {
// //     // Update UI immediately
// //     setSchoolType(type);
    
// //     // Save to JSON file
// //     try {
// //       await miniSettingsService.updateSchoolType(type);
// //     } catch (error) {
// //       console.error("Failed to save school type to JSON, falling back to localStorage:", error);
// //       localStorage.setItem("schoolType", type);
// //     }
// //   };

// //   const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
// //   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

// //   // Enhanced API helper (unchanged)
// //   const apiFetch = async (endpoint, options = {}, timeout = 30000) => {
// //     const url = `http://localhost:8000${endpoint}`;
    
// //     const controller = new AbortController();
// //     const timeoutId = setTimeout(() => controller.abort(), timeout);
    
// //     try {
// //       const response = await fetch(url, {
// //         ...options,
// //         signal: controller.signal,
// //         headers: {
// //           "Content-Type": "application/json",
// //           ...options.headers,
// //         },
// //       });
      
// //       clearTimeout(timeoutId);
      
// //       if (!response.ok) {
// //         let errorMessage = `HTTP ${response.status}`;
// //         try {
// //           const errorData = await response.json();
// //           errorMessage = errorData.detail || errorData.message || errorMessage;
// //         } catch {
// //           const text = await response.text();
// //           if (text) errorMessage = text;
// //         }
// //         throw new Error(errorMessage);
// //       }
      
// //       return await response.json();
// //     } catch (error) {
// //       clearTimeout(timeoutId);
// //       if (error.name === 'AbortError') {
// //         throw new Error('Request timeout - server is not responding');
// //       }
// //       throw error;
// //     }
// //   };

// //   // SINGLE COMPLETE SYNC FUNCTION (unchanged)
// //   // const performCompleteSync = async () => {
// //   //   try {
// //   //     // Reset progress
// //   //     setSyncProgress({
// //   //       school: { status: 'pending', message: 'Starting...' },
// //   //       activation: { status: 'pending', message: 'Waiting...' },
// //   //       devices: { status: 'pending', message: 'Waiting...' }
// //   //     });
      
// //   //     setSyncMessage("Starting complete sync to cloud...");
      
// //   //     // Test if backend is running
// //   //     try {
// //   //       await checkBackendHealth();
// //   //     } catch {
// //   //       throw new Error("Backend server is not running or not responding");
// //   //     }
      
// //   //     // Make ONE call to /sync/complete
// //   //     setSyncMessage("Syncing all data to cloud...");
      
// //   //     const result = await syncData( {
// //   //       method: "POST",
// //   //       body: JSON.stringify({
// //   //         sync_school: true,
// //   //         sync_activation: true,
// //   //         sync_devices: true,
// //   //         device_batch_size: 20
// //   //       })
// //   //     });
      
// //   //     // Store the full result
// //   //     setSyncResult(result);
      
// //   //     // Update progress based on result
// //   //     const steps = result.steps || {};
      
// //   //     // Update school progress
// //   //     if (steps.school) {
// //   //       setSyncProgress(prev => ({
// //   //         ...prev,
// //   //         school: {
// //   //           status: steps.school.success ? 'completed' : 'failed',
// //   //           message: steps.school.message || 
// //   //                    (steps.school.success ? 'School synced' : 'School sync failed')
// //   //         }
// //   //       }));
// //   //     }
      
// //   //     // Update activation progress
// //   //     if (steps.activation) {
// //   //       setSyncProgress(prev => ({
// //   //         ...prev,
// //   //         activation: {
// //   //           status: steps.activation.success ? 'completed' : 'failed',
// //   //           message: steps.activation.message || 
// //   //                    (steps.activation.success ? 'Activation synced' : 'Activation sync failed')
// //   //         }
// //   //       }));
// //   //     }
      
// //   //     // Update devices progress
// //   //     if (steps.devices) {
// //   //       setSyncProgress(prev => ({
// //   //         ...prev,
// //   //         devices: {
// //   //           status: steps.devices.success ? 'completed' : 'failed',
// //   //           message: steps.devices.message || 
// //   //                    `${steps.devices.synced || 0} devices synced` ||
// //   //                    (steps.devices.success ? 'Devices synced' : 'Device sync failed')
// //   //         }
// //   //       }));
// //   //     }
      
// //   //     // Check if sync was successful overall
// //   //     if (!result.success) {
// //   //       // Check which steps failed
// //   //       const failedSteps = Object.entries(steps)
// //   //         .filter(([_, step]) => !step.success)
// //   //         .map(([name]) => name);
        
// //   //       if (failedSteps.length === Object.keys(steps).length) {
// //   //         throw new Error(`All sync steps failed: ${failedSteps.join(', ')}`);
// //   //       } else if (failedSteps.length > 0) {
// //   //         // Some steps failed but others succeeded
// //   //         console.warn(`Partial sync: ${failedSteps.join(', ')} failed`);
// //   //         // We'll continue anyway since some data was synced
// //   //       }
// //   //     }
      
// //   //     return result.success;
      
// //   //   } catch (error) {
// //   //     console.error("Complete sync error:", error);
// //   //     throw error;
// //   //   }
// //   // };
// // const performCompleteSync = async () => {
// //   try {
// //     // Reset progress
// //     setSyncProgress({
// //       school: { status: 'pending', message: 'Starting...' },
// //       activation: { status: 'pending', message: 'Waiting...' },
// //       devices: { status: 'pending', message: 'Waiting...' }
// //     });
    
// //     setSyncMessage("Starting complete sync to cloud...");
    
// //     // Test if backend is running
// //     const health = await checkBackendHealth();
// //     if (!health || !health.success) {
// //       throw new Error("Backend server is not running or not responding");
// //     }
    
// //     // Make ONE call to /sync/complete
// //     setSyncMessage("Syncing all data to cloud...");
    
// //     // CORRECTED: Pass options directly, not in fetch format
// //     const result = await syncData({
// //       sync_school: true,
// //       sync_activation: true,
// //       sync_devices: true,
// //       device_batch_size: 20
// //     });
    
// //     // Store the full result
// //     setSyncResult(result);
    
// //     // Update progress based on result
// //     const steps = result.steps || {};
    
// //     // Update school progress
// //     if (steps.school) {
// //       setSyncProgress(prev => ({
// //         ...prev,
// //         school: {
// //           status: steps.school.success ? 'completed' : 'failed',
// //           message: steps.school.message || 
// //                    (steps.school.success ? 'School synced' : 'School sync failed')
// //         }
// //       }));
// //     }
    
// //     // Update activation progress
// //     if (steps.activation) {
// //       setSyncProgress(prev => ({
// //         ...prev,
// //         activation: {
// //           status: steps.activation.success ? 'completed' : 'failed',
// //           message: steps.activation.message || 
// //                    (steps.activation.success ? 'Activation synced' : 'Activation sync failed')
// //         }
// //       }));
// //     }
    
// //     // Update devices progress
// //     if (steps.devices) {
// //       setSyncProgress(prev => ({
// //         ...prev,
// //         devices: {
// //           status: steps.devices.success ? 'completed' : 'failed',
// //           message: steps.devices.message || 
// //                    `${steps.devices.synced || 0} devices synced` ||
// //                    (steps.devices.success ? 'Devices synced' : 'Device sync failed')
// //         }
// //       }));
// //     }
    
// //     // Check if sync was successful overall
// //     if (!result.success) {
// //       const failedSteps = Object.entries(steps)
// //         .filter(([_, step]) => !step.success)
// //         .map(([name]) => name);
      
// //       if (failedSteps.length === Object.keys(steps).length) {
// //         throw new Error(`All sync steps failed: ${failedSteps.join(', ')}`);
// //       } else if (failedSteps.length > 0) {
// //         console.warn(`Partial sync: ${failedSteps.join(', ')} failed`);
// //       }
// //     }
    
// //     return result.success;
    
// //   } catch (error) {
// //     console.error("Complete sync error:", error);
// //     throw error;
// //   }
// // };



// //   // Save all settings to JSON file and start sync
// //   const handleSaveSettings = async () => {
// //     // Prepare all mini settings
// //     const allMiniSettings = {
// //       hasSeenMiniSettings: true,
// //       theme: darkMode ? "dark" : "light",
// //       screensaver: screensaver,
// //       schoolType: schoolType
// //     };
    
// //     // Save ALL mini settings to JSON file
// //     try {
// //       await miniSettingsService.saveAllMiniSettings(allMiniSettings);
// //       console.log("✅ Mini settings saved to JSON file successfully");
// //     } catch (error) {
// //       console.error("❌ Failed to save mini settings to JSON, falling back to localStorage:", error);
// //       // Fallback to localStorage
// //       localStorage.setItem("theme", darkMode ? "dark" : "light");
// //       localStorage.setItem("screensaver", screensaver.toString());
// //       localStorage.setItem("schoolType", schoolType);
// //       localStorage.setItem("hasSeenMiniSettings", "true");
// //     }
    
// //     // Mark that user has seen mini-settings (also saved above, but call specifically)
// //     try {
// //       await miniSettingsService.setSeenMiniSettings();
// //     } catch (error) {
// //       console.error("Failed to mark as seen in JSON:", error);
// //       localStorage.setItem("hasSeenMiniSettings", "true");
// //     }
    
// //     // Start sync (your existing sync functionality - UNCHANGED)
// //     setIsSyncing(true);
// //     setSyncError(null);
// //     setSyncResult(null);
// //     setSyncMessage("Preparing to sync all data...");
    
// //     try {
// //       const success = await performCompleteSync();
      
// //       if (success) {
// //         setSyncMessage("✅ All data synced successfully!");
// //       } else {
// //         setSyncMessage("⚠️ Some data synced with warnings");
// //       }
      
// //       // Wait a moment, then navigate AND call onComplete
// //       setTimeout(() => {
// //         if (onComplete) {
// //           onComplete(); // This will update the parent state
// //         }
// //         navigate("/home");
// //       }, 1500);
      
// //     } catch (error) {
// //       console.error("Sync error:", error);
// //       setSyncError(error.message);
// //       setSyncMessage("❌ Sync failed");
// //     }
// //   };

// //   const handleContinueAnyway = () => {
// //     // Mark that user has seen mini-settings in JSON file
// //     const markAsSeen = async () => {
// //       try {
// //         await miniSettingsService.setSeenMiniSettings();
// //       } catch (error) {
// //         console.error("Failed to mark as seen in JSON, using localStorage:", error);
// //         localStorage.setItem("hasSeenMiniSettings", "true");
// //       }
// //     };
    
// //     markAsSeen();
    
// //     if (onComplete) {
// //       onComplete();
// //     }
// //     navigate("/home");
// //   };

// //   const handleRetrySync = () => {
// //     setSyncError(null);
// //     setSyncResult(null);
// //     handleSaveSettings();
// //   };

// //   // Skip intro if user wants
// //   const handleSkipIntro = () => {
// //     setShowIntro(false);
// //   };

// //   const getStatusIcon = (status) => {
// //     switch (status) {
// //       case 'completed': return <CheckCircle size={16} className="text-green-500" />;
// //       case 'failed': return <X size={16} className="text-red-500" />;
// //       case 'in_progress': return <Loader2 size={16} className="animate-spin text-blue-500" />;
// //       default: return <div className="w-4 h-4 rounded-full border border-gray-400" />;
// //     }
// //   };

// //   const renderProgressSteps = () => {
// //     // Only show steps that were actually attempted
// //     const stepsToShow = [];
    
// //     if (syncResult?.steps?.school) {
// //       stepsToShow.push({
// //         key: 'school',
// //         title: 'School Information',
// //         ...syncProgress.school
// //       });
// //     }
    
// //     if (syncResult?.steps?.activation) {
// //       stepsToShow.push({
// //         key: 'activation',
// //         title: 'Activation Data',
// //         ...syncProgress.activation
// //       });
// //     }
    
// //     if (syncResult?.steps?.devices) {
// //       stepsToShow.push({
// //         key: 'devices',
// //         title: 'Device Data',
// //         ...syncProgress.devices
// //       });
// //     }
    
// //     return stepsToShow.map(step => (
// //       <div key={step.key} className="progress-step" data-status={step.status}>
// //         <div className="step-header">
// //           {getStatusIcon(step.status)}
// //           <span className="step-title">{step.title}</span>
// //         </div>
// //         <div className={`step-message ${step.status === 'failed' ? 'text-red-600' : ''}`}>
// //           {step.message}
// //         </div>
// //       </div>
// //     ));
// //   };

// //   if (showIntro) {
// //     return <Intro onSkip={handleSkipIntro} />;
// //   }

// //   return (
// //     <div className="mini-settings-wrapper full-screen flex-center">
// //       <div className="mini-settings-content seed-drop">
// //         <h2 className="settings-title">Final Setup</h2>
// //         <p className="settings-subtitle">Configure your preferences before using the system</p>

// //         <div className="step-indicator">
// //           <span className={step >= 1 ? "active" : ""}>1</span>
// //           <span className={step >= 2 ? "active" : ""}>2</span>
// //           <span className={step >= 3 ? "active" : ""}>3</span>
// //         </div>

// //         {step === 1 && (
// //           <div className="step-content">
// //             <p>Select Theme</p>
// //             <div className="option-buttons">
// //               <button
// //                 className={`option-btn ${!darkMode ? "selected" : ""}`}
// //                 onClick={() => toggleTheme("light")}
// //               >
// //                 <Sun className="icon" /> Light
// //               </button>
// //               <button
// //                 className={`option-btn ${darkMode ? "selected" : ""}`}
// //                 onClick={() => toggleTheme("dark")}
// //               >
// //                 <Moon className="icon" /> Dark
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {step === 2 && (
// //           <div className="step-content">
// //             <p>Enable Screensaver?</p>
// //             <div className="option-buttons">
// //               <button
// //                 className={`option-btn ${screensaver ? "selected" : ""}`}
// //                 onClick={() => handleScreensaver(true)}
// //               >
// //                 <Monitor className="icon" /> Enable
// //               </button>
// //               <button
// //                 className={`option-btn ${!screensaver ? "selected" : ""}`}
// //                 onClick={() => handleScreensaver(false)}
// //               >
// //                 <Monitor className="icon" /> Disable
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {step === 3 && (
// //           <div className="step-content">
// //             <p>Select School Mode</p>
// //             <div className="option-buttons">
// //               {SCHOOL_TYPES.map((type) => (
// //                 <button
// //                   key={type}
// //                   className={`option-btn ${schoolType === type ? "selected" : ''}`}
// //                   onClick={() => handleSchoolType(type)}
// //                 >
// //                   <School className="icon" /> {type}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         )}

// //         <div className="step-navigation">
// //           {step > 1 && <button className="button prev-btn" onClick={prevStep}>Back</button>}
// //           {step < 3 && <button className="button next-btn" onClick={nextStep}>Next</button>}
// //           {step === 3 && (
// //             <button className="button save-btn" onClick={handleSaveSettings}>
// //               Finish Setup
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Enhanced Sync Modal */}
// //       {isSyncing && (
// //         <div className="sync-modal-overlay">
// //           <div className="sync-modal">
// //             <div className="sync-modal-header">
// //               <Cloud className="sync-icon" />
// //               <h3>Completing Setup</h3>
// //               <p>Syncing all data to cloud database...</p>
// //             </div>

// //             <div className="sync-content">
// //               {syncError ? (
// //                 <div className="sync-error">
// //                   <AlertCircle className="error-icon" size={48} />
// //                   <p className="error-title">Sync Failed</p>
// //                   <p className="error-message">{syncError}</p>
                  
// //                   {syncResult && (
// //                     <div className="sync-details mt-3">
// //                       <p className="text-sm text-gray-600">Response from server:</p>
// //                       <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
// //                         {JSON.stringify(syncResult, null, 2)}
// //                       </pre>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <>
// //                   <Loader2 className="spinner" size={48} />
// //                   <p className="sync-message font-medium">{syncMessage}</p>
                  
// //                   {/* Progress Steps */}
// //                   {syncResult && (
// //                     <>
// //                       <div className="sync-progress-steps mt-4">
// //                         {renderProgressSteps()}
// //                       </div>
                      
// //                       {/* Sync Summary */}
// //                       <div className="sync-summary mt-4 p-3 bg-blue-50 rounded-lg">
// //                         <div className="text-center mb-2">
// //                           <span className="font-medium">Sync Summary</span>
// //                         </div>
// //                         <div className="grid grid-cols-3 gap-2 text-sm">
// //                           <div className="text-center">
// //                             <Building size={20} className="mx-auto mb-1" />
// //                             <span>School</span>
// //                             <div className="text-xs">
// //                               {syncResult.steps?.school?.success ? '✓ Done' : '✗ Failed'}
// //                             </div>
// //                           </div>
// //                           <div className="text-center">
// //                             <Database size={20} className="mx-auto mb-1" />
// //                             <span>Activation</span>
// //                             <div className="text-xs">
// //                               {syncResult.steps?.activation?.success ? '✓ Done' : '✗ Failed'}
// //                             </div>
// //                           </div>
// //                           <div className="text-center">
// //                             <Smartphone size={20} className="mx-auto mb-1" />
// //                             <span>Devices</span>
// //                             <div className="text-xs">
// //                               {syncResult.steps?.devices?.synced || 0} synced
// //                             </div>
// //                           </div>
// //                         </div>
                        
// //                         {syncResult.summary && (
// //                           <div className="mt-2 pt-2 border-t border-blue-100 text-xs text-center">
// //                             <span className="text-gray-600">
// //                               {syncResult.summary.successful_steps} of {syncResult.summary.total_steps} steps completed
// //                             </span>
// //                           </div>
// //                         )}
// //                       </div>
// //                     </>
// //                   )}
// //                 </>
// //               )}
// //             </div>

// //             <div className="sync-actions">
// //               {syncError ? (
// //                 <>
// //                   <button className="button retry-btn" onClick={handleRetrySync}>
// //                     <Loader2 size={16} className="mr-2 animate-spin" />
// //                     Retry Sync
// //                   </button>
// //                   <button className="button continue-btn" onClick={handleContinueAnyway}>
// //                     Continue Anyway
// //                   </button>
// //                 </>
// //               ) : (
// //                 <button 
// //                   className="button cancel-btn" 
// //                   onClick={() => setIsSyncing(false)}
// //                   disabled={syncMessage.includes("✅") || syncMessage.includes("⚠️")}
// //                 >
// //                   Cancel
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }




// // MiniSettingsPage.jsx - Simplified Modern Version
// import { useState, useEffect } from "react";
// import { 
//   Sun, Moon, Monitor, School, Loader2, Cloud, 
//   CheckCircle, AlertCircle 
// } from "lucide-react";
// import Intro from "../../components/Intro.jsx";
// import { useNavigate } from "react-router-dom";
// import "../../styles/mini-settings.css";
// import { syncData, checkBackendHealth } from "../../services/api.service.js";
// import { miniSettingsService } from "../../services/miniSettingsService";

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
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadSettingsFromJson();
//     const timer = setTimeout(() => setShowIntro(false), 10000);
//     return () => clearTimeout(timer);
//   }, []);

//   const loadSettingsFromJson = async () => {
//     try {
//       const settings = await miniSettingsService.getAllMiniSettings();
//       setDarkMode(settings.theme === "dark");
//       document.body.classList.toggle("dark-mode", settings.theme === "dark");
//       if (settings.screensaver !== undefined) setScreensaver(settings.screensaver);
//       if (settings.schoolType) setSchoolType(settings.schoolType);
//     } catch (error) {
//       // Fallback to localStorage
//       const savedTheme = localStorage.getItem("theme");
//       const savedScreensaver = localStorage.getItem("screensaver");
//       const savedSchoolType = localStorage.getItem("schoolType");
//       if (savedTheme) setDarkMode(savedTheme === "dark");
//       if (savedScreensaver) setScreensaver(savedScreensaver === "true");
//       if (savedSchoolType) setSchoolType(savedSchoolType);
//     }
//   };

//   const toggleTheme = async (mode) => {
//     document.body.classList.toggle("dark-mode", mode === "dark");
//     setDarkMode(mode === "dark");
//     try {
//       await miniSettingsService.updateTheme(mode);
//     } catch {
//       localStorage.setItem("theme", mode);
//     }
//   };

//   const handleScreensaver = async (enabled) => {
//     setScreensaver(enabled);
//     try {
//       await miniSettingsService.updateScreensaver(enabled);
//     } catch {
//       localStorage.setItem("screensaver", enabled.toString());
//     }
//   };

//   const handleSchoolType = async (type) => {
//     setSchoolType(type);
//     try {
//       await miniSettingsService.updateSchoolType(type);
//     } catch {
//       localStorage.setItem("schoolType", type);
//     }
//   };

//   const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
//   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

//   const performCompleteSync = async () => {
//     setSyncMessage("Starting sync...");
    
//     const health = await checkBackendHealth();
//     if (!health || !health.success) {
//       throw new Error("Backend server not responding");
//     }
    
//     const result = await syncData({
//       sync_school: true,
//       sync_activation: true,
//       sync_devices: true,
//       device_batch_size: 20
//     });
    
//     if (!result.success) {
//       const failedSteps = Object.entries(result.steps || {})
//         .filter(([_, step]) => !step.success)
//         .map(([name]) => name);
//       if (failedSteps.length) throw new Error(`Sync failed: ${failedSteps.join(', ')}`);
//     }
    
//     return result.success;
//   };

//   const handleSaveSettings = async () => {
//     // Save settings
//     await miniSettingsService.saveAllMiniSettings({
//       hasSeenMiniSettings: true,
//       theme: darkMode ? "dark" : "light",
//       screensaver: screensaver,
//       schoolType: schoolType
//     }).catch(() => {
//       localStorage.setItem("theme", darkMode ? "dark" : "light");
//       localStorage.setItem("screensaver", screensaver.toString());
//       localStorage.setItem("schoolType", schoolType);
//       localStorage.setItem("hasSeenMiniSettings", "true");
//     });
    
//     // Start sync
//     setIsSyncing(true);
//     setSyncError(null);
    
//     try {
//       await performCompleteSync();
//       setSyncMessage("✅ Setup complete!");
//       setTimeout(() => {
//         if (onComplete) onComplete();
//         navigate("/home");
//       }, 1500);
//     } catch (error) {
//       setSyncError(error.message);
//       setSyncMessage("❌ Sync failed");
//     }
//   };

//   const handleContinueAnyway = () => {
//     miniSettingsService.setSeenMiniSettings().catch(() => {
//       localStorage.setItem("hasSeenMiniSettings", "true");
//     });
//     if (onComplete) onComplete();
//     navigate("/home");
//   };

//   const handleSkipIntro = () => setShowIntro(false);

//   if (showIntro) return <Intro onSkip={handleSkipIntro} />;

//   return (
//     <div className="mini-settings-wrapper full-screen flex-center">
//       <div className="mini-settings-content seed-drop" style={{ maxWidth: '400px', width: '90%' }}>
//         <h2 className="settings-title">Final Setup</h2>
        
//         <div className="step-indicator" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
//           {[1, 2, 3].map(num => (
//             <span key={num} className={step >= num ? "active" : ""} style={{
//               width: '32px', height: '32px', borderRadius: '50%',
//               display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
//               background: step >= num ? 'var(--primary)' : 'var(--border)',
//               color: step >= num ? 'white' : 'var(--secondary)'
//             }}>{num}</span>
//           ))}
//         </div>

//         {/* Step 1 - Theme */}
//         {step === 1 && (
//           <div className="text-center">
//             <p className="mb-3">Choose Theme</p>
//             <div className="d-flex gap-3 justify-content-center">
//               <button className={`btn ${!darkMode ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleTheme("light")}>
//                 <Sun size={16} className="me-2" /> Light
//               </button>
//               <button className={`btn ${darkMode ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleTheme("dark")}>
//                 <Moon size={16} className="me-2" /> Dark
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 2 - Screensaver */}
//         {step === 2 && (
//           <div className="text-center">
//             <p className="mb-3">Screensaver</p>
//             <div className="d-flex gap-3 justify-content-center">
//               <button className={`btn ${screensaver ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handleScreensaver(true)}>
//                 <Monitor size={16} className="me-2" /> Enable
//               </button>
//               <button className={`btn ${!screensaver ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handleScreensaver(false)}>
//                 <Monitor size={16} className="me-2" /> Disable
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3 - School Type */}
//         {step === 3 && (
//           <div className="text-center">
//             <p className="mb-3">School Type</p>
//             <div className="d-flex gap-3 justify-content-center flex-wrap">
//               {SCHOOL_TYPES.map((type) => (
//                 <button key={type} className={`btn ${schoolType === type ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handleSchoolType(type)}>
//                   <School size={16} className="me-2" /> {type}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Navigation */}
//         <div className="d-flex justify-content-between mt-4">
//           {step > 1 && <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>}
//           {step < 3 && <button className="btn btn-primary ms-auto" onClick={nextStep}>Next</button>}
//           {step === 3 && <button className="btn btn-success ms-auto" onClick={handleSaveSettings}>Finish</button>}
//         </div>
//       </div>

//       {/* Sync Modal - Simplified */}
//       {isSyncing && (
//         <div className="sync-modal-overlay" style={{
//           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//           background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
//           justifyContent: 'center', zIndex: 1000
//         }}>
//           <div className="sync-modal" style={{
//             background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem',
//             maxWidth: '350px', width: '90%', textAlign: 'center'
//           }}>
//             {syncError ? (
//               <>
//                 <AlertCircle size={48} className="text-danger mb-3" />
//                 <h4 className="text-danger">Sync Failed</h4>
//                 <p className="small text-muted">{syncError}</p>
//                 <div className="d-flex gap-2 mt-3">
//                   <button className="btn btn-outline-primary flex-grow-1" onClick={handleSaveSettings}>Retry</button>
//                   <button className="btn btn-outline-secondary flex-grow-1" onClick={handleContinueAnyway}>Continue</button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <Cloud size={48} className="text-primary mb-3" />
//                 <Loader2 size={32} className="spin text-primary mb-2" />
//                 <p>{syncMessage || "Syncing data..."}</p>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       <style>{`
//         .spin { animation: spin 1s linear infinite; }
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//       `}</style>
//     </div>
//   );
// }





// MiniSettingsPage.jsx - Restructured Modern Version
import { useState, useEffect } from "react";
import { 
  Sun, Moon, Monitor, School, Loader2, Cloud, 
  CheckCircle, AlertCircle, Sparkles
} from "lucide-react";
import Intro from "../../components/Intro.jsx";
import { useNavigate } from "react-router-dom";
import "../../styles/mini-settings.css";
import { syncData, checkBackendHealth } from "../../services/api.service.js";
import { miniSettingsService } from "../../services/miniSettingsService";

const SCHOOL_TYPES = ["JHS", "SHS", "Basic School"];

export default function MiniSettingsPage({ onComplete }) {
  // State
  const [step, setStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const [schoolType, setSchoolType] = useState("SHS");
  const [showIntro, setShowIntro] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ message: "", error: null, success: false });
  const navigate = useNavigate();

  // ========== INITIALIZATION ==========
  useEffect(() => {
    loadSettings();
    const timer = setTimeout(() => setShowIntro(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await miniSettingsService.getAllMiniSettings();
      applySettings(settings);
    } catch {
      // Fallback to localStorage
      applySettings({
        theme: localStorage.getItem("theme") || "light",
        screensaver: localStorage.getItem("screensaver") === "true",
        schoolType: localStorage.getItem("schoolType") || "SHS"
      });
    }
  };

  const applySettings = (settings) => {
    const isDark = settings.theme === "dark";
    setDarkMode(isDark);
    document.body.classList.toggle("dark-mode", isDark);
    if (settings.screensaver !== undefined) setScreensaver(settings.screensaver);
    if (settings.schoolType) setSchoolType(settings.schoolType);
  };

  // ========== SETTINGS HANDLERS ==========
  const updateSetting = async (key, value, saveFn) => {
    // Update UI immediately
    if (key === "theme") {
      setDarkMode(value === "dark");
      document.body.classList.toggle("dark-mode", value === "dark");
    } else if (key === "screensaver") {
      setScreensaver(value);
    } else if (key === "schoolType") {
      setSchoolType(value);
    }
    
    // Save to storage
    try {
      await saveFn(value);
    } catch {
      localStorage.setItem(key, value.toString());
    }
  };

  const toggleTheme = (mode) => updateSetting("theme", mode, miniSettingsService.updateTheme);
  const handleScreensaver = (enabled) => updateSetting("screensaver", enabled, miniSettingsService.updateScreensaver);
  const handleSchoolType = (type) => updateSetting("schoolType", type, miniSettingsService.updateSchoolType);

  // ========== NAVIGATION ==========
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleSkipIntro = () => setShowIntro(false);

  // ========== SYNC & COMPLETE ==========
  const performSync = async () => {
    setSyncStatus({ message: "Connecting to server...", error: null, success: false });
    
    const health = await checkBackendHealth();
    if (!health?.success) throw new Error("Server not responding");
    
    setSyncStatus({ message: "Syncing data...", error: null, success: false });
    const result = await syncData({
      sync_school: true,
      sync_activation: true,
      sync_devices: true,
      device_batch_size: 20
    });
    
    if (!result.success) {
      const failed = Object.entries(result.steps || {})
        .filter(([, s]) => !s.success).map(([n]) => n);
      if (failed.length) throw new Error(`Failed: ${failed.join(", ")}`);
    }
    
    return result;
  };

  const saveAllSettings = async () => {
    const allSettings = {
      hasSeenMiniSettings: true,
      theme: darkMode ? "dark" : "light",
      screensaver,
      schoolType
    };
    
    try {
      await miniSettingsService.saveAllMiniSettings(allSettings);
    } catch {
      Object.entries(allSettings).forEach(([key, val]) => {
        localStorage.setItem(key, val.toString());
      });
    }
  };

  const handleComplete = async () => {
    await saveAllSettings();
    setIsSyncing(true);
    
    try {
      await performSync();
      setSyncStatus({ message: "Setup complete!", error: null, success: true });
      setTimeout(() => {
        if (onComplete) onComplete();
        navigate("/home");
      }, 1500);
    } catch (error) {
      setSyncStatus({ message: "Sync failed", error: error.message, success: false });
    }
  };

  const handleContinueAnyway = () => {
    saveAllSettings();
    if (onComplete) onComplete();
    navigate("/home");
  };

  // ========== STEP RENDERERS ==========
  const StepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(num => (
        <span key={num} className={step >= num ? "active" : ""}>{num}</span>
      ))}
    </div>
  );

  const StepTheme = () => (
    <div className="step-content">
      <p className="step-title">Choose Theme</p>
      <div className="option-buttons">
        <button className={`option-btn ${!darkMode ? "selected" : ""}`} onClick={() => toggleTheme("light")}>
          <Sun size={18} /> Light
        </button>
        <button className={`option-btn ${darkMode ? "selected" : ""}`} onClick={() => toggleTheme("dark")}>
          <Moon size={18} /> Dark
        </button>
      </div>
    </div>
  );

  const StepScreensaver = () => (
    <div className="step-content">
      <p className="step-title">Screensaver</p>
      <div className="option-buttons">
        <button className={`option-btn ${screensaver ? "selected" : ""}`} onClick={() => handleScreensaver(true)}>
          <Monitor size={18} /> Enable
        </button>
        <button className={`option-btn ${!screensaver ? "selected" : ""}`} onClick={() => handleScreensaver(false)}>
          <Monitor size={18} /> Disable
        </button>
      </div>
    </div>
  );

  const StepSchoolType = () => (
    <div className="step-content">
      <p className="step-title">School Type</p>
      <div className="option-buttons">
        {SCHOOL_TYPES.map(type => (
          <button key={type} className={`option-btn ${schoolType === type ? "selected" : ""}`} onClick={() => handleSchoolType(type)}>
            <School size={18} /> {type}
          </button>
        ))}
      </div>
    </div>
  );

  const StepNavigation = () => (
    <div className="step-navigation">
      {step > 1 && <button className="btn-back" onClick={prevStep}>Back</button>}
      {step < 3 && <button className="btn-next" onClick={nextStep}>Continue</button>}
      {step === 3 && <button className="btn-finish" onClick={handleComplete}>Finish Setup</button>}
    </div>
  );

  // ========== SYNC MODAL ==========
  const SyncModal = () => (
    <div className="sync-modal-overlay">
      <div className="sync-modal">
        {syncStatus.error ? (
          <>
            <AlertCircle size={48} className="error-icon" />
            <h4>Sync Failed</h4>
            <p className="error-message">{syncStatus.error}</p>
            <div className="sync-actions">
              <button className="btn-retry" onClick={handleComplete}>Retry</button>
              <button className="btn-continue" onClick={handleContinueAnyway}>Continue</button>
            </div>
          </>
        ) : syncStatus.success ? (
          <>
            <CheckCircle size={48} className="success-icon" />
            <h4>All Set!</h4>
            <p>Redirecting to dashboard...</p>
          </>
        ) : (
          <>
            <Cloud size={48} className="sync-icon" />
            <Loader2 size={32} className="spinner" />
            <p className="sync-message">{syncStatus.message}</p>
          </>
        )}
      </div>
    </div>
  );

  // ========== RENDER ==========
  if (showIntro) return <Intro onSkip={handleSkipIntro} />;

  return (
    <div className="mini-settings-wrapper">
      <div className="mini-settings-card">
        <div className="card-header">
          {/* <Sparkles size={24} className="header-icon" /> */}
          <h2>Final Setup</h2>
          <p>Configure your preferences</p>
        </div>

        <StepIndicator />

        <div className="steps-container">
          {step === 1 && <StepTheme />}
          {step === 2 && <StepScreensaver />}
          {step === 3 && <StepSchoolType />}
        </div>

        <StepNavigation />
      </div>

      {isSyncing && <SyncModal />}
    </div>
  );
}