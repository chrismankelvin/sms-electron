


// // src/SchoolDetails/SchoolDetailsPage.jsx
// import { useState, useEffect } from "react";
// import {
//   Home, Mail, Phone, MapPin, User, Lock, ShieldCheck,
//   ArrowRight, ArrowLeft, Wifi, AlertCircle, CheckCircle
// } from "lucide-react";
// import Notification from "../components/Notification";
// import "../styles/school-details.css";
// import "../styles/global.css";

// // Import API services
// import { setupSchoolAndAdmin, isElectron } from "../services/api.service";

// export default function SchoolAndAdminSetupPage({ onSuccess, isOnline }) {
//   const [step, setStep] = useState(1);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     // School Details
//     school_name: "",
//     school_email: "",
//     school_contact: "",
//     school_type: "secondary",
//     county: "",
//     region: "",
//     city: "",
//     town: "",
//     gps_address: "",
//     country: "Ghana",
    
//     // Admin Details
//     first_name: "",
//     middle_name: "",
//     last_name: "",
//     admin_email: "",
//     contact: "",
//     password: "",
//     confirm_password: "",
//   });

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
//                   You need an active internet connection for setup.
//                   All data is saved directly to our cloud database.
//                 </p>
//                 <p className="text-danger">
//                   <strong>Please connect to the internet and try again.</strong>
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
//             <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//               <h2 className="fw-bold mb-3 text-light">Complete Cloud Setup</h2>
//               <p className="lead text-light">
//                 School and admin data are securely stored in our cloud database.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleNext = (e) => {
//     e.preventDefault();
    
//     // Validate current step
//     let isValid = true;
//     let errorMessage = "";
    
//     if (step === 1) {
//       // School basic info validation
//       if (!formData.school_name || !formData.school_email || !formData.school_contact) {
//         isValid = false;
//         errorMessage = "Please fill in all required school fields.";
//       } else {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.school_email)) {
//           isValid = false;
//           errorMessage = "Please enter a valid school email address.";
//         }
//       }
//     } else if (step === 2) {
//       // Location validation
//       if (!formData.county || !formData.region || !formData.city || !formData.town || !formData.gps_address) {
//         isValid = false;
//         errorMessage = "Please fill in all location fields.";
//       }
//     } else if (step === 3) {
//       // Admin personal info validation
//       if (!formData.first_name || !formData.last_name || !formData.admin_email) {
//         isValid = false;
//         errorMessage = "Please fill in all required admin fields.";
//       } else {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.admin_email)) {
//           isValid = false;
//           errorMessage = "Please enter a valid admin email address.";
//         }
//       }
//     }
    
//     if (!isValid) {
//       setNotification({ message: errorMessage, type: "error" });
//       return;
//     }
    
//     setStep(step + 1);
//   };

//   const handleBack = () => {
//     if (step > 1) {
//       setStep(step - 1);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setNotification({ message: "", type: "" });

//     // Final validation (step 4 - password)
//     if (!formData.contact || !formData.password || !formData.confirm_password) {
//       setNotification({ message: "Please fill in all required fields.", type: "error" });
//       setLoading(false);
//       return;
//     }

//     if (formData.password !== formData.confirm_password) {
//       setNotification({ message: "Passwords do not match.", type: "error" });
//       setLoading(false);
//       return;
//     }

//     if (formData.password.length < 6) {
//       setNotification({ message: "Password must be at least 6 characters.", type: "error" });
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log('Submitting setup data via IPC...');
      
//       // Use IPC instead of HTTP fetch
//       const result = await setupSchoolAndAdmin(formData);
      
//       console.log('Setup result:', result);
      
//       if (result.success) {
//         setNotification({
//           message: result.message || "School and admin created successfully!",
//           type: "success"
//         });

//         // Move to activation after short delay
//         setTimeout(() => {
//           onSuccess();
//         }, 1500);
//       } else {
//         throw new Error(result.message || "Failed to complete setup");
//       }

//     } catch (error) {
//       console.error('Setup error:', error);
//       setNotification({
//         message: error.message || "Failed to complete setup. Please try again.",
//         type: "error"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStepContent = () => {
//     switch (step) {
//       case 1:
//         return (
//           <>
//             <h3 className="mb-4">School Basic Information</h3>
            
//             <div className="mb-3 position-relative">
//               <Home size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="text"
//                 className="form-control ps-5"
//                 placeholder="School Name *"
//                 name="school_name"
//                 value={formData.school_name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3 position-relative">
//               <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="email"
//                 className="form-control ps-5"
//                 placeholder="School Email *"
//                 name="school_email"
//                 value={formData.school_email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-4 position-relative">
//               <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="tel"
//                 className="form-control ps-5"
//                 placeholder="School Contact *"
//                 name="school_contact"
//                 value={formData.school_contact}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </>
//         );

//       case 2:
//         return (
//           <>
//             <h3 className="mb-4">School Location Details</h3>
            
//             <div className="mb-3 position-relative">
//               <MapPin size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="text"
//                 className="form-control ps-5"
//                 placeholder="County *"
//                 name="county"
//                 value={formData.county}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Region *"
//                 name="region"
//                 value={formData.region}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="City *"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Town *"
//                 name="town"
//                 value={formData.town}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="GPS Address *"
//                 name="gps_address"
//                 value={formData.gps_address}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </>
//         );

//       case 3:
//         return (
//           <>
//             <h3 className="mb-4">Admin Personal Information</h3>
            
//             <div className="mb-3 position-relative">
//               <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="text"
//                 className="form-control ps-5"
//                 placeholder="First Name *"
//                 name="first_name"
//                 value={formData.first_name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Middle Name (Optional)"
//                 name="middle_name"
//                 value={formData.middle_name}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Last Name *"
//                 name="last_name"
//                 value={formData.last_name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-4 position-relative">
//               <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="email"
//                 className="form-control ps-5"
//                 placeholder="Admin Email *"
//                 name="admin_email"
//                 value={formData.admin_email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </>
//         );

//       case 4:
//         return (
//           <>
//             <h3 className="mb-4">Admin Account Security</h3>
            
//             <div className="mb-3 position-relative">
//               <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="tel"
//                 className="form-control ps-5"
//                 placeholder="Admin Contact *"
//                 name="contact"
//                 value={formData.contact}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3 position-relative">
//               <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="password"
//                 className="form-control ps-5"
//                 placeholder="Password (min. 6 characters) *"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 minLength="6"
//               />
//             </div>

//             <div className="mb-4 position-relative">
//               <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//               <input
//                 type="password"
//                 className="form-control ps-5"
//                 placeholder="Confirm Password *"
//                 name="confirm_password"
//                 value={formData.confirm_password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <div className="alert alert-info">
//                 <small>
//                   <CheckCircle size={14} className="me-2" />
//                   You're creating a <strong>Super Admin</strong> account with full system access.
//                 </small>
//               </div>
//             </div>
//           </>
//         );

//       default:
//         return null;
//     }
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
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <button 
//                 className="btn btn-sm btn-outline-secondary"
//                 onClick={handleBack}
//                 disabled={loading || step === 1}
//               >
//                 <ArrowLeft size={16} className="me-1" /> Back
//               </button>
              
//               <h2 className="auth-heading text-center mb-0 flex-grow-1">
//                 {step <= 2 ? "School Setup" : "Admin Setup"}
//               </h2>
              
//               <div style={{width: '100px'}}></div>
//             </div>

//             <p className="text-muted mb-4">
//               Step {step} of 4
//               <br />
//             </p>

//             <form onSubmit={step < 4 ? handleNext : handleSubmit}>
//               {renderStepContent()}

//               <div className="mt-4">
//                 {step < 4 ? (
//                   <button 
//                     type="submit" 
//                     className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
//                     disabled={loading}
//                   >
//                     Next Step <ArrowRight size={18} className="ms-2" />
//                   </button>
//                 ) : (
//                   <button 
//                     type="submit" 
//                     className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2"></span>
//                         Creating School & Admin...
//                       </>
//                     ) : "Complete Setup"}
//                   </button>
//                 )}
//               </div>
//             </form>

//             {/* Add Recover Account Link */}
//             <div className="text-center mt-3">
//               <small className="text-muted">
//                 Already registered?{" "}
//                 <a 
//                   href="#" 
//                   onClick={(e) => {
//                     e.preventDefault();
//                     window.location.href = "/recover-account";
//                   }}
//                   className="text-primary text-decoration-none fw-medium"
//                 >
//                   Recover School Account
//                 </a>
//               </small>
//             </div>

//             <div className="mt-4">
//               <div className="alert alert-info">
//                 <small>
//                   <strong>Note:</strong> 
//                   {isElectron() 
//                     ? ' All data is saved locally and synced to cloud when online.'
//                     : ' All data is saved directly to our secure cloud database.'}
//                   You need to stay online throughout the setup process.
//                 </small>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Background Side */}
//         <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
//           <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//             <h2 className="fw-bold mb-3 text-light">Complete Cloud Setup</h2>
//             <p className="lead text-light mb-4">
//               Create school and admin account in one process.
//             </p>
            
//             <div className="setup-progress mb-4">
//               <div className="d-flex justify-content-center align-items-center">
//                 {[1, 2, 3, 4].map((stepNum) => (
//                   <div key={stepNum} className="d-flex align-items-center">
//                     <div className={`progress-step ${step >= stepNum ? 'active' : ''}`}>
//                       <div className="step-circle">{stepNum}</div>
//                       <div className="step-label">
//                         {stepNum === 1 && "School"}
//                         {stepNum === 2 && "Location"}
//                         {stepNum === 3 && "Admin"}
//                         {stepNum === 4 && "Security"}
//                       </div>
//                     </div>
//                     {stepNum < 4 && <div className="progress-line"></div>}
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             <div className="cloud-info mt-4">
//               <div className="feature-item mb-3">
//                 <ShieldCheck size={24} className="mb-2" />
//                 <h5>Atomic Operation</h5>
//                 <p className="small mb-0">School and admin created together</p>
//               </div>
//               <div className="feature-item mb-3">
//                 <Wifi size={24} className="mb-2" />
//                 <h5>{isElectron() ? 'IPC Communication' : 'Cloud Storage'}</h5>
//                 <p className="small mb-0">
//                   {isElectron() 
//                     ? 'Fast local communication with Python'
//                     : 'Saved to SQLiteCloud database'}
//                 </p>
//               </div>
//               <div className="feature-item">
//                 <CheckCircle size={24} className="mb-2" />
//                 <h5>No Race Conditions</h5>
//                 <p className="small mb-0">Eliminates concurrent setup issues</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






// src/SchoolDetails/SchoolDetailsPage.jsx (SIMPLIFIED)
import { useState } from "react";
import {
  Home, Mail, Phone, MapPin, User, Lock, ShieldCheck,
  ArrowRight, ArrowLeft, AlertCircle, CheckCircle, Info
} from "lucide-react";
import Notification from "../components/Notification";
import PageHelper from "../components/PageHelper";
import "../styles/school-details.css";
import "../styles/global.css";
import { setupSchoolAndAdmin, isElectron } from "../services/api.service";

export default function SchoolAndAdminSetupPage({ onSuccess, isOnline }) {
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [formData, setFormData] = useState({
    school_name: "", school_email: "", school_contact: "", school_type: "secondary",
    county: "", region: "", city: "", town: "", gps_address: "", country: "Ghana",
    first_name: "", middle_name: "", last_name: "", admin_email: "", contact: "",
    password: "", confirm_password: "",
  });

  if (!isOnline) {
    return (
      <div className="app app-login p-0">
        <div className="row g-0 app-auth-wrapper">
          <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-4">
            <div className="app-auth-body mx-auto">
              <AlertCircle size={64} className="text-danger mb-3" />
              <h3 className="mb-3">Internet Required</h3>
              <p className="text-muted mb-3">You need an active internet connection for setup.</p>
              <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
          <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
            <div className="text-center p-4">
              <ShieldCheck size={64} className="mb-3 opacity-75" />
              <h3>Cloud Setup</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleBack = () => step > 1 && setStep(step - 1);

  const handleNext = (e) => {
    e.preventDefault();
    let isValid = true;
    let errorMessage = "";
    
    if (step === 1 && (!formData.school_name || !formData.school_email || !formData.school_contact)) {
      isValid = false;
      errorMessage = "Fill all school fields";
    } else if (step === 1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.school_email)) {
      isValid = false;
      errorMessage = "Valid email required";
    } else if (step === 2 && (!formData.county || !formData.region || !formData.city || !formData.town || !formData.gps_address)) {
      isValid = false;
      errorMessage = "Fill all location fields";
    } else if (step === 3 && (!formData.first_name || !formData.last_name || !formData.admin_email)) {
      isValid = false;
      errorMessage = "Fill all admin fields";
    } else if (step === 3 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
      isValid = false;
      errorMessage = "Valid admin email required";
    }
    
    if (!isValid) {
      setNotification({ message: errorMessage, type: "error" });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.contact || !formData.password || !formData.confirm_password) {
      setNotification({ message: "Fill all fields", type: "error" });
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setNotification({ message: "Passwords don't match", type: "error" });
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setNotification({ message: "Password min 6 characters", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const result = await setupSchoolAndAdmin(formData);
      if (result.success) {
        setNotification({ message: result.message || "Setup complete!", type: "success" });
        setTimeout(() => onSuccess(), 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setNotification({ message: error.message || "Setup failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getHelperContent = () => {
    if (step === 1) return {
      title: "School Basic Info",
      content: (
        <div>
          <p><strong>Required Information:</strong></p>
          <ul>
            <li>School Name - Official registered name</li>
            <li>School Email - Valid email for official communication</li>
            <li>School Contact - Active phone number</li>
          </ul>
          <p className="small text-muted mt-3">This information will be used for official records.</p>
        </div>
      )
    };
    if (step === 2) return {
      title: "School Location",
      content: (
        <div>
          <p><strong>Location Details:</strong></p>
          <ul>
            <li>County/District where school is located</li>
            <li>Region/Province administrative area</li>
            <li>City/Town specific location</li>
            <li>GPS Address for digital mapping</li>
          </ul>
        </div>
      )
    };
    if (step === 3) return {
      title: "Admin Account",
      content: (
        <div>
          <p><strong>Super Admin Account:</strong></p>
          <ul>
            <li>Full system access privileges</li>
            <li>Can create other admin accounts</li>
            <li>Responsible for school data</li>
          </ul>
        </div>
      )
    };
    return {
      title: "Security",
      content: (
        <div>
          <p><strong>Password Requirements:</strong></p>
          <ul>
            <li>Minimum 6 characters</li>
            <li>Keep password secure</li>
            <li>Contact will be used for recovery</li>
          </ul>
        </div>
      )
    };
  };

  return (
    <div className="app app-login p-0">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
      
      <PageHelper open={showHelper} title={getHelperContent().title} onClose={() => setShowHelper(false)}>
        {getHelperContent().content}
      </PageHelper>

      <div className="row g-0 app-auth-wrapper">
        {/* Left Side - Simplified Form */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col p-4">
          <div className="app-auth-body mx-auto" style={{ maxWidth: '400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <button className="btn btn-outline-secondary btn-sm" onClick={handleBack} disabled={loading || step === 1}>
                <ArrowLeft size={16} />
              </button>
              <h3 className="mb-0">{step <= 2 ? "School" : "Admin"} Setup</h3>
              <button className="btn btn-outline-info btn-sm" onClick={() => setShowHelper(true)}>
                <Info size={16} />
              </button>
            </div>

            <form onSubmit={step < 4 ? handleNext : handleSubmit}>
              {/* Step 1 - School Basic */}
              {step === 1 && (
                <>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><Home size={16} /></span>
                    <input type="text" className="form-control" placeholder="School Name" name="school_name" value={formData.school_name} onChange={handleChange} />
                  </div>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><Mail size={16} /></span>
                    <input type="email" className="form-control" placeholder="School Email" name="school_email" value={formData.school_email} onChange={handleChange} />
                  </div>
                  <div className="input-group mb-3">
                    <span className="input-group-text"><Phone size={16} /></span>
                    <input type="tel" className="form-control" placeholder="School Contact" name="school_contact" value={formData.school_contact} onChange={handleChange} />
                  </div>
                </>
              )}

              {/* Step 2 - Location */}
              {step === 2 && (
                <>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><MapPin size={16} /></span>
                    <input type="text" className="form-control" placeholder="County" name="county" value={formData.county} onChange={handleChange} />
                  </div>
                  <input type="text" className="form-control mb-2" placeholder="Region" name="region" value={formData.region} onChange={handleChange} />
                  <input type="text" className="form-control mb-2" placeholder="City" name="city" value={formData.city} onChange={handleChange} />
                  <input type="text" className="form-control mb-2" placeholder="Town" name="town" value={formData.town} onChange={handleChange} />
                  <input type="text" className="form-control mb-3" placeholder="GPS Address" name="gps_address" value={formData.gps_address} onChange={handleChange} />
                </>
              )}

              {/* Step 3 - Admin Info */}
              {step === 3 && (
                <>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><User size={16} /></span>
                    <input type="text" className="form-control" placeholder="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                  </div>
                  <input type="text" className="form-control mb-2" placeholder="Middle Name (Optional)" name="middle_name" value={formData.middle_name} onChange={handleChange} />
                  <input type="text" className="form-control mb-2" placeholder="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                  <div className="input-group mb-3">
                    <span className="input-group-text"><Mail size={16} /></span>
                    <input type="email" className="form-control" placeholder="Admin Email" name="admin_email" value={formData.admin_email} onChange={handleChange} />
                  </div>
                </>
              )}

              {/* Step 4 - Security */}
              {step === 4 && (
                <>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><Phone size={16} /></span>
                    <input type="tel" className="form-control" placeholder="Admin Contact" name="contact" value={formData.contact} onChange={handleChange} />
                  </div>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><Lock size={16} /></span>
                    <input type="password" className="form-control" placeholder="Password (min 6)" name="password" value={formData.password} onChange={handleChange} />
                  </div>
                  <div className="input-group mb-3">
                    <span className="input-group-text"><Lock size={16} /></span>
                    <input type="password" className="form-control" placeholder="Confirm Password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : (step < 4 ? "Continue" : "Complete Setup")}
              </button>
            </form>

            <div className="text-center mt-3">
              <small>
                Already registered?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = "/recover-account"; }}>Recover Account</a>
              </small>
            </div>
          </div>
        </div>

        {/* Right Side - Minimal Visual */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
          <div className="text-center p-4">
            <ShieldCheck size={64} className="mb-3 opacity-75" />
            <h3>{step <= 2 ? "School" : "Admin"} Setup</h3>
            <div className="mt-4">
              {[
                { num: 1, label: "School", active: step >= 1 },
                { num: 2, label: "Location", active: step >= 2 },
                { num: 3, label: "Admin", active: step >= 3 },
                { num: 4, label: "Security", active: step >= 4 }
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
    </div>
  );
}