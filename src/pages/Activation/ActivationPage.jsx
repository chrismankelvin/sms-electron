

// // # online startup version# online startup version# online startup version# online startup version

// // # online startup version# online startup version# online startup version# online startup version

// // # online startup version# online startup version# online startup version# online startup version

// // # online startup version# online startup version# online startup version# online startup version



// import { useState, useEffect } from "react";
// import { 
//   Key, 
//   Copy, 
//   Mail, 
//   ArrowLeft, 
//   CheckCircle, 
//   Fingerprint,
//   Send,
//   Info
// } from "lucide-react";
// import Notification from "../../components/Notification";
// import PageHelper from "../../components/PageHelper";

// export default function ActivationPage({ onActivated, onBack, isOnline }) {
//   const [activationCode, setActivationCode] = useState("");
//   const [schoolName, setSchoolName] = useState("");
//   const [machineId, setMachineId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [showHelper, setShowHelper] = useState(false);
//   const [helperContent, setHelperContent] = useState({ title: "", children: null });

//   // Get machine fingerprint on component mount
//   useEffect(() => {
//     fetchMachineFingerprint();
//   }, []);

//   const fetchMachineFingerprint = async () => {
//     try {
//       const response = await fetch("http://localhost:8000/activation/machine-id");
//       const data = await response.json();
//       setMachineId(data.machine_fingerprint);
//     } catch (error) {
//       console.error("Failed to get machine ID:", error);
//     }
//   };

//   const handleActivate = async (e) => {
//     e.preventDefault();
    
//     if (!activationCode.trim()) {
//       setNotification({ message: "Please enter activation code", type: "error" });
//       return;
//     }

//     if (!schoolName.trim()) {
//       setNotification({ message: "Please enter school name", type: "error" });
//       return;
//     }

//     setLoading(true);
//     setNotification({ message: "", type: "" });
    
//     try {
//       const response = await fetch("http://localhost:8000/activation/activate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           code: activationCode,
//           school_name: schoolName 
//         }),
//       });

//       const result = await response.json();
      
//       if (!response.ok) {
//         throw new Error(result.detail || "Failed to activate system");
//       }

//       if (result.success) {
//         setNotification({
//           message: result.message,
//           type: "success"
//         });
        
//         setTimeout(() => {
//           onActivated();
//         }, result.already_activated ? 500 : 2000);
        
//       } else {
//         setNotification({
//           message: result.message || "Activation failed",
//           type: "error"
//         });
//       }
//     } catch (error) {
//       setNotification({
//         message: error.message || "Failed to connect to server",
//         type: "error"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = (text) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text).then(() => {
//       setNotification({ message: "Copied to clipboard!", type: "success" });
//     });
//   };

//   const showRequestInfo = () => {
//     setHelperContent({
//       title: "How to Request Activation Code",
//       children: (
//         <div>
//           <p><strong>Send this information to your vendor:</strong></p>
//           <div className="card bg-light mb-3">
//             <div className="card-body">
//               <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
// {`School Name: ${schoolName || "Your School Name"}
// Machine Fingerprint: ${machineId || "Loading..."}

// Please generate an activation code for this machine.`}
//               </pre>
//             </div>
//           </div>
//           <p className="mb-2"><strong>Contact Information:</strong></p>
//           <ul className="mb-0">
//             <li>Email: support@yourschoolsoftware.com</li>
//             <li>Phone: +1234567890</li>
//             <li>WhatsApp: +1234567890</li>
//           </ul>
//         </div>
//       )
//     });
//     setShowHelper(true);
//   };

//   const showActivationInfo = () => {
//     setHelperContent({
//       title: "About Activation",
//       children: (
//         <div>
//           <p><strong>This activation is machine-specific:</strong></p>
//           <ul>
//             <li>Each computer needs its own activation code</li>
//             <li>Works offline after activation</li>
//             <li>No subscriptions - one-time purchase</li>
//             <li>Contact vendor for multiple licenses</li>
//           </ul>
//           <p className="mb-0"><small>The activation code binds your license to this specific computer.</small></p>
//         </div>
//       )
//     });
//     setShowHelper(true);
//   };

//   return (
//     <div className="app app-login p-0">
//       <Notification
//         message={notification.message}
//         type={notification.type}
//         onClose={() => setNotification({ message: "", type: "" })}
//       />

//       <PageHelper 
//         open={showHelper}
//         title={helperContent.title}
//         onClose={() => setShowHelper(false)}
//       >
//         {helperContent.children}
//       </PageHelper>

//       <div className="row g-0 app-auth-wrapper">
//         {/* Left Side - Form */}
//         <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
//           <div className="app-auth-body mx-auto">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <button 
//                 className="btn btn-outline-secondary btn-sm"
//                 onClick={onBack}
//                 disabled={loading}
//               >
//                 <ArrowLeft size={16} className="me-1" />
//                 Back
//               </button>
//               <h2 className="auth-heading text-center mb-0">Activation</h2>
//               <button 
//                 className="btn btn-outline-info btn-sm"
//                 onClick={showActivationInfo}
//               >
//                 <Info size={16} />
//               </button>
//             </div>

//             {/* School Name */}
//             <div className="mb-4">
//               <label className="form-label">School Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Enter your school name"
//                 value={schoolName}
//                 onChange={(e) => setSchoolName(e.target.value)}
//                 disabled={loading}
//                 required
//               />
//             </div>

//             {/* Machine Fingerprint */}
//             <div className="mb-4">
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <label className="form-label mb-0">Machine Fingerprint</label>
//                 <button 
//                   type="button"
//                   className="btn btn-link btn-sm p-0"
//                   onClick={showRequestInfo}
//                 >
//                   <Send size={14} className="me-1" />
//                   How to request code
//                 </button>
//               </div>
//               <div className="input-group">
//                 <span className="input-group-text">
//                   <Fingerprint size={16} />
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control font-monospace"
//                   value={machineId || "Loading..."}
//                   readOnly
//                   disabled
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-outline-secondary"
//                   onClick={() => copyToClipboard(machineId)}
//                   disabled={!machineId}
//                 >
//                   <Copy size={16} />
//                 </button>
//               </div>
//               <div className="form-text">
//                 Share this with vendor to get activation code
//               </div>
//             </div>

//             {/* Activation Code */}
//             <div className="mb-4">
//               <label className="form-label">Activation Code</label>
//               <div className="input-group">
//                 <span className="input-group-text">
//                   <Key size={16} />
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control text-uppercase"
//                   placeholder="Enter code from vendor"
//                   value={activationCode}
//                   onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
//                   disabled={loading}
//                   required
//                   maxLength="12"
//                 />
//               </div>
//             </div>

//             {/* Activate Button */}
//             <button 
//               type="button"
//               className="btn btn-primary btn-lg w-100 mb-3"
//               onClick={handleActivate}
//               disabled={loading || !activationCode.trim() || !schoolName.trim()}
//             >
//               {loading ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-2"></span>
//                   Activating...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle size={20} className="me-2" />
//                   Activate System
//                 </>
//               )}
//             </button>

//             {/* Quick Info */}
//             <div className="alert alert-light border">
//               <div className="d-flex">
//                 <Info size={16} className="me-2 flex-shrink-0 mt-1" />
//                 <div>
//                   <small>
//                     Need help? <button 
//                       type="button" 
//                       className="btn btn-link btn-sm p-0"
//                       onClick={showRequestInfo}
//                     >
//                       Click here for contact information
//                     </button>
//                   </small>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Visual */}
//         <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
//           <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//             <div className="mb-4">
//               <Fingerprint size={64} className="mb-3" />
//               <h2 className="fw-bold text-light">Machine Activation</h2>
//               <p className="lead text-light">
//                 License bound to this computer
//               </p>
//             </div>
            
//             <div className="text-start">
//               <div className="d-flex align-items-start mb-3">
//                 <div className="bg-primary rounded-circle p-2 me-3">
//                   <span className="text-light">1</span>
//                 </div>
//                 <div>
//                   <h5 className="text-light mb-1">Request Code</h5>
//                   <p className="small text-light opacity-75 mb-0">
//                     Share school name and machine ID with vendor
//                   </p>
//                 </div>
//               </div>

//               <div className="d-flex align-items-start mb-3">
//                 <div className="bg-warning rounded-circle p-2 me-3">
//                   <span className="text-light">2</span>
//                 </div>
//                 <div>
//                   <h5 className="text-light mb-1">Receive Code</h5>
//                   <p className="small text-light opacity-75 mb-0">
//                     Vendor sends unique activation code
//                   </p>
//                 </div>
//               </div>

//               <div className="d-flex align-items-start">
//                 <div className="bg-success rounded-circle p-2 me-3">
//                   <span className="text-light">3</span>
//                 </div>
//                 <div>
//                   <h5 className="text-light mb-1">Enter & Activate</h5>
//                   <p className="small text-light opacity-75 mb-0">
//                     Enter code to unlock the system
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// # online startup version# online startup version# online startup version# online startup version

import { useState, useEffect } from "react";
import { 
  Key, 
  Copy, 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  Fingerprint,
  Send,
  Info
} from "lucide-react";
import Notification from "../../components/Notification";
import PageHelper from "../../components/PageHelper";
import api from '../../services/api.service'; // or import specific functions


export default function ActivationPage({ onActivated, onBack, isOnline }) {
  const [activationCode, setActivationCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [machineId, setMachineId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showHelper, setShowHelper] = useState(false);
  const [helperContent, setHelperContent] = useState({ title: "", children: null });

  // Get machine fingerprint on component mount using IPC
  useEffect(() => {
    fetchMachineFingerprint();
  }, []);

  // const fetchMachineFingerprint = async () => {
  //   try {
  //     // Use IPC instead of fetch
  //     const result = await window.electron.activation.getMachineId?.();
      
  //     if (result && result.machine_fingerprint) {
  //       setMachineId(result.machine_fingerprint);
  //     } else {
  //       // Fallback to the old method if IPC not available (for web development)
  //       console.warn("IPC not available, falling back to HTTP");
  //       const response = await fetch("http://localhost:8000/activation/machine-id");
  //       const data = await response.json();
  //       setMachineId(data.machine_fingerprint);
  //     }
  //   } catch (error) {
  //     console.error("Failed to get machine ID:", error);
  //   }
  // };

  // const handleActivate = async (e) => {
  //   e.preventDefault();
    
  //   if (!activationCode.trim()) {
  //     setNotification({ message: "Please enter activation code", type: "error" });
  //     return;
  //   }

  //   if (!schoolName.trim()) {
  //     setNotification({ message: "Please enter school name", type: "error" });
  //     return;
  //   }

  //   setLoading(true);
  //   setNotification({ message: "", type: "" });
    
  //   try {
  //     let result;
      
  //     // Try IPC first (Electron mode)
  //     if (window.electron?.activation?.activate) {
  //       result = await window.electron.activation.activate({
  //         code: activationCode,
  //         school_name: schoolName
  //       });
  //     } else {
  //       // Fallback to HTTP (development mode)
  //       console.warn("IPC not available, falling back to HTTP");
  //       const response = await fetch("http://localhost:8000/activation/activate", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ 
  //           code: activationCode,
  //           school_name: schoolName 
  //         }),
  //       });
  //       result = await response.json();
        
  //       if (!response.ok) {
  //         throw new Error(result.detail || "Failed to activate system");
  //       }
  //     }

  //     if (result.success) {
  //       setNotification({
  //         message: result.message,
  //         type: "success"
  //       });
        
  //       // Check if mini_settings was reset
  //       if (result.mini_settings_reset) {
  //         console.log("Mini-settings were reset during activation");
  //       }
        
  //       setTimeout(() => {
  //         onActivated();
  //       }, result.already_activated ? 500 : 2000);
        
  //     } else {
  //       setNotification({
  //         message: result.message || "Activation failed",
  //         type: "error"
  //       });
  //     }
  //   } catch (error) {
  //     setNotification({
  //       message: error.message || "Failed to connect to server",
  //       type: "error"
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


// In ActivationPage.jsx, update the functions:


// const fetchMachineFingerprint = async () => {
//   try {
//     const result = await api.getMachineFingerprint();
//     if (result && result.machine_fingerprint) {
//       setMachineId(result.machine_fingerprint);
//     }
//   } catch (error) {
//     console.error("Failed to get machine ID:", error);
//   }
// };



  const fetchMachineFingerprint = async () => {
    try {
      const response = await fetch("http://localhost:8000/activation/machine-id");
      const data = await response.json();
      setMachineId(data.machine_fingerprint);
    } catch (error) {
      console.error("Failed to get machine ID:", error);
    }
  };




const handleActivate = async (e) => {
  e.preventDefault();
  
  if (!activationCode.trim()) {
    setNotification({ message: "Please enter activation code", type: "error" });
    return;
  }

  if (!schoolName.trim()) {
    setNotification({ message: "Please enter school name", type: "error" });
    return;
  }

  setLoading(true);
  setNotification({ message: "", type: "" });
  
  try {
    const result = await api.activateSystem(activationCode, schoolName);
    
    if (result.success) {
      setNotification({
        message: result.message,
        type: "success"
      });
      
      // Check if mini_settings was reset
      if (result.mini_settings_reset) {
        console.log("Mini-settings were reset during activation");
      }
      
      setTimeout(() => {
        onActivated();
      }, result.already_activated ? 500 : 2000);
      
    } else {
      setNotification({
        message: result.message || "Activation failed",
        type: "error"
      });
    }
  } catch (error) {
    setNotification({
      message: error.message || "Failed to connect to server",
      type: "error"
    });
  } finally {
    setLoading(false);
  }
};



  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setNotification({ message: "Copied to clipboard!", type: "success" });
    });
  };

  const showRequestInfo = () => {
    setHelperContent({
      title: "How to Request Activation Code",
      children: (
        <div>
          <p><strong>Send this information to your vendor:</strong></p>
          <div className="card bg-light mb-3">
            <div className="card-body">
              <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
{`School Name: ${schoolName || "Your School Name"}
Machine Fingerprint: ${machineId || "Loading..."}

Please generate an activation code for this machine.`}
              </pre>
            </div>
          </div>
          <p className="mb-2"><strong>Contact Information:</strong></p>
          <ul className="mb-0">
            <li>Email: support@yourschoolsoftware.com</li>
            <li>Phone: +1234567890</li>
            <li>WhatsApp: +1234567890</li>
          </ul>
        </div>
      )
    });
    setShowHelper(true);
  };

  const showActivationInfo = () => {
    setHelperContent({
      title: "About Activation",
      children: (
        <div>
          <p><strong>This activation is machine-specific:</strong></p>
          <ul>
            <li>Each computer needs its own activation code</li>
            <li>Works offline after activation</li>
            <li>No subscriptions - one-time purchase</li>
            <li>Contact vendor for multiple licenses</li>
          </ul>
          <p className="mb-0"><small>The activation code binds your license to this specific computer.</small></p>
        </div>
      )
    });
    setShowHelper(true);
  };

  return (
    <div className="app app-login p-0">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <PageHelper 
        open={showHelper}
        title={helperContent.title}
        onClose={() => setShowHelper(false)}
      >
        {helperContent.children}
      </PageHelper>

      <div className="row g-0 app-auth-wrapper">
        {/* Left Side - Form */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
          <div className="app-auth-body mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={onBack}
                disabled={loading}
              >
                <ArrowLeft size={16} className="me-1" />
                Back
              </button>
              <h2 className="auth-heading text-center mb-0">Activation</h2>
              <button 
                className="btn btn-outline-info btn-sm"
                onClick={showActivationInfo}
              >
                <Info size={16} />
              </button>
            </div>

            {/* School Name */}
            <div className="mb-4">
              <label className="form-label">School Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Machine Fingerprint */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Machine Fingerprint</label>
                <button 
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={showRequestInfo}
                >
                  <Send size={14} className="me-1" />
                  How to request code
                </button>
              </div>
              <div className="input-group">
                <span className="input-group-text">
                  <Fingerprint size={16} />
                </span>
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={machineId || "Loading..."}
                  readOnly
                  disabled
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => copyToClipboard(machineId)}
                  disabled={!machineId}
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="form-text">
                Share this with vendor to get activation code
              </div>
            </div>

            {/* Activation Code */}
            <div className="mb-4">
              <label className="form-label">Activation Code</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Key size={16} />
                </span>
                <input
                  type="text"
                  className="form-control text-uppercase"
                  placeholder="Enter code from vendor"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  required
                  maxLength="12"
                />
              </div>
            </div>

            {/* Activate Button */}
            <button 
              type="button"
              className="btn btn-primary btn-lg w-100 mb-3"
              onClick={handleActivate}
              disabled={loading || !activationCode.trim() || !schoolName.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} className="me-2" />
                  Activate System
                </>
              )}
            </button>

            {/* Quick Info */}
            <div className="alert alert-light border">
              <div className="d-flex">
                <Info size={16} className="me-2 flex-shrink-0 mt-1" />
                <div>
                  <small>
                    Need help? <button 
                      type="button" 
                      className="btn btn-link btn-sm p-0"
                      onClick={showRequestInfo}
                    >
                      Click here for contact information
                    </button>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
          <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
            <div className="mb-4">
              <Fingerprint size={64} className="mb-3" />
              <h2 className="fw-bold text-light">Machine Activation</h2>
              <p className="lead text-light">
                License bound to this computer
              </p>
            </div>
            
            <div className="text-start">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary rounded-circle p-2 me-3">
                  <span className="text-light">1</span>
                </div>
                <div>
                  <h5 className="text-light mb-1">Request Code</h5>
                  <p className="small text-light opacity-75 mb-0">
                    Share school name and machine ID with vendor
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start mb-3">
                <div className="bg-warning rounded-circle p-2 me-3">
                  <span className="text-light">2</span>
                </div>
                <div>
                  <h5 className="text-light mb-1">Receive Code</h5>
                  <p className="small text-light opacity-75 mb-0">
                    Vendor sends unique activation code
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="bg-success rounded-circle p-2 me-3">
                  <span className="text-light">3</span>
                </div>
                <div>
                  <h5 className="text-light mb-1">Enter & Activate</h5>
                  <p className="small text-light opacity-75 mb-0">
                    Enter code to unlock the system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}