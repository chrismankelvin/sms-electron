// import { useState } from "react";
// import { KeyRound, Cpu, HelpCircle } from "lucide-react";
// import Notification from "../../components/Notification";
// import "../../styles/school-details.css";
// import "../../styles/global.css";
// import PageHelper from "../../components/PageHelper";

// export default function ActivationPage() {
//   const [formData, setFormData] = useState({
//     manufacturerCode: "",
//     activationCode: "",
//   });
// const [showHelp, setShowHelp] = useState(false);

//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (!formData.manufacturerCode || !formData.activationCode) {
//       setNotification({
//         message: "Please enter both Manufacturer Code and Activation Code.",
//         type: "error",
//       });
//       setLoading(false);
//       return;
//     }

//     // Simulate activation
//     setTimeout(() => {
//       setLoading(false);
//       setNotification({
//         message: "Activation successful! Welcome to SMS.",
//         type: "success",
//       });
//       console.log("Activation Data:", formData);
//     }, 1200);
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
//             <h2 className="auth-heading text-center mb-4">
//               Activate School Management System
//             </h2>

//             <form className="auth-form" onSubmit={handleSubmit}>
//               {/* Manufacturer Code */}
//               <div className="mb-3 position-relative">
//                 <Cpu
//                   size={18}
//                   className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
//                 />
//                 <input
//                   type="text"
//                   className="form-control ps-5"
//                   placeholder="Manufacturer Code"
//                   name="manufacturerCode"
//                   value={formData.manufacturerCode}
//                   onChange={handleChange}
//                 />
//               </div>

//               {/* Activation Code */}
//               <div className="mb-4 position-relative">
//                 <KeyRound
//                   size={18}
//                   className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
//                 />
//                 <input
//                   type="text"
//                   className="form-control ps-5"
//                   placeholder="Activation Code"
//                   name="activationCode"
//                   value={formData.activationCode}
//                   onChange={handleChange}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
//                 disabled={loading}
//               >
//                 {loading ? "Activating..." : "Activate System"}
//               </button>
//             </form>

//             {/* Help Link */}
//             <div className="mt-4 text-center">
//           <button
//   type="button"
//   className="btn btn-link d-inline-flex align-items-center gap-1 text-muted"
//   onClick={() => setShowHelp(true)}
// >
//   <HelpCircle size={16} />
//   How do I get my activation code?
// </button>

//             </div>
//           </div>
//         </div>

//         {/* Background Side */}
//         <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
//           <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//             <h2 className="fw-bold text-light">System Activation</h2>
//             <p className="lead text-light">
//               Secure your installation before continuing.
//             </p>
//           </div>
//         </div>
// <PageHelper
//   open={showHelp}
//   title="How to Get Your Activation Code"
//   onClose={() => setShowHelp(false)}
// >
//   <p>
//     To activate the <strong>School Management System</strong>, you need a valid
//     <strong> Activation Code</strong> issued by PHASH-C.
//   </p>

//   <ul>
//     <li>
//       Purchase the School Management System from <strong>PHASH-C</strong>
//     </li>
//     <li>
//       Provide your device’s <strong>Manufacturer Code</strong>
//     </li>
//     <li>
//       An activation code will be generated and assigned to your system
//     </li>
//   </ul>

//   <p>
//     If you need assistance or have misplaced your activation details, please
//     contact our support team:
//   </p>

//   <p>
//     <a href="mailto:support@phash-c.com">
//       support@phash-c.com
//     </a>
//   </p>

//   <p>
//     <a href="mailto:support@phash-c.com">
//       Restore Activation Code
//     </a>
//   </p>
// </PageHelper>


//       </div>

//     </div>
//   );
// }








// import { useState } from "react";
// import { Key, Wifi, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
// import Notification from "../../components/Notification";

// export default function ActivationPage({ onActivated, onBack, isOnline }) {
//   const [activationCode, setActivationCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState({ message: "", type: "" });

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
//                   You need an active internet connection to activate the system.
//                   Activation data is saved directly to our cloud database.
//                 </p>
//                 <p className="text-danger">
//                   <strong>Please connect to the internet and try again.</strong>
//                 </p>
//                 <button 
//                   className="btn btn-outline-secondary mt-3"
//                   onClick={onBack}
//                 >
//                   <ArrowLeft size={16} className="me-2" />
//                   Back to Admin Setup
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
//             <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//               <h2 className="fw-bold text-light">Cloud Activation</h2>
//               <p className="lead text-light">
//                 Activation is verified and stored in our cloud database.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const handleActivate = async (e) => {
//     e.preventDefault();
    
//     if (!activationCode.trim()) {
//       setNotification({ message: "Please enter activation code", type: "error" });
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
//         body: JSON.stringify({ code: activationCode }),
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
        
//         // Trigger success after delay
//         setTimeout(() => {
//           onActivated();
//         }, 2000);
//       } else {
//         setNotification({
//           message: result.message || "Activation failed",
//           type: "error"
//         });
//       }
//     } catch (error) {
//       setNotification({
//         message: error.message || "Failed to activate. Please check your internet connection.",
//         type: "error"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="app app-login p-0">
//       <Notification
//         message={notification.message}
//         type={notification.type}
//         onClose={() => setNotification({ message: "", type: "" })}
//       />

//       {/* Online Status Banner */}
//       <div className="connection-banner online">
//         <div className="container d-flex align-items-center justify-content-center py-2">
//           <Wifi size={16} className="me-2" />
//           <span>Connected to Internet - Activation will be saved to cloud database</span>
//         </div>
//       </div>

//       <div className="row g-0 app-auth-wrapper">
//         {/* Form Section */}
//         <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
//           <div className="app-auth-body mx-auto">
//             <button 
//               className="btn btn-sm btn-outline-secondary mb-4"
//               onClick={onBack}
//               disabled={loading}
//             >
//               <ArrowLeft size={16} className="me-2" />
//               Back to Admin Setup
//             </button>
            
//             <h2 className="auth-heading text-center mb-4">System Activation</h2>
            
//             <div className="mb-4">
//               <div className="alert alert-success">
//                 <CheckCircle className="me-2" size={20} />
//                 <strong>School & Admin Setup Complete!</strong>
//                 <p className="mb-0 mt-2">Now enter your activation code to activate the system.</p>
//               </div>
//             </div>

//             <form onSubmit={handleActivate}>
//               <div className="mb-4">
//                 <label className="form-label">Activation Code</label>
//                 <div className="input-group">
//                   <span className="input-group-text">
//                     <Key size={20} />
//                   </span>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter your activation code"
//                     value={activationCode}
//                     onChange={(e) => setActivationCode(e.target.value)}
//                     disabled={loading}
//                     required
//                   />
//                 </div>
//                 <div className="form-text">
//                   Enter the activation code provided with your purchase.
//                 </div>
//               </div>

//               <button 
//                 type="submit" 
//                 className="btn btn-primary btn-lg w-100"
//                 disabled={loading || !activationCode.trim()}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2"></span>
//                     Activating...
//                   </>
//                 ) : (
//                   "Activate System"
//                 )}
//               </button>
//             </form>

//             <div className="mt-4">
//               <div className="alert alert-info">
//                 <small>
//                   <strong>Note:</strong> Activation is verified and saved to our cloud database.
//                   You need to stay online for the activation process.
//                 </small>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Background Side */}
//         <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
//           <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//             <h2 className="fw-bold text-light">Final Step: Activation</h2>
//             <p className="lead text-light">
//               Activate your system to start using all features.
//             </p>
//             <div className="activation-features mt-4">
//               <div className="feature-item mb-3">
//                 <CheckCircle size={32} className="mb-2" />
//                 <h5>Full Access Unlocked</h5>
//                 <p className="small mb-0">All modules and features enabled</p>
//               </div>
//               <div className="feature-item mb-3">
//                 <Key size={32} className="mb-2" />
//                 <h5>License Validated</h5>
//                 <p className="small mb-0">Your license key is verified in cloud</p>
//               </div>
//               <div className="feature-item">
//                 <Wifi size={32} className="mb-2" />
//                 <h5>Cloud Verification</h5>
//                 <p className="small mb-0">Activation stored in SQLiteCloud</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// # online startup version# online startup version# online startup version# online startup version

// # online startup version# online startup version# online startup version# online startup version

// # online startup version# online startup version# online startup version# online startup version

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

export default function ActivationPage({ onActivated, onBack, isOnline }) {
  const [activationCode, setActivationCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [machineId, setMachineId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showHelper, setShowHelper] = useState(false);
  const [helperContent, setHelperContent] = useState({ title: "", children: null });

  // Get machine fingerprint on component mount
  useEffect(() => {
    fetchMachineFingerprint();
  }, []);

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
      const response = await fetch("http://localhost:8000/activation/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          code: activationCode,
          school_name: schoolName 
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || "Failed to activate system");
      }

      if (result.success) {
        setNotification({
          message: result.message,
          type: "success"
        });
        
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