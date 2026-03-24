
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import PrivateRoute from "./components/PrivateRoute";
// import ActivationStatus from "./pages/Activation/ActivationStatus";
// import ActivationPage from "./pages/Activation/ActivationPage";
// import SchoolAndAdminSetupPage from "./SchoolDetails/SchoolDetailsPage";
// import AdminDetailsPage from "./SchoolDetails/AdminDetailsPage";
// import SchoolLogin from "./pages/Login/SchoolLogin";
// import Dashboard from "./pages/Dashboard/Dashboard";
// import Students from "./pages/Students/Students";
// import Staff from "./pages/Staff/Staff";
// import Settings from "./pages/Settings/Settings";
// import MiniSettingsPage from "./pages/Settings/MiniSettingsPage";
// import RecoverAccountPage from "./SchoolDetails/RecoverAccountPage";
// import 'bootstrap/dist/css/bootstrap.min.css';

// // Import API services
// import { 
//   checkActivationStatus, 
//   getDatabaseStatus,
//   isElectron 
// } from "./services/api.service";

// // Mini Settings Service
// import { miniSettingsService } from "./services/miniSettingsService";

// function AppRoutes() {
//   const [activated, setActivated] = useState(false);
//   const [setupStatus, setSetupStatus] = useState(null);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [checkingStatus, setCheckingStatus] = useState(true);
//   const [hasSeenMiniSettings, setHasSeenMiniSettings] = useState(false);
//   const [checkingMiniSettings, setCheckingMiniSettings] = useState(true);

//   useEffect(() => {
//     checkStatus();
//     checkMiniSettingsStatus();

//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // -----------------------
//   // MINI SETTINGS
//   // -----------------------
//   const checkMiniSettingsStatus = async () => {
//     try {
//       const hasSeen = await miniSettingsService.hasSeenMiniSettings();
//       setHasSeenMiniSettings(hasSeen);
//     } catch (error) {
//       console.error("Failed to check mini settings from JSON, falling back to localStorage:", error);
//       const seenSettings = localStorage.getItem("hasSeenMiniSettings");
//       setHasSeenMiniSettings(seenSettings === "true");
//     } finally {
//       setCheckingMiniSettings(false);
//     }
//   };

//   const handleMiniSettingsComplete = async () => {
//     try {
//       await miniSettingsService.setSeenMiniSettings();
//       setHasSeenMiniSettings(true);
//     } catch (error) {
//       console.error("Failed to save mini settings to JSON, falling back to localStorage:", error);
//       localStorage.setItem("hasSeenMiniSettings", "true");
//       setHasSeenMiniSettings(true);
//     }
//   };

//   // -----------------------
//   // ACTIVATION STATUS - IMPROVED
//   // -----------------------
// //   const checkStatus = async () => {
// //     try {
// //       console.log('🔍 Checking activation status...');
      
// //       // Use the API service to check activation
// //       const isActivated = await checkActivationStatus();
// //       console.log('✅ Activation status:', isActivated);
// //       setActivated(isActivated.activated);

// //       // ALWAYS check database status, even if activated
// //       // This ensures we have the latest setup status
// //       try {
// //         console.log('🔍 Checking database status...');
// //         const dbStatus = await getDatabaseStatus();
        
// //         console.log('✅ Database status:', dbStatus);
        
// //      const newSetupStatus = {
// //   school_completed: dbStatus?.school_completed || false,
// //   admin_completed: dbStatus?.admin_completed || false,
// //   activation_completed: isActivated.activated,
// // };
        
// //         console.log('📊 Setting setup status to:', newSetupStatus);
// //         setSetupStatus(newSetupStatus);
        
// //       } catch (dbError) {
// //         console.error('❌ Failed to get database status:', dbError);
// //         // Fallback to default values
// //         setSetupStatus({
// //           school_completed: false,
// //           admin_completed: false,
// //           activation_completed: isActivated,
// //         });
// //       }
// //     } catch (error) {
// //       console.error("❌ Failed to check status via IPC:", error);
      
// //       // In browser mode, set defaults
// //       if (!isElectron()) {
// //         console.log('🌐 Browser mode: using default setup status');
// //         setSetupStatus({
// //           school_completed: false,
// //           admin_completed: false,
// //           activation_completed: false,
// //         });
// //       }
// //     } finally {
// //       setCheckingStatus(false);
// //     }
// //   };

// const checkStatus = async () => {
//   try {
//     console.log('🔍 Checking activation status...');
    
//     // Use the API service to check activation
//     const isActivated = await checkActivationStatus();
//     console.log('✅ Activation status:', isActivated);
//     setActivated(isActivated.activated);

//     // ALWAYS check database status, even if activated
//     // This ensures we have the latest setup status
//     try {
//       console.log('🔍 Checking database status...');
//       const dbStatus = await getDatabaseStatus();
      
//       console.log('✅ Database status:', dbStatus);
      
//       // Extract the status from the response
//       // Handle different response structures
//       let statusData = dbStatus;
      
//       // If the response has a 'result' wrapper (IPC format)
//       if (dbStatus?.result) {
//         statusData = dbStatus.result;
//       }
      
//       // If the response has a 'status' object (some APIs)
//       if (dbStatus?.status) {
//         statusData = dbStatus.status;
//       }
      
//       const newSetupStatus = {
//         school_completed: statusData?.school_completed || false,
//         admin_completed: statusData?.admin_completed || false,
//         activation_completed: isActivated?.activated || false,
//         current_step: statusData?.current_step || 'school',
//         requires_internet: statusData?.requires_internet || true
//       };
      
//       console.log('📊 Setting setup status to:', newSetupStatus);
//       setSetupStatus(newSetupStatus);
      
//       // Log the current step for debugging
//       console.log(`📍 Current step: ${newSetupStatus.current_step}`);
      
//     } catch (dbError) {
//       console.error('❌ Failed to get database status:', dbError);
//       // Fallback to default values
//       setSetupStatus({
//         school_completed: false,
//         admin_completed: false,
//         activation_completed: isActivated?.activated || false,
//         current_step: 'school',
//         requires_internet: true
//       });
//     }
//   } catch (error) {
//     console.error("❌ Failed to check status via IPC:", error);
    
//     // In browser mode, set defaults
//     if (!isElectron()) {
//       console.log('🌐 Browser mode: using default setup status');
//       setSetupStatus({
//         school_completed: false,
//         admin_completed: false,
//         activation_completed: false,
//         current_step: 'school',
//         requires_internet: true
//       });
//     }
//   } finally {
//     setCheckingStatus(false);
//   }
// };

//   // -----------------------
//   // LOADING STATE
//   // -----------------------
//   if (checkingStatus || checkingMiniSettings) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <div className="text-center">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           {!isElectron() && (
//             <p className="mt-3 text-muted">Browser mode - some features may be limited</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // -----------------------
//   // SETUP FLOW
//   // -----------------------
//   if (!activated) {
//     return (
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <SetupFlow 
//               setupStatus={setupStatus}
//               isOnline={isOnline}
//               onActivated={() => {
//                 setActivated(true);
//                 // Refresh mini settings check after activation
//                 const checkMini = async () => {
//                   const hasSeen = await miniSettingsService.hasSeenMiniSettings();
//                   if (!hasSeen) setHasSeenMiniSettings(false);
//                 };
//                 checkMini();
//               }}
//               onStatusUpdate={checkStatus}
//             />
//           }
//         />
//         <Route path="/status" element={<ActivationStatus />} />
//         <Route path="/recover-account" element={<RecoverAccountPage />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     );
//   }

//   const showMiniSettings = activated && !hasSeenMiniSettings;

//   // -----------------------
//   // POST-ACTIVATION ROUTES
//   // -----------------------
//   return (
//     <Routes>
//       {showMiniSettings ? (
//         <Route path="/" element={<MiniSettingsPage onComplete={handleMiniSettingsComplete} />} />
//       ) : (
//         <Route path="/" element={<SchoolLogin />} />
//       )}

//       <Route path="/home" element={<SchoolLogin />} />

//       <Route
//         path="/dashboard"
//         element={
//           <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
//             <Dashboard />
//           </PrivateRoute>
//         }
//       />

//       <Route
//         path="/students"
//         element={
//           <PrivateRoute roles={["STUDENT", "STAFF", "ADMIN", "SUPER_ADMIN"]}>
//             <Students />
//           </PrivateRoute>
//         }
//       />

//       <Route
//         path="/staff"
//         element={
//           <PrivateRoute roles={["STAFF", "ADMIN", "SUPER_ADMIN"]}>
//             <Staff />
//           </PrivateRoute>
//         }
//       />

//       <Route
//         path="/settings"
//         element={
//           <PrivateRoute roles={["SUPER_ADMIN"]}>
//             <Settings />
//           </PrivateRoute>
//         }
//       />

//       <Route path="*" element={<Navigate to={showMiniSettings ? "/" : "/home"} replace />} />
//     </Routes>
//   );
// }





// src/routes/index.jsx (or AppRoutes.jsx)
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layouts/MainLayout";
import ActivationStatus from "./pages/Activation/ActivationStatus";
import ActivationPage from "./pages/Activation/ActivationPage";
import SchoolAndAdminSetupPage from "./SchoolDetails/SchoolDetailsPage";
import AdminDetailsPage from "./SchoolDetails/AdminDetailsPage";
import SchoolLogin from "./pages/Login/SchoolLogin";
import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import Staff from "./pages/Staff/Staff";
import Settings from "./pages/Settings/Settings";
import MiniSettingsPage from "./pages/Settings/MiniSettingsPage";
import RecoverAccountPage from "./SchoolDetails/RecoverAccountPage";
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your new pages
import ViewTeachers from "./pages/Adminpages/View/ViewTeachers";
import ViewStudent from "./pages/Adminpages/View/ViewStudents"  
// import ViewStudents from "../pages/View/ViewStudents";
// import ScheduleSemester from "../pages/Schedule/Semester";
// import RegistrationTeachers from "../pages/Registration/Teachers";
// import MiscellaneousNotifications from "../pages/Miscellaneous/Notifications";
// import StatisticsStaff from "../pages/Statistics/Staff";
// import Account from "../pages/Account/Account";
// import Help from "../pages/Help/Help";

// Import API services
import { 
  checkActivationStatus, 
  getDatabaseStatus,
  isElectron 
} from "./services/api.service";

import { miniSettingsService } from "./services/miniSettingsService";

function AppRoutes() {
  const [activated, setActivated] = useState(false);
  const [setupStatus, setSetupStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasSeenMiniSettings, setHasSeenMiniSettings] = useState(false);
  const [checkingMiniSettings, setCheckingMiniSettings] = useState(true);

  useEffect(() => {
    checkStatus();
    checkMiniSettingsStatus();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkMiniSettingsStatus = async () => {
    try {
      const hasSeen = await miniSettingsService.hasSeenMiniSettings();
      setHasSeenMiniSettings(hasSeen);
    } catch (error) {
      console.error("Failed to check mini settings:", error);
      const seenSettings = localStorage.getItem("hasSeenMiniSettings");
      setHasSeenMiniSettings(seenSettings === "true");
    } finally {
      setCheckingMiniSettings(false);
    }
  };

  const handleMiniSettingsComplete = async () => {
    try {
      await miniSettingsService.setSeenMiniSettings();
      setHasSeenMiniSettings(true);
    } catch (error) {
      console.error("Failed to save mini settings:", error);
      localStorage.setItem("hasSeenMiniSettings", "true");
      setHasSeenMiniSettings(true);
    }
  };

  const checkStatus = async () => {
    try {
      console.log('🔍 Checking activation status...');
      const isActivated = await checkActivationStatus();
      console.log('✅ Activation status:', isActivated);
      setActivated(isActivated.activated);

      try {
        console.log('🔍 Checking database status...');
        const dbStatus = await getDatabaseStatus();
        console.log('✅ Database status:', dbStatus);
        
        let statusData = dbStatus;
        
        if (dbStatus?.result) {
          statusData = dbStatus.result;
        }
        
        if (dbStatus?.status) {
          statusData = dbStatus.status;
        }
        
        const newSetupStatus = {
          school_completed: statusData?.school_completed || false,
          admin_completed: statusData?.admin_completed || false,
          activation_completed: isActivated?.activated || false,
          current_step: statusData?.current_step || 'school',
          requires_internet: statusData?.requires_internet || true
        };
        
        console.log('📊 Setting setup status to:', newSetupStatus);
        setSetupStatus(newSetupStatus);
        
      } catch (dbError) {
        console.error('❌ Failed to get database status:', dbError);
        setSetupStatus({
          school_completed: false,
          admin_completed: false,
          activation_completed: isActivated?.activated || false,
          current_step: 'school',
          requires_internet: true
        });
      }
    } catch (error) {
      console.error("❌ Failed to check status:", error);
      
      if (!isElectron()) {
        console.log('🌐 Browser mode: using default setup status');
        setSetupStatus({
          school_completed: false,
          admin_completed: false,
          activation_completed: false,
          current_step: 'school',
          requires_internet: true
        });
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  if (checkingStatus || checkingMiniSettings) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {!isElectron() && (
            <p className="mt-3 text-muted">Browser mode - some features may be limited</p>
          )}
        </div>
      </div>
    );
  }

  if (!activated) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <SetupFlow 
              setupStatus={setupStatus}
              isOnline={isOnline}
              onActivated={() => {
                setActivated(true);
                const checkMini = async () => {
                  const hasSeen = await miniSettingsService.hasSeenMiniSettings();
                  if (!hasSeen) setHasSeenMiniSettings(false);
                };
                checkMini();
              }}
              onStatusUpdate={checkStatus}
            />
          }
        />
        <Route path="/status" element={<ActivationStatus />} />
        <Route path="/recover-account" element={<RecoverAccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const showMiniSettings = activated && !hasSeenMiniSettings;

  // PROTECTED ROUTES WITH MAINLAYOUT
  return (
    <Routes>
      {showMiniSettings ? (
        <Route path="/" element={<MiniSettingsPage onComplete={handleMiniSettingsComplete} />} />
      ) : (
        <Route path="/" element={<SchoolLogin />} />
      )}

      <Route path="/home" element={<SchoolLogin />} />

      {/* Dashboard Routes with MainLayout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Students Routes */}
      <Route
        path="/students"
        element={
          <PrivateRoute roles={["STUDENT", "STAFF", "ADMIN", "SUPER_ADMIN"]}>
            <MainLayout>
              {/* <Students /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <PrivateRoute roles={["STAFF", "ADMIN", "SUPER_ADMIN"]}>
            <MainLayout>
              {/* <Staff /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Settings Routes */}
      <Route
        path="/settings"
        element={
          <PrivateRoute roles={["SUPER_ADMIN"]}>
            <MainLayout>
              {/* <Settings /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* View Section Routes */}
      <Route
        path="/view/teachers"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              <ViewTeachers />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/view/students"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              {/* <ViewStudents /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Schedule Section Routes */}
      <Route
        path="/schedule/semester"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              {/* <ScheduleSemester /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Registration Section Routes */}
      <Route
        path="/registration/teachers"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              {/* <RegistrationTeachers /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Miscellaneous Routes */}
      <Route
        path="/miscellaneous/notifications"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN", "STAFF"]}>
            <MainLayout>
              {/* <MiscellaneousNotifications /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Statistics Routes */}
      <Route
        path="/statistics/staff"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              {/* <StatisticsStaff /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Account Routes */}
      <Route
        path="/account"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN", "STAFF", "STUDENT"]}>
            <MainLayout>
              {/* <Account /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Help Routes */}
      <Route
        path="/help"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN", "STAFF", "STUDENT"]}>
            <MainLayout>
              {/* <Help /> */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to={showMiniSettings ? "/" : "/home"} replace />} />
    </Routes>
  );
}


// -----------------------
// SETUP FLOW COMPONENT - FIXED VERSION
// -----------------------
function SetupFlow({ setupStatus, isOnline, onActivated, onStatusUpdate }) {
  const [currentStep, setCurrentStep] = useState("checking");
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState(null);

  // Log setupStatus changes for debugging
  useEffect(() => {
    console.log('🔄 SetupFlow received setupStatus:', setupStatus);
  }, [setupStatus]);

  // Determine current step based on setupStatus
  useEffect(() => {
    // Only update step if we're not in the middle of a navigation
    if (!isNavigating && setupStatus) {
      console.log('🔄 SetupFlow useEffect - setupStatus:', setupStatus);
      console.log('🔄 SetupFlow useEffect - isOnline:', isOnline);
      
      if (!isOnline) {
        console.log('📱 Device is offline');
        setCurrentStep("offline");
      } else if (!setupStatus.school_completed) {
        console.log('🏫 School not completed, showing school step');
        setCurrentStep("school");
      } else if (!setupStatus.admin_completed) {
        console.log('👤 Admin not completed, showing admin step');
        setCurrentStep("admin");
      } else if (!setupStatus.activation_completed) {
        console.log('🔑 Activation not completed, showing activation step');
        setCurrentStep("activation");
      } else {
        console.log('✅ All steps completed');
        setCurrentStep("completed");
      }
    }
  }, [setupStatus, isOnline, isNavigating]);

  const handleSchoolSuccess = async () => {
    console.log('🎉 School completed successfully');
    setIsNavigating(true);
    setError(null);
    
    try {
      // Call status update and wait for it
      console.log('🔄 Refreshing status after school completion...');
      await onStatusUpdate();
      console.log('✅ Status refreshed, moving to admin step');
      
      // Manually set to admin step
      setCurrentStep("admin");
    } catch (err) {
      console.error('❌ Error after school completion:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleAdminSuccess = async () => {
    console.log('🎉 Admin completed successfully');
    setIsNavigating(true);
    setError(null);
    
    try {
      // Call status update and wait for it
      console.log('🔄 Refreshing status after admin completion...');
      await onStatusUpdate();
      console.log('✅ Status refreshed, moving to activation step');
      
      // Manually set to activation step
      setCurrentStep("activation");
    } catch (err) {
      console.error('❌ Error after admin completion:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleActivationSuccess = async () => {
    console.log('🎉 Activation completed successfully');
    setIsNavigating(true);
    setError(null);
    
    try {
      await onActivated();
      console.log('✅ Activation processed, redirecting...');
      // Let the main AppRoutes handle the redirect
    } catch (err) {
      console.error('❌ Error during activation:', err);
      setError('Failed to process activation. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBack = (fromStep) => {
    console.log(`⬅️ Going back from ${fromStep}`);
    if (fromStep === 'admin') {
      setCurrentStep('school');
    } else if (fromStep === 'activation') {
      setCurrentStep('admin');
    }
  };

  // Show error if any
  if (error) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <h3 className="mb-3 text-danger">Error</h3>
            <p className="text-muted mb-4">{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setError(null);
                onStatusUpdate();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "offline") {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <h3 className="mb-3 text-danger">Internet Required</h3>
            <p className="text-muted">
              Please connect to the internet to complete the setup process.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "checking") {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Checking setup status...</p>
        </div>
      </div>
    );
  }

  // Show loading during navigation
  if (isNavigating) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Loading next step...</p>
        </div>
      </div>
    );
  }

  switch (currentStep) {
    case "school":
      console.log('🏫 Rendering SchoolAndAdminSetupPage');
      return (
        <SchoolAndAdminSetupPage 
          onSuccess={handleSchoolSuccess} 
          isOnline={isOnline} 
        />
      );
    
    case "admin":
      console.log('👤 Rendering AdminDetailsPage');
      return (
        <AdminDetailsPage 
          onSuccess={handleAdminSuccess} 
          onBack={() => handleBack('admin')} 
          isOnline={isOnline} 
        />
      );
    
    case "activation":
      console.log('🔑 Rendering ActivationPage');
      return (
        <ActivationPage 
          onActivated={handleActivationSuccess} 
          onBack={() => handleBack('activation')} 
          isOnline={isOnline} 
        />
      );
    
    case "completed":
      console.log('✅ Setup completed, redirecting...');
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p>Setup complete! Redirecting...</p>
          </div>
        </div>
      );
    
    default:
      console.log('❌ Unknown step:', currentStep);
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <p className="text-danger">Setup error occurred. Please refresh the page.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
  }
}

export default AppRoutes;