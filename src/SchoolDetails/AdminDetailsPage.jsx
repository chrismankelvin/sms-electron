// import { useState } from "react";
// import {
//   User,
//   Mail,
//   Phone,
//   Lock,
//   ShieldCheck,
//   ArrowRight,
// } from "lucide-react";
// import Notification from "../components/Notification";
// import "../styles/global.css";
// import "../styles/school-details.css";



// export default function AdminDetailsPage() {
//   const [step, setStep] = useState(1);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     firstName: "",
//     surname: "",
//     otherNames: "",
//     email: "",
//     contact: "",
//     password: "",
//     confirmPassword: "",
//     role: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleNext = (e) => {
//     e.preventDefault();

//     const requiredStep1 = ["firstName", "surname", "otherNames", "email"];
//     for (let field of requiredStep1) {
//       if (!formData[field]) {
//         setNotification({ message: "Please fill in all required fields.", type: "error" });
//         return;
//       }
//     }

//     setStep(2);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const requiredStep2 = ["contact", "password", "confirmPassword", "role"];
//     for (let field of requiredStep2) {
//       if (!formData[field]) {
//         setNotification({ message: "Please fill in all required fields.", type: "error" });
//         setLoading(false);
//         return;
//       }
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setNotification({ message: "Passwords do not match.", type: "error" });
//       setLoading(false);
//       return;
//     }

//     setTimeout(() => {
//       setLoading(false);
//       setNotification({ message: "Admin details saved successfully!", type: "success" });
//       console.log("Admin Data:", formData);
//     }, 1000);
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
//             <h2 className="auth-heading text-center mb-4">Admin Details</h2>

//             <form className="auth-form" onSubmit={step === 1 ? handleNext : handleSubmit}>
//               {step === 1 && (
//                 <>
//                   {/* First Name */}
//                   <div className="mb-3 position-relative">
//                     <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="text"
//                       className="form-control ps-5"
//                       placeholder="First Name"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Surname */}
//                   <div className="mb-3 position-relative">
//                     <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="text"
//                       className="form-control ps-5"
//                       placeholder="Surname"
//                       name="surname"
//                       value={formData.surname}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Other Names */}
//                   <div className="mb-3 position-relative">
//                     <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="text"
//                       className="form-control ps-5"
//                       placeholder="Other Names"
//                       name="otherNames"
//                       value={formData.otherNames}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Email */}
//                   <div className="mb-4 position-relative">
//                     <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="email"
//                       className="form-control ps-5"
//                       placeholder="Email Address"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   <button className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center">
//                     Next <ArrowRight size={18} className="ms-2" />
//                   </button>
//                 </>
//               )}

//               {step === 2 && (
//                 <>
//                   {/* Contact */}
//                   <div className="mb-3 position-relative">
//                     <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="text"
//                       className="form-control ps-5"
//                       placeholder="Contact Number"
//                       name="contact"
//                       value={formData.contact}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Password */}
//                   <div className="mb-3 position-relative">
//                     <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="password"
//                       className="form-control ps-5"
//                       placeholder="Password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Confirm Password */}
//                   <div className="mb-3 position-relative">
//                     <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="password"
//                       className="form-control ps-5"
//                       placeholder="Confirm Password"
//                       name="confirmPassword"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Role */}
//                   <div className="mb-4 position-relative">
//                     <ShieldCheck size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
//                     <input
//                       type="text"
//                       className="form-control ps-5"
//                       placeholder="Role (e.g. Super Admin)"
//                       name="role"
//                       value={formData.role}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   <button
//                     className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : "Submit"}
//                   </button>
//                 </>
//               )}
//             </form>
//           </div>
//         </div>

//         {/* Background Side */}
//         <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
//           <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
//             <h2 className="fw-bold text-light">Admin Setup</h2>
//             <p className="lead text-light">
//               Create the main administrator account for this school.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Wifi,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Notification from "../components/Notification";
import "../styles/global.css";
import "../styles/school-details.css";

export default function AdminDetailsPage({ onSuccess, onBack, isOnline }) {
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact: "",
    password: "",
    confirm_password: "",
  });

  // Check internet connectivity
  if (!isOnline) {
    return (
      <div className="app app-login p-0">
        <div className="row g-0 app-auth-wrapper">
          <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
            <div className="app-auth-body mx-auto">
              <div className="text-center mb-4">
                <AlertCircle size={64} className="text-danger mb-3" />
                <h3 className="auth-heading text-center mb-3">Internet Required</h3>
                <p className="text-muted">
                  You need an active internet connection to create the admin account.
                  All data is saved directly to our cloud database.
                </p>
                <p className="text-danger">
                  <strong>Please connect to the internet and try again.</strong>
                </p>
                <button 
                  className="btn btn-outline-secondary mt-3"
                  onClick={onBack}
                >
                  <ArrowLeft size={16} className="me-2" />
                  Back to School Details
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
            <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
              <h2 className="fw-bold text-light">Cloud Admin Setup</h2>
              <p className="lead text-light">
                Admin account is stored securely in our cloud database.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    const requiredStep1 = ["first_name", "last_name", "email"];
    for (let field of requiredStep1) {
      if (!formData[field]) {
        setNotification({ message: "Please fill in all required fields.", type: "error" });
        return;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({ message: "Please enter a valid email address.", type: "error" });
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: "", type: "" });

    // Validate all fields
    const requiredStep2 = ["contact", "password", "confirm_password"];
    for (let field of requiredStep2) {
      if (!formData[field]) {
        setNotification({ message: "Please fill in all required fields.", type: "error" });
        setLoading(false);
        return;
      }
    }

    if (formData.password !== formData.confirm_password) {
      setNotification({ message: "Passwords do not match.", type: "error" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setNotification({ message: "Password must be at least 6 characters.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      // Save to backend (which saves to SQLiteCloud)
      const response = await fetch("http://localhost:8000/admin/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || "Failed to save admin details");
      }

      setNotification({
        message: result.message,
        type: "success"
      });

      // Move to next step after short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      setNotification({
        message: error.message || "Failed to save admin details. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app app-login p-0">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      {/* Online Status Banner */}
      <div className="connection-banner online">
        <div className="container d-flex align-items-center justify-content-center py-2">
          <Wifi size={16} className="me-2" />
          <span>Connected to Internet - Admin account will be saved to cloud database</span>
        </div>
      </div>

      <div className="row g-0 app-auth-wrapper">
        {/* Form Section */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
          <div className="app-auth-body mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              {step === 2 ? (
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft size={16} className="me-1" /> Back
                </button>
              ) : (
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={onBack}
                  disabled={loading}
                >
                  <ArrowLeft size={16} className="me-1" /> Back to School
                </button>
              )}
              <h2 className="auth-heading text-center mb-0 flex-grow-1">Admin Setup</h2>
              <div style={{width: '100px'}}></div>
            </div>

            <p className="text-muted mb-4">
              {step === 1 ? "Step 1: Personal Information" : "Step 2: Account Security"}
              <br />
              <small className="text-success">
                <Wifi size={12} className="me-1" />
                Connected - Account saves directly to cloud
              </small>
            </p>

            <form className="auth-form" onSubmit={step === 1 ? handleNext : handleSubmit}>
              {step === 1 && (
                <>
                  {/* First Name */}
                  <div className="mb-3 position-relative">
                    <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="First Name *"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Middle Name */}
                  <div className="mb-3 position-relative">
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Middle Name (Optional)"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-3 position-relative">
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Last Name *"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-4 position-relative">
                    <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                    <input
                      type="email"
                      className="form-control ps-5"
                      placeholder="Email Address *"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    Next <ArrowRight size={18} className="ms-2" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Contact */}
                  <div className="mb-3 position-relative">
                    <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                    <input
                      type="tel"
                      className="form-control ps-5"
                      placeholder="Contact Number *"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3 position-relative">
                    <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                    <input
                      type="password"
                      className="form-control ps-5"
                      placeholder="Password (min. 6 characters) *"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3 position-relative">
                    <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                    <input
                      type="password"
                      className="form-control ps-5"
                      placeholder="Confirm Password *"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <div className="alert alert-info">
                      <small>
                        <CheckCircle size={14} className="me-2" />
                        You're creating a <strong>Super Admin</strong> account with full system access.
                      </small>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn app-btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving to Cloud...
                        </>
                      ) : "Create Admin Account"}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-4">
              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> Admin account is saved directly to our secure cloud database.
                  You need to stay online throughout the setup process.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Background Side */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
          <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
            <h2 className="fw-bold text-light">Super Admin Account</h2>
            <p className="lead text-light mb-4">
              Create the main administrator account for this school.
            </p>
            <div className="setup-progress">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-circle">1</div>
                  <div className="step-label">Personal Info</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-circle">2</div>
                  <div className="step-label">Security</div>
                </div>
              </div>
              <div className="admin-features mt-4">
                <div className="feature-item mb-3">
                  <ShieldCheck size={24} className="mb-2" />
                  <h5>Full System Control</h5>
                  <p className="small mb-0">Manage all aspects of the school system</p>
                </div>
                <div className="feature-item mb-3">
                  <User size={24} className="mb-2" />
                  <h5>User Management</h5>
                  <p className="small mb-0">Create and manage staff & student accounts</p>
                </div>
                <div className="feature-item">
                  <Wifi size={24} className="mb-2" />
                  <h5>Cloud Storage</h5>
                  <p className="small mb-0">Account stored securely in SQLiteCloud</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}