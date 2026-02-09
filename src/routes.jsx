
// electron support
// AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute";
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

// IPC Services
// import stateIPC from "./ipc/state.ipc";
// import activationIPC from "./ipc/activation.ipc";

// Mini Settings Service
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

  // -----------------------
  // MINI SETTINGS
  // -----------------------
  const checkMiniSettingsStatus = async () => {
    try {
      const hasSeen = await miniSettingsService.hasSeenMiniSettings();
      setHasSeenMiniSettings(hasSeen);
    } catch (error) {
      console.error("Failed to check mini settings from JSON, falling back to localStorage:", error);
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
      console.error("Failed to save mini settings to JSON, falling back to localStorage:", error);
      localStorage.setItem("hasSeenMiniSettings", "true");
      setHasSeenMiniSettings(true);
    }
  };

  // -----------------------
  // ACTIVATION STATUS
  // -----------------------
  const checkStatus = async () => {
    try {
      const status = await stateIPC.getActivationStatus();
      setActivated(status.activated);

      if (!status.activated) {
        // Setup status can be fetched from your Python backend if needed
        setSetupStatus({
          school_completed: !!status.school_name, // Example
          admin_completed: false,
          activation_completed: status.activated,
        });
      }
    } catch (error) {
      console.error("Failed to check status via IPC:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // -----------------------
  // LOADING STATE
  // -----------------------
  if (checkingStatus || checkingMiniSettings) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // -----------------------
  // SETUP FLOW
  // -----------------------
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

  // -----------------------
  // POST-ACTIVATION ROUTES
  // -----------------------
  return (
    <Routes>
      {showMiniSettings ? (
        <Route path="/" element={<MiniSettingsPage onComplete={handleMiniSettingsComplete} />} />
      ) : (
        <Route path="/" element={<SchoolLogin />} />
      )}

      <Route path="/home" element={<SchoolLogin />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/students"
        element={
          <PrivateRoute roles={["STUDENT", "STAFF", "ADMIN", "SUPER_ADMIN"]}>
            <Students />
          </PrivateRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <PrivateRoute roles={["STAFF", "ADMIN", "SUPER_ADMIN"]}>
            <Staff />
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute roles={["SUPER_ADMIN"]}>
            <Settings />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to={showMiniSettings ? "/" : "/home"} replace />} />
    </Routes>
  );
}

// -----------------------
// SETUP FLOW COMPONENT
// -----------------------
function SetupFlow({ setupStatus, isOnline, onActivated, onStatusUpdate }) {
  const [currentStep, setCurrentStep] = useState("checking");

  useEffect(() => {
    if (setupStatus) {
      if (!isOnline) setCurrentStep("offline");
      else if (!setupStatus.school_completed) setCurrentStep("school");
      else if (!setupStatus.admin_completed) setCurrentStep("admin");
      else if (!setupStatus.activation_completed) setCurrentStep("activation");
      else setCurrentStep("completed");
    }
  }, [setupStatus, isOnline]);

  if (currentStep === "offline") {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <h3 className="mb-3 text-danger">Internet Required</h3>
            <p className="text-muted">
              Please connect to the internet to complete the setup process.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
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

  switch (currentStep) {
    case "school":
      return <SchoolAndAdminSetupPage onSuccess={() => { onStatusUpdate(); setCurrentStep("admin"); }} isOnline={isOnline} />;
    case "admin":
      return <AdminDetailsPage onSuccess={() => { onStatusUpdate(); setCurrentStep("activation"); }} onBack={() => setCurrentStep("school")} isOnline={isOnline} />;
    case "activation":
      return <ActivationPage onActivated={onActivated} onBack={() => setCurrentStep("admin")} isOnline={isOnline} />;
    case "completed":
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p>Redirecting...</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <p className="text-danger">Setup error occurred. Please refresh the page.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      );
  }
}

export default AppRoutes;
