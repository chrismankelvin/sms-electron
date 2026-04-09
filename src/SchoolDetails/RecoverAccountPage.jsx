// // pages/RecoverAccount/RecoverAccountPage.jsx (FIXED VERSION)
// import { useState, useEffect } from "react";
// import { Mail, Search, Key, ArrowLeft, CheckCircle, AlertCircle, Wifi, User, Phone, Shield, Loader2, Database, RefreshCw } from "lucide-react";
// import Notification from "../components/Notification";
// import "../styles/school-details.css";
// import "../styles/global.css";
// import { useNavigate } from "react-router-dom";
// import { importRecoveryData } from "../services/api.service";

// export default function RecoverAccountPage() {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState("");
//   const [schoolName, setSchoolName] = useState("");
//   const [contact, setContact] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [schoolFound, setSchoolFound] = useState(null);
//   const [verificationData, setVerificationData] = useState(null);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [confirmDeactivation, setConfirmDeactivation] = useState(false);
//   const [recoveryResult, setRecoveryResult] = useState(null);
//   const [transferStatus, setTransferStatus] = useState(null);
//   const navigate = useNavigate();


//  const RECOVERY_API_URL = "http://localhost:8001";
//   const MAIN_APP_URL = "http://localhost:8000";
//   // const MAIN_APP_API_KEY = "your-api-key-here"; // Should come from env/config
// const MAIN_APP_API_KEY = import.meta.env.VITE_MAIN_APP_API_KEY || "local-import-key";


//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);
    
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
    
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // Check internet connectivity
//   if (!isOnline) {
//     return (
//       <div className="app app-login p-0">
//         <div className="row g-0 app-auth-wrapper">
//           <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
//             <div className="app-auth-body mx-auto">
//               <div className="text-center mb-4">
//                 <AlertCircle size={64} className="text-danger mb-3" />
//                 <h3 className="auth-heading text-center mb-3">Internet Required</h3>
//                 <p className="text-muted">
//                   You need an active internet connection to recover your school account.
//                 </p>
//                 <p className="text-danger">
//                   <strong>Please connect to the internet and try again.</strong>
//                 </p>
//                 <button 
//                   className="btn btn-outline-primary mt-3"
//                   onClick={() => navigate(-1)}
//                 >
//                   <ArrowLeft size={16} className="me-2" />
//                   Go Back
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
//             <div className="auth-background-holder"></div>
//             <div className="auth-background-mask"></div>
//             <div className="auth-background-overlay bg-dark bg-opacity-50 p-3 p-lg-5 text-center">
//               <h2 className="fw-bold mb-3 text-light">Account Recovery</h2>
//               <p className="lead text-light">
//                 School data recovery requires internet connection.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }


// const getAuthHeaders = () => {
//     const headers = { "Content-Type": "application/json" };
    
//     // For web development, add API key
//     if (!window.electron?.isElectron) {
//         const apiKey = import.meta.env.VITE_RECOVERY_API_KEY;
//         if (apiKey) {
//             headers["Authorization"] = `Bearer ${apiKey}`;
//         }
//     }
    
//     return headers;
// };

// // Handle API responses
// const handleApiResponse = async (response) => {
//     if (response.status === 401) {
//         return {
//             success: false,
//             error: 'AUTH_ERROR',
//             message: 'Authentication failed. Please restart the application.'
//         };
//     }
    
//     if (response.status === 429) {
//         return {
//             success: false,
//             error: 'RATE_LIMITED',
//             message: 'Too many recovery attempts. Please wait 1 hour before trying again.'
//         };
//     }
    
//     if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         return {
//             success: false,
//             error: 'API_ERROR',
//             message: error.detail || `Server error: ${response.status}`
//         };
//     }
    
//     return await response.json();
// };





//   // const checkSchoolExists = async () => {
//   //   if (!email) {
//   //     setNotification({ message: "Please enter your school email address.", type: "error" });
//   //     return;
//   //   }

//   //   // Basic email validation
//   //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   //   if (!emailRegex.test(email)) {
//   //     setNotification({ message: "Please enter a valid email address.", type: "error" });
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   setNotification({ message: "", type: "" });
    
//   //   try {
//   //     const response = await fetch(`${RECOVERY_API_URL}/check-school`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({ email }),
//   //     });

//   //     const result = await response.json();
      
//   //     if (response.ok && result.exists) {
//   //       setSchoolFound(result.school);
//   //       setNotification({
//   //         message: `School found: ${result.school.school_name}`,
//   //         type: "success"
//   //       });
//   //       setStep(2); // Move to verification step
//   //     } else {
//   //       setSchoolFound(null);
//   //       setNotification({
//   //         message: result.message || "No school found with this email.",
//   //         type: "warning"
//   //       });
//   //     }
//   //   } catch (error) {
//   //     setNotification({
//   //       message: "Error checking school. Please try again.",
//   //       type: "error"
//   //     });
//   //     setSchoolFound(null);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };



//   const checkSchoolExists = async () => {
//     if (!email) {
//         setNotification({ message: "Please enter your school email address.", type: "error" });
//         return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         setNotification({ message: "Please enter a valid email address.", type: "error" });
//         return;
//     }

//     setLoading(true);
//     setNotification({ message: "", type: "" });
    
//     try {
//         const response = await fetch(`${RECOVERY_API_URL}/check-school`, {
//             method: "POST",
//             headers: getAuthHeaders(),
//             body: JSON.stringify({ email }),
//         });

//         const result = await handleApiResponse(response);
        
//         if (result.error) {
//             setNotification({ message: result.message, type: "error" });
//             setSchoolFound(null);
//         } else if (result.exists) {
//             setSchoolFound(result.school);
//             setNotification({
//                 message: `School found: ${result.school.school_name}`,
//                 type: "success"
//             });
//             setStep(2);
//         } else {
//             setSchoolFound(null);
//             setNotification({
//                 message: result.message || "No school found with this email.",
//                 type: "warning"
//             });
//         }
//     } catch (error) {
//         console.error('Check school error:', error);
//         setNotification({
//             message: "Error checking school. Please check your connection.",
//             type: "error"
//         });
//         setSchoolFound(null);
//     } finally {
//         setLoading(false);
//     }
// };

//   // const verifySchoolDetails = async () => {
//   //   if (!schoolName || !contact) {
//   //     setNotification({ message: "Please enter school name and contact number.", type: "error" });
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   setNotification({ message: "", type: "" });
    
//   //   try {
//   //     const response = await fetch(`${RECOVERY_API_URL}/verify-recovery`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({
//   //         email: email,
//   //         school_name: schoolName,
//   //         contact: contact
//   //       }),
//   //     });

//   //     const result = await response.json();
      
//   //     if (response.ok && result.verified) {
//   //       setVerificationData(result.data);
//   //       setNotification({
//   //         message: result.message,
//   //         type: "success"
//   //       });
//   //       setStep(3); // Move to confirmation step
//   //     } else {
//   //       setNotification({
//   //         message: result.message || "Verification failed. Please check your details.",
//   //         type: "error"
//   //       });
//   //     }
//   //   } catch (error) {
//   //     setNotification({
//   //       message: "Verification failed. Please try again.",
//   //       type: "error"
//   //     });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };



//   // ============================================
// // UPDATED verifySchoolDetails
// // ============================================
// const verifySchoolDetails = async () => {
//     if (!schoolName || !contact) {
//         setNotification({ message: "Please enter school name and contact number.", type: "error" });
//         return;
//     }

//     setLoading(true);
//     setNotification({ message: "", type: "" });
    
//     try {
//         const response = await fetch(`${RECOVERY_API_URL}/verify-recovery`, {
//             method: "POST",
//             headers: getAuthHeaders(),
//             body: JSON.stringify({
//                 email: email,
//                 school_name: schoolName,
//                 contact: contact
//             }),
//         });

//         const result = await handleApiResponse(response);
        
//         if (result.error) {
//             setNotification({ message: result.message, type: "error" });
//         } else if (result.verified) {
//             setVerificationData(result.data);
//             setNotification({ message: result.message, type: "success" });
//             setStep(3);
//         } else {
//             setNotification({
//                 message: result.message || "Verification failed. Please check your details.",
//                 type: "error"
//             });
//         }
//     } catch (error) {
//         console.error('Verification error:', error);
//         setNotification({
//             message: "Verification failed. Please try again.",
//             type: "error"
//         });
//     } finally {
//         setLoading(false);
//     }
// };



// //  const performRecovery = async () => {
// //     if (!confirmDeactivation) {
// //       setNotification({ 
// //         message: "You must confirm device deactivation to proceed.", 
// //         type: "error" 
// //       });
// //       return;
// //     }

// //     setLoading(true);
// //     setNotification({ message: "", type: "" });
    
// //     try {
// //       // Step 1: Get encrypted blob from recovery server
// //       const response = await fetch(`${RECOVERY_API_URL}/perform-recovery`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           email: email,
// //           school_name: schoolName,
// //           contact: contact,
// //           confirm_deactivation: true
// //         }),
// //       });

// //       const result = await response.json();
      
// //       if (response.ok && result.success) {
// //         setRecoveryResult(result);
// //         setNotification({
// //           message: "Recovery blob created successfully",
// //           type: "success"
// //         });
        
// //         // Step 2: Transfer to main app (directly, NOT via recovery server)
// //         await transferDataToMainApp(result.encrypted_blob);
        
// //       } else {
// //         setNotification({
// //           message: result.message || "Recovery failed.",
// //           type: "error"
// //         });
// //         setStep(2); // Go back to verification
// //       }
// //     } catch (error) {
// //       setNotification({
// //         message: "Recovery failed. Please try again.",
// //         type: "error"
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };




// // ============================================
// // UPDATED performRecovery
// // ============================================
// const performRecovery = async () => {
//     if (!confirmDeactivation) {
//         setNotification({ 
//             message: "You must confirm device deactivation to proceed.", 
//             type: "error" 
//         });
//         return;
//     }

//     setLoading(true);
//     setNotification({ message: "", type: "" });
    
//     try {
//         const response = await fetch(`${RECOVERY_API_URL}/perform-recovery`, {
//             method: "POST",
//             headers: getAuthHeaders(),
//             body: JSON.stringify({
//                 email: email,
//                 school_name: schoolName,
//                 contact: contact,
//                 confirm_deactivation: true
//             }),
//         });

//         const result = await handleApiResponse(response);
        
//         if (result.error) {
//             setNotification({ message: result.message, type: "error" });
//             setStep(2);
//         } else if (result.success) {
//             setRecoveryResult(result);
//             setNotification({ message: "Recovery blob created successfully", type: "success" });
//             await transferDataToMainApp(result.encrypted_blob);
//         } else {
//             setNotification({ message: result.message || "Recovery failed.", type: "error" });
//             setStep(2);
//         }
//     } catch (error) {
//         console.error('Recovery error:', error);
//         setNotification({ message: "Recovery failed. Please try again.", type: "error" });
//     } finally {
//         setLoading(false);
//     }
// };


//  const transferDataToMainApp = async (encryptedBlob) => {
//     setStep(4); // Show transfer progress
//     setTransferStatus({
//       stage: "starting",
//       message: "Starting data transfer to main application...",
//       progress: 0
//     });
    
//     try {
//       // Step 1: Check if main app is running
//       setTransferStatus({
//         stage: "checking",
//         message: "Checking main application status...",
//         progress: 10
//       });
      
//       const mainAppHealth = await checkMainAppStatus();
//       if (!mainAppHealth.running) {
//         setTransferStatus({
//           stage: "error",
//           message: "Main application is not running. Please start the main app on port 8000.",
//           progress: 0
//         });
//         return;
//       }
      
//       // Step 2: Import directly to main app (NOT through recovery server)
//       setTransferStatus({
//         stage: "importing",
//         message: "Importing recovered data to main application...",
//         progress: 30
//       });
      
//       const importResult = await importToMainApp(encryptedBlob);
      
//       if (importResult.success) {
//         setTransferStatus({
//           stage: "complete",
//           message: "Data transfer completed successfully!",
//           progress: 100
//         });
        
//         // Wait 2 seconds then go to success
//         setTimeout(() => {
//           setStep(5);
//         }, 2000);
        
//       } else {
//         setTransferStatus({
//           stage: "error",
//           message: `Import failed: ${importResult.error || "Unknown error"}`,
//           progress: 0
//         });
//       }
      
//     } catch (error) {
//       setTransferStatus({
//         stage: "error",
//         message: `Transfer failed: ${error.message}`,
//         progress: 0
//       });
//     }
//   };

//   const checkMainAppStatus = async () => {
//     try {
//       const response = await fetch(`${MAIN_APP_URL}/health/test`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         signal: AbortSignal.timeout(10000)
//       });
      
//       return {
//         running: response.ok,
//         status: response.status,
//         message: response.ok ? "Main app is running" : `Main app returned ${response.status}`
//       };
//     } catch (error) {
//       return {
//         running: false,
//         error: error.message
//       };
//     }
//   };

//   // const importToMainApp = async (encryptedBlob) => {
//   //   try {
//   //     // DIRECT call to main app - NOT through recovery server
//   //     const response = await fetch(`${MAIN_APP_URL}/recovery/import`, {
//   //       method: "POST",
//   //       headers: { 
//   //         "Content-Type": "application/json",
//   //         "X-API-Key": MAIN_APP_API_KEY  // Required authentication
//   //       },
//   //       body: JSON.stringify({
//   //         school_email: email,
//   //         encrypted_backup: encryptedBlob
//   //       })
//   //     });
      
//   //     const result = await response.json();
//   //     return {
//   //       success: response.ok,
//   //       data: result,
//   //       error: response.ok ? null : result.detail || "Import failed"
//   //     };
//   //   } catch (error) {
//   //     return {
//   //       success: false,
//   //       error: error.message
//   //     };
//   //   }
//   // };

//   // const verifyMainAppData = async () => {
//   //   try {
//   //     // Check activation status (should be deactivated after recovery)
//   //     const response = await fetch(`${MAIN_APP_URL}/activation/status`, {
//   //       method: "GET",
//   //       headers: { "Content-Type": "application/json" }
//   //     });
      
//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       // After recovery, system should be deactivated
//   //       return {
//   //         success: true,
//   //         activated: data.activated,
//   //         message: data.activated ? "System is activated (unexpected)" : "System is deactivated (expected)"
//   //       };
//   //     }
//   //     return { success: false, error: "Failed to check activation status" };
//   //   } catch (error) {
//   //     return { success: false, error: error.message };
//   //   }
//   // };


//   const importToMainApp = async (encryptedBlob) => {
//   try {
//     // Use IPC instead of direct HTTP call
//     const result = await importRecoveryData(email, encryptedBlob);
    
//     if (result.success) {
//       return {
//         success: true,
//         data: result,
//         error: null
//       };
//     } else {
//       return {
//         success: false,
//         error: result.error || result.message || "Import failed"
//       };
//     }
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

//   const handleManualRedirect = () => {
//     setTransferStatus({
//       stage: "manual",
//       message: "Redirecting to main application...",
//       progress: 100
//     });
    
//     // Give a brief moment for user to see the message
//     setTimeout(() => {
//       window.location.href = "http://localhost:5173/";
//     }, 500);
//   };

//  const startNewRegistration = () => {
//     navigate("/school-details");
//   };

//   const goBack = () => {
//     if (step > 1) {
//       setStep(step - 1);
//     } else {
//       navigate(-1);
//     }
//   };

//   // Progress bar component
//   const ProgressBar = ({ progress, stage }) => {
//     const getStageColor = () => {
//       switch(stage) {
//         case "starting": return "info";
//         case "checking": return "info";
//         case "importing": return "warning";
//         case "verifying": return "warning";
//         case "complete": return "success";
//         case "error": return "danger";
//         case "warning": return "warning";
//         default: return "primary";
//       }
//     };

//     return (
//       <div className="progress-container mb-3">
//         <div className="d-flex justify-content-between mb-1">
//           <span className="small">{stage}</span>
//           <span className="small">{progress}%</span>
//         </div>
//         <div className="progress" style={{ height: "10px" }}>
//           <div 
//             className={`progress-bar bg-${getStageColor()}`}
//             role="progressbar" 
//             style={{ width: `${progress}%` }}
//             aria-valuenow={progress} 
//             aria-valuemin="0" 
//             aria-valuemax="100"
//           ></div>
//         </div>
//         <div className="text-center mt-2">
//           <small className="text-muted">{transferStatus?.message}</small>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="app app-login p-0">
//       <Notification
//         message={notification.message}
//         type={notification.type}
//         onClose={() => setNotification({ message: "", type: "" })}
//       />


//       <div className="row g-0 app-auth-wrapper">
//         {/* Form Section */}
//         <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
//           <div className="app-auth-body mx-auto">
//             {step < 5 && (
//               <button 
//                 className="btn btn-sm btn-outline-secondary mb-4 align-self-start"
//                 onClick={goBack}
//               >
//                 <ArrowLeft size={16} className="me-1" />
//                 Back
//               </button>
//             )}

//             <div className="text-center mb-4">
//               <div className="recovery-icon mb-3">
//                 <Shield size={48} className="text-primary" />
//               </div>
//               <h2 className="auth-heading mb-2">Recover School Account</h2>
//               <div className="step-indicator mb-3">
//                 <span className={step >= 1 ? "active" : ""}>1</span>
//                 <span className={step >= 2 ? "active" : ""}>2</span>
//                 <span className={step >= 3 ? "active" : ""}>3</span>
//                 <span className={step >= 4 ? "active" : ""}>4</span>
//                 <span className={step >= 5 ? "active" : ""}>✓</span>
//               </div>
//             </div>

//             {/* Step 1: Email Input */}
//             {step === 1 && (
//               <div className="recovery-step">
//                 <div className="mb-4">
//                   <div className="alert alert-info">
//                     <Key size={16} className="me-2" />
//                     <strong>Step 1: Find Your School</strong>
//                     <p className="mb-0 mt-2">Enter the email address used during initial registration to find your school.</p>
//                   </div>
//                 </div>

//                 <div className="mb-4 position-relative">
//                   <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                   <input
//                     type="email"
//                     className="form-control ps-5"
//                     placeholder="Enter registered school email *"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     disabled={loading}
//                   />
//                 </div>

//                 <div className="d-flex gap-2">
//                   <button 
//                     type="button"
//                     className="btn btn-outline-secondary flex-grow-1"
//                     onClick={startNewRegistration}
//                     disabled={loading}
//                   >
//                     Start New Registration
//                   </button>
                  
//                   <button 
//                     type="button"
//                     className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
//                     onClick={checkSchoolExists}
//                     disabled={!email || loading}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2"></span>
//                         Checking...
//                       </>
//                     ) : (
//                       <>
//                         <Search size={18} className="me-2" />
//                         Find School
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Verification */}
//             {step === 2 && schoolFound && (
//               <div className="recovery-step">
//                 <div className="mb-4">
//                   <div className="alert alert-warning">
//                     <AlertCircle size={16} className="me-2" />
//                     <strong>Step 2: Verify School Details</strong>
//                     <p className="mb-0 mt-2">Please enter the exact school name and contact number to verify ownership.</p>
//                   </div>
                  
//                   <div className="card border-info mb-4">
//                     <div className="card-body">
//                       <h6 className="card-title text-info">School Found:</h6>
//                       <p className="mb-1"><strong>Name:</strong> {schoolFound.school_name}</p>
//                       <p className="mb-1"><strong>Email:</strong> {schoolFound.school_email}</p>
//                       <p className="mb-0"><strong>Registered:</strong> {new Date(schoolFound.created_at).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mb-3">
//                   <label className="form-label">School Name *</label>
//                   <div className="position-relative">
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="Enter exact school name"
//                       value={schoolName}
//                       onChange={(e) => setSchoolName(e.target.value)}
//                       disabled={loading}
//                     />
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label">Contact Number *</label>
//                   <div className="position-relative">
//                     <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="tel"
//                       className="form-control ps-5"
//                       placeholder="Enter registered contact number"
//                       value={contact}
//                       onChange={(e) => setContact(e.target.value)}
//                       disabled={loading}
//                     />
//                   </div>
//                 </div>

//                 <div className="d-flex gap-2">
//                   <button 
//                     type="button"
//                     className="btn btn-outline-secondary flex-grow-1"
//                     onClick={() => setStep(1)}
//                     disabled={loading}
//                   >
//                     Back
//                   </button>
                  
//                   <button 
//                     type="button"
//                     className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
//                     onClick={verifySchoolDetails}
//                     disabled={!schoolName || !contact || loading}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2"></span>
//                         Verifying...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle size={18} className="me-2" />
//                         Verify & Continue
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Confirmation */}
//             {step === 3 && verificationData && (
//               <div className="recovery-step">
//                 <div className="mb-4">
//                   <div className="alert alert-danger">
//                     <AlertCircle size={16} className="me-2" />
//                     <strong>Step 3: Important Security Notice</strong>
//                     <p className="mb-0 mt-2">
//                       Recovery will deactivate any existing device and require reactivation with a new code.
//                     </p>
//                   </div>
                  
//                   <div className="card border-success mb-4">
//                     <div className="card-body">
//                       <h5 className="card-title text-success d-flex align-items-center">
//                         <CheckCircle size={20} className="me-2" />
//                         Verification Successful
//                       </h5>
//                       <div className="row mt-3">
//                         <div className="col-md-6 mb-3">
//                           <h6>School Details:</h6>
//                           <p className="mb-1"><strong>Name:</strong> {verificationData.school.school_name}</p>
//                           <p className="mb-1"><strong>Location:</strong> {verificationData.school.city}, {verificationData.school.region}</p>
//                         </div>
//                         <div className="col-md-6 mb-3">
//                           <h6>Admin Accounts:</h6>
//                           <p className="mb-1"><strong>Count:</strong> {verificationData.admin_count} admin(s)</p>
//                           <ul className="list-unstyled mb-0">
//                             {verificationData.admins.map((admin, index) => (
//                               <li key={index} className="small">
//                                 <User size={12} className="me-1" />
//                                 {admin.first_name} {admin.last_name}
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="confirmDeactivation"
//                       checked={confirmDeactivation}
//                       onChange={(e) => setConfirmDeactivation(e.target.checked)}
//                     />
//                     <label className="form-check-label" htmlFor="confirmDeactivation">
//                       <strong>I understand and confirm:</strong>
//                       <ul className="mb-0 mt-2">
//                         <li>Any existing device will be deactivated</li>
//                         <li>I need a new activation code from vendor</li>
//                         <li>All admin accounts will be restored</li>
//                         <li>School data will be downloaded to this device</li>
//                       </ul>
//                     </label>
//                   </div>
//                 </div>

//                 <div className="d-flex gap-2">
//                   <button 
//                     type="button"
//                     className="btn btn-outline-secondary flex-grow-1"
//                     onClick={() => setStep(2)}
//                     disabled={loading}
//                   >
//                     Back
//                   </button>
                  
//                   <button 
//                     type="button"
//                     className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center"
//                     onClick={performRecovery}
//                     disabled={!confirmDeactivation || loading}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2"></span>
//                         Recovering...
//                       </>
//                     ) : (
//                       <>
//                         <Shield size={18} className="me-2" />
//                         Complete Recovery
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 4: Data Transfer */}
//             {step === 4 && (
//               <div className="recovery-step">
//                 <div className="text-center mb-4">
//                   <Database size={48} className="text-primary mb-3" />
//                   <h3 className="text-primary mb-3">Transferring Data</h3>
//                   <p className="text-muted">
//                     Transferring recovered data to main application...
//                   </p>
//                 </div>

//                 {transferStatus && (
//                   <div className="transfer-container">
//                     <ProgressBar 
//                       progress={transferStatus.progress} 
//                       stage={transferStatus.stage} 
//                     />
                    
//                     {transferStatus.stage === "complete" && (
//                       <div className="alert alert-success mt-3">
//                         <CheckCircle size={16} className="me-2" />
//                         Transfer completed successfully! Redirecting...
//                       </div>
//                     )}
                    
//                     {transferStatus.stage === "error" && (
//                       <div className="alert alert-danger mt-3">
//                         <AlertCircle size={16} className="me-2" />
//                         {transferStatus.message}
//                         <div className="mt-2">
//                           <button 
//                             className="btn btn-sm btn-outline-danger me-2"
//                             onClick={() => window.location.reload()}
//                           >
//                             <RefreshCw size={14} className="me-1" />
//                             Retry
//                           </button>
//                           <button 
//                             className="btn btn-sm btn-warning"
//                             onClick={handleManualRedirect}
//                           >
//                             Continue Anyway
//                           </button>
//                         </div>
//                       </div>
//                     )}
                    
//                     {transferStatus.stage === "warning" && (
//                       <div className="alert alert-warning mt-3">
//                         <AlertCircle size={16} className="me-2" />
//                         {transferStatus.message}
//                         <div className="mt-2">
//                           <button 
//                             className="btn btn-sm btn-warning"
//                             onClick={handleManualRedirect}
//                           >
//                             Continue to Main App
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {recoveryResult && (
//                   <div className="card border-secondary mt-4">
//                     <div className="card-body">
//                       <h6 className="card-title">Recovery Details:</h6>
//                       <div className="row">
//                         <div className="col-md-6">
//                           <p className="mb-1 small"><strong>School:</strong> {recoveryResult.data?.school_name}</p>
//                           <p className="mb-1 small"><strong>Admins Recovered:</strong> {recoveryResult.data?.admins_recovered}</p>
//                         </div>
//                         <div className="col-md-6">
//                           <p className="mb-1 small"><strong>Blob Size:</strong> {recoveryResult.data?.encrypted_blob_length} chars</p>
//                           <p className="mb-1 small"><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Step 5: Success */}
//             {step === 5 && (
//               <div className="recovery-step">
//                 <div className="text-center py-4">
//                   <CheckCircle size={64} className="text-success mb-3" />
//                   <h3 className="text-success mb-3">Recovery Complete!</h3>
//                   <p className="lead mb-4">
//                     Your school account has been successfully recovered and transferred.
//                   </p>
                  
//                   <div className="card border-success mb-4">
//                     <div className="card-body">
//                       <h5 className="card-title">Recovery Summary:</h5>
//                       <div className="row text-start">
//                         <div className="col-md-6">
//                           <p className="mb-2"><strong>✓ School Data:</strong> Restored</p>
//                           <p className="mb-2"><strong>✓ Admin Accounts:</strong> {recoveryResult?.data?.admins_recovered || 0} restored</p>
//                         </div>
//                         <div className="col-md-6">
//                           <p className="mb-2"><strong>✓ Database:</strong> Updated</p>
//                           <p className="mb-2"><strong>✓ System Status:</strong> Deactivated (needs activation)</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="alert alert-success">
//                     <CheckCircle size={16} className="me-2" />
//                     <span>All data has been successfully inserted into the main application.</span>
//                   </div>
                  
//                   <div className="d-grid gap-2">
//                     <button 
//                       className="btn btn-success btn-lg"
//                       onClick={handleManualRedirect}
//                     >
//                       Go to Activation Page
//                     </button>
                    
//                     <button 
//                       className="btn btn-outline-secondary"
//                       onClick={() => {
//                         // Restart recovery process
//                         setStep(1);
//                         setRecoveryResult(null);
//                         setTransferStatus(null);
//                       }}
//                     >
//                       Recover Another Account
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Additional Info */}
//             <div className="mt-4">
//               {step === 1 ? (
//                 <div className="alert alert-warning">
//                   <small>
//                     <strong>Note:</strong> Recovery only works for schools already registered 
//                     in our cloud database. If you don't have an account, please use 
//                     "Start New Registration".
//                   </small>
//                 </div>
//               ) : step === 4 ? (
//                 <div className="alert alert-info">
//                   <small>
//                     <strong>Transfer Process:</strong> Data is being transferred from recovery server 
//                     to main application. Do not close this window.
//                   </small>
//                 </div>
//               ) : (
//                 <div className="alert alert-info">
//                   <small>
//                     <strong>Security:</strong> All recovery operations are logged and monitored. 
//                     Recovery data is stored separately from main database.
//                   </small>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Background Side */}
//         <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
//           <div className="auth-background-holder"></div>
//           <div className="auth-background-mask"></div>
//           <div className="auth-background-overlay bg-dark bg-opacity-50 p-3 p-lg-5 text-center">
//             <h2 className="fw-bold mb-3 text-light">Secure Account Recovery</h2>
//             <p className="lead text-light mb-4">
//               Multi-step verification process to ensure account security
//             </p>
            
//             <div className="recovery-steps mt-4">
//               <div className="d-flex flex-column gap-3">
//                 <div className="d-flex align-items-center">
//                   <div className={`step-number ${step >= 1 ? 'active' : ''}`}>1</div>
//                   <div className="ms-3">
//                     <div className="step-title">Find School</div>
//                     <div className="step-description">Verify email in cloud database</div>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center">
//                   <div className={`step-number ${step >= 2 ? 'active' : ''}`}>2</div>
//                   <div className="ms-3">
//                     <div className="step-title">Verify Details</div>
//                     <div className="step-description">Confirm school name & contact</div>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center">
//                   <div className={`step-number ${step >= 3 ? 'active' : ''}`}>3</div>
//                   <div className="ms-3">
//                     <div className="step-title">Security Confirmation</div>
//                     <div className="step-description">Acknowledge deactivation</div>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center">
//                   <div className={`step-number ${step >= 4 ? 'active' : ''}`}>4</div>
//                   <div className="ms-3">
//                     <div className="step-title">Data Transfer</div>
//                     <div className="step-description">
//                       {step === 4 ? "Transferring to main app..." : "Transfer to main application"}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center">
//                   <div className={`step-number ${step >= 5 ? 'active complete' : ''}`}>
//                     {step >= 5 ? '✓' : '5'}
//                   </div>
//                   <div className="ms-3">
//                     <div className="step-title">Complete</div>
//                     <div className="step-description">Ready for activation</div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="cloud-info mt-4">
//                 <div className="d-flex align-items-center justify-content-center mb-2">
//                   <Wifi size={20} className="me-2" />
//                   <span>Secure Recovery Server (Port 8001)</span>
//                 </div>
//                 <small className="text-light opacity-75">
//                   {step === 4 ? "Transferring data to main app on port 8000..." : "Separate from main application for enhanced security"}
//                 </small>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }










// pages/RecoverAccount/RecoverAccountPage.jsx (SIMPLIFIED UI - ORIGINAL API INTACT)
import { useState, useEffect } from "react";
import { Mail, Key, ArrowLeft, CheckCircle, AlertCircle, Shield, Loader2, Phone, User, Search } from "lucide-react";
import Notification from "../components/Notification";
import "../styles/school-details.css";
import { useNavigate } from "react-router-dom";
import { importRecoveryData } from "../services/api.service";
import { Laptop, Monitor, Computer } from "lucide-react"; // Add to top imports
export default function RecoverAccountPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [schoolFound, setSchoolFound] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [transferStatus, setTransferStatus] = useState(null);
  const navigate = useNavigate();

  const RECOVERY_API_URL = "http://localhost:8001";
  const MAIN_APP_URL = "http://localhost:8000";
  const MAIN_APP_API_KEY = import.meta.env.VITE_MAIN_APP_API_KEY || "local-import-key";

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getAuthHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (!window.electron?.isElectron) {
      const apiKey = import.meta.env.VITE_RECOVERY_API_KEY;
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
    }
    return headers;
  };

  const handleApiResponse = async (response) => {
    if (response.status === 401) {
      return { success: false, error: 'AUTH_ERROR', message: 'Authentication failed. Please restart the application.' };
    }
    if (response.status === 429) {
      return { success: false, error: 'RATE_LIMITED', message: 'Too many recovery attempts. Please wait 1 hour before trying again.' };
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { success: false, error: 'API_ERROR', message: error.detail || `Server error: ${response.status}` };
    }
    return await response.json();
  };

  const checkSchoolExists = async () => {
    if (!email) {
      setNotification({ message: "Please enter your school email address.", type: "error" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotification({ message: "Please enter a valid email address.", type: "error" });
      return;
    }

    setLoading(true);
    setNotification({ message: "", type: "" });
    
    try {
      const response = await fetch(`${RECOVERY_API_URL}/check-school`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      const result = await handleApiResponse(response);
      
      if (result.error) {
        setNotification({ message: result.message, type: "error" });
        setSchoolFound(null);
      } else if (result.exists) {
        setSchoolFound(result.school);
        setNotification({ message: `School found: ${result.school.school_name}`, type: "success" });
        setStep(2);
      } else {
        setSchoolFound(null);
        setNotification({ message: result.message || "No school found with this email.", type: "warning" });
      }
    } catch (error) {
      console.error('Check school error:', error);
      setNotification({ message: "Error checking school. Please check your connection.", type: "error" });
      setSchoolFound(null);
    } finally {
      setLoading(false);
    }
  };

  const verifySchoolDetails = async () => {
    if (!schoolName || !contact) {
      setNotification({ message: "Please enter school name and contact number.", type: "error" });
      return;
    }

    setLoading(true);
    setNotification({ message: "", type: "" });
    
    try {
      const response = await fetch(`${RECOVERY_API_URL}/verify-recovery`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, school_name: schoolName, contact }),
      });
      const result = await handleApiResponse(response);
      
      if (result.error) {
        setNotification({ message: result.message, type: "error" });
      } else if (result.verified) {
        setVerificationData(result.data);
        setNotification({ message: result.message, type: "success" });
        setStep(3);
      } else {
        setNotification({ message: result.message || "Verification failed. Please check your details.", type: "error" });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setNotification({ message: "Verification failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const performRecovery = async () => {
    if (!confirmDeactivation) {
      setNotification({ message: "You must confirm device deactivation to proceed.", type: "error" });
      return;
    }

    setLoading(true);
    setNotification({ message: "", type: "" });
    
    try {
      const response = await fetch(`${RECOVERY_API_URL}/perform-recovery`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, school_name: schoolName, contact, confirm_deactivation: true }),
      });
      const result = await handleApiResponse(response);
      
      if (result.error) {
        setNotification({ message: result.message, type: "error" });
        setStep(2);
      } else if (result.success) {
        setRecoveryResult(result);
        setNotification({ message: "Recovery blob created successfully", type: "success" });
        setStep(4);
        await transferDataToMainApp(result.encrypted_blob);
      } else {
        setNotification({ message: result.message || "Recovery failed.", type: "error" });
        setStep(2);
      }
    } catch (error) {
      console.error('Recovery error:', error);
      setNotification({ message: "Recovery failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const transferDataToMainApp = async (encryptedBlob) => {
    setTransferStatus({ stage: "starting", message: "Starting data transfer...", progress: 0 });
    
    try {
      setTransferStatus({ stage: "checking", message: "Checking main application...", progress: 10 });
      const mainAppHealth = await checkMainAppStatus();
      
      if (!mainAppHealth.running) {
        setTransferStatus({ stage: "error", message: "Main application is not running.", progress: 0 });
        return;
      }
      
      setTransferStatus({ stage: "importing", message: "Importing recovered data...", progress: 30 });
      const importResult = await importToMainApp(encryptedBlob);
      
      if (importResult.success) {
        setTransferStatus({ stage: "complete", message: "Data transfer completed successfully!", progress: 100 });
        setTimeout(() => setStep(5), 2000);
      } else {
        setTransferStatus({ stage: "error", message: `Import failed: ${importResult.error || "Unknown error"}`, progress: 0 });
      }
    } catch (error) {
      setTransferStatus({ stage: "error", message: `Transfer failed: ${error.message}`, progress: 0 });
    }
  };

  const checkMainAppStatus = async () => {
    try {
      const response = await fetch(`${MAIN_APP_URL}/health/test`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000)
      });
      return { running: response.ok, status: response.status, message: response.ok ? "Main app is running" : `Main app returned ${response.status}` };
    } catch (error) {
      return { running: false, error: error.message };
    }
  };

  const importToMainApp = async (encryptedBlob) => {
    try {
      const result = await importRecoveryData(email, encryptedBlob);
      if (result.success) {
        return { success: true, data: result, error: null };
      } else {
        return { success: false, error: result.error || result.message || "Import failed" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleManualRedirect = () => {
    setTransferStatus({ stage: "manual", message: "Redirecting to main application...", progress: 100 });
    setTimeout(() => { window.location.href = "http://localhost:5173/"; }, 500);
  };

  const startNewRegistration = () => navigate("/school-details");
  const goBack = () => step > 1 ? setStep(step - 1) : navigate(-1);

  if (!isOnline) {
    return (
      <div className="app app-login p-0">
        <div className="row g-0 app-auth-wrapper">
          <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
            <div className="app-auth-body mx-auto">
              <div className="text-center mb-4">
                <AlertCircle size={64} className="text-danger mb-3" />
                <h3 className="auth-heading text-center mb-3">Internet Required</h3>
                <p className="text-muted">You need an active internet connection to recover your school account.</p>
                <button className="btn btn-outline-primary mt-3" onClick={() => navigate(-1)}>
                  <ArrowLeft size={16} className="me-2" /> Go Back
                </button>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
            <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
              <h2 className="fw-bold mb-3 text-light">Account Recovery</h2>
              <p className="lead text-light">School data recovery requires internet connection.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app app-login p-0">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />

      <div className="row g-0 app-auth-wrapper">
        {/* Left Side - Simplified UI */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col p-4">
          <div className="app-auth-body mx-auto" style={{ maxWidth: '420px' }}>
            {step > 1 && step < 5 && (
              <button className="btn btn-outline-secondary btn-sm mb-3" onClick={goBack}>
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {/* Step 1 - Email */}
            {step === 1 && (
              <div className="text-center">
                <Shield size={48} className="text-primary mb-3" />
                <h3 className="mb-4">Recover Account</h3>
                <div className="input-group mb-3">
                  <span className="input-group-text"><Mail size={16} /></span>
                  <input type="email" className="form-control" placeholder="School email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button className="btn btn-primary w-100 mb-2" onClick={checkSchoolExists} disabled={!email || loading}>
                  {loading ? <Loader2 size={18} className="spin" /> : "Find School"}
                </button>
                <button className="btn btn-link btn-sm" onClick={startNewRegistration}>New registration?</button>
              </div>
            )}

            {/* Step 2 - Verify Details */}
            {step === 2 && schoolFound && (
              <div>
                <div className="alert alert-success mb-3 py-2">
                  <CheckCircle size={14} className="me-1" /> {schoolFound.school_name}
                </div>
                <div className="input-group mb-2">
                  <span className="input-group-text"><User size={14} /></span>
                  <input type="text" className="form-control" placeholder="School name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text"><Phone size={14} /></span>
                  <input type="tel" className="form-control" placeholder="Contact number" value={contact} onChange={(e) => setContact(e.target.value)} />
                </div>
                <button className="btn btn-primary w-100" onClick={verifySchoolDetails} disabled={!schoolName || !contact || loading}>
                  {loading ? <Loader2 size={18} className="spin" /> : "Verify"}
                </button>
              </div>
            )}

            {/* Step 3 - Confirm */}
           

{step === 3 && (
  <div>
    {/* <div className="alert alert-warning mb-3">
      <AlertCircle size={14} className="me-1" /> Device will be deactivated
    </div> */}
    
    {/* Device Info Display */}
    <div className="card bg-light mb-3 border-0">
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Computer size={24} className="text-primary" />
          </div>
          <div className="flex-grow-1">
            <div className="small text-muted">Current Device</div>
            <div className="fw-bold">
              {navigator.userAgent.includes('Win') ? 'Windows PC' : 
               navigator.userAgent.includes('Mac') ? 'Mac Computer' : 
               navigator.userAgent.includes('Linux') ? 'Linux PC' : 'Computer'}
            </div>
            <div className="small text-muted">Will be deactivated after recovery</div>
          </div>
          <AlertCircle size={16} className="text-warning" />
        </div>
      </div>
    </div>
    
    <div className="form-check mb-3">
      <input className="form-check-input" type="checkbox" id="confirm" checked={confirmDeactivation} onChange={(e) => setConfirmDeactivation(e.target.checked)} />
      <label className="form-check-label" htmlFor="confirm">I understand and confirm</label>
    </div>
    
    <button className="btn btn-success w-100" onClick={performRecovery} disabled={!confirmDeactivation || loading}>
      {loading ? <Loader2 size={18} className="spin" /> : "Complete Recovery"}
    </button>
  </div>
)}
            {/* Step 4 - Transfer */}
            {step === 4 && transferStatus && (
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" />
                <p className="mb-2">{transferStatus.message}</p>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar" style={{ width: `${transferStatus.progress}%` }} />
                </div>
                {transferStatus.stage === "error" && (
                  <div className="mt-3">
                    <button className="btn btn-sm btn-outline-danger me-2" onClick={() => window.location.reload()}>Retry</button>
                    <button className="btn btn-sm btn-warning" onClick={handleManualRedirect}>Continue Anyway</button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 - Success */}
            {step === 5 && (
              <div className="text-center">
                <CheckCircle size={64} className="text-success mb-3" />
                <h4>Recovery Complete!</h4>
                <p className="text-muted mb-3">Your school account has been recovered.</p>
                <button className="btn btn-primary" onClick={handleManualRedirect}>Continue</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Minimal Visual */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
          <div className="text-center p-4">
            <Shield size={64} className="mb-3 opacity-75" />
            <h3>Secure Recovery</h3>
            <div className="mt-4">
              {[
                { num: 1, label: "Find School", active: step >= 1 },
                { num: 2, label: "Verify", active: step >= 2 },
                { num: 3, label: "Recover", active: step >= 3 }
              ].map((item) => (
                <div key={item.num} className={`d-flex align-items-center gap-3 mb-3 ${item.active ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="bg-white rounded-circle p-2 text-dark fw-bold" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step > item.num ? '✓' : item.num}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}