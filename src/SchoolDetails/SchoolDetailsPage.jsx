


// src/SchoolDetails/SchoolDetailsPage.jsx
import { useState, useEffect } from "react";
import {
  Home, Mail, Phone, MapPin, User, Lock, ShieldCheck,
  ArrowRight, ArrowLeft, Wifi, AlertCircle, CheckCircle
} from "lucide-react";
import Notification from "../components/Notification";
import "../styles/school-details.css";
import "../styles/global.css";

// Import API services
import { setupSchoolAndAdmin, isElectron } from "../services/api.service";

export default function SchoolAndAdminSetupPage({ onSuccess, isOnline }) {
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // School Details
    school_name: "",
    school_email: "",
    school_contact: "",
    school_type: "secondary",
    county: "",
    region: "",
    city: "",
    town: "",
    gps_address: "",
    country: "Ghana",
    
    // Admin Details
    first_name: "",
    middle_name: "",
    last_name: "",
    admin_email: "",
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
                  You need an active internet connection for setup.
                  All data is saved directly to our cloud database.
                </p>
                <p className="text-danger">
                  <strong>Please connect to the internet and try again.</strong>
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
            <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
              <h2 className="fw-bold mb-3 text-light">Complete Cloud Setup</h2>
              <p className="lead text-light">
                School and admin data are securely stored in our cloud database.
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
    
    // Validate current step
    let isValid = true;
    let errorMessage = "";
    
    if (step === 1) {
      // School basic info validation
      if (!formData.school_name || !formData.school_email || !formData.school_contact) {
        isValid = false;
        errorMessage = "Please fill in all required school fields.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.school_email)) {
          isValid = false;
          errorMessage = "Please enter a valid school email address.";
        }
      }
    } else if (step === 2) {
      // Location validation
      if (!formData.county || !formData.region || !formData.city || !formData.town || !formData.gps_address) {
        isValid = false;
        errorMessage = "Please fill in all location fields.";
      }
    } else if (step === 3) {
      // Admin personal info validation
      if (!formData.first_name || !formData.last_name || !formData.admin_email) {
        isValid = false;
        errorMessage = "Please fill in all required admin fields.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.admin_email)) {
          isValid = false;
          errorMessage = "Please enter a valid admin email address.";
        }
      }
    }
    
    if (!isValid) {
      setNotification({ message: errorMessage, type: "error" });
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: "", type: "" });

    // Final validation (step 4 - password)
    if (!formData.contact || !formData.password || !formData.confirm_password) {
      setNotification({ message: "Please fill in all required fields.", type: "error" });
      setLoading(false);
      return;
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
      console.log('Submitting setup data via IPC...');
      
      // Use IPC instead of HTTP fetch
      const result = await setupSchoolAndAdmin(formData);
      
      console.log('Setup result:', result);
      
      if (result.success) {
        setNotification({
          message: result.message || "School and admin created successfully!",
          type: "success"
        });

        // Move to activation after short delay
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to complete setup");
      }

    } catch (error) {
      console.error('Setup error:', error);
      setNotification({
        message: error.message || "Failed to complete setup. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="mb-4">School Basic Information</h3>
            
            <div className="mb-3 position-relative">
              <Home size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="School Name *"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 position-relative">
              <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="email"
                className="form-control ps-5"
                placeholder="School Email *"
                name="school_email"
                value={formData.school_email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4 position-relative">
              <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="tel"
                className="form-control ps-5"
                placeholder="School Contact *"
                name="school_contact"
                value={formData.school_contact}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 className="mb-4">School Location Details</h3>
            
            <div className="mb-3 position-relative">
              <MapPin size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="County *"
                name="county"
                value={formData.county}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Region *"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Town *"
                name="town"
                value={formData.town}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="GPS Address *"
                name="gps_address"
                value={formData.gps_address}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="mb-4">Admin Personal Information</h3>
            
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

            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Middle Name (Optional)"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Last Name *"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4 position-relative">
              <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="email"
                className="form-control ps-5"
                placeholder="Admin Email *"
                name="admin_email"
                value={formData.admin_email}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h3 className="mb-4">Admin Account Security</h3>
            
            <div className="mb-3 position-relative">
              <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="tel"
                className="form-control ps-5"
                placeholder="Admin Contact *"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="mb-4 position-relative">
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
          </>
        );

      default:
        return null;
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
          <span>
            {isElectron() ? 'Connected to Backend' : 'Connected to Internet'} 
            {!isElectron() && ' - All data saved to cloud database'}
          </span>
        </div>
      </div>

      <div className="row g-0 app-auth-wrapper">
        {/* Form Section */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
          <div className="app-auth-body mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={handleBack}
                disabled={loading || step === 1}
              >
                <ArrowLeft size={16} className="me-1" /> Back
              </button>
              
              <h2 className="auth-heading text-center mb-0 flex-grow-1">
                {step <= 2 ? "School Setup" : "Admin Setup"}
              </h2>
              
              <div style={{width: '100px'}}></div>
            </div>

            <p className="text-muted mb-4">
              Step {step} of 4
              <br />
              <small className="text-success">
                <Wifi size={12} className="me-1" />
                {isElectron() ? 'Connected - IPC Communication' : 'Connected - Real-time cloud save'}
              </small>
            </p>

            <form onSubmit={step < 4 ? handleNext : handleSubmit}>
              {renderStepContent()}

              <div className="mt-4">
                {step < 4 ? (
                  <button 
                    type="submit" 
                    className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    Next Step <ArrowRight size={18} className="ms-2" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating School & Admin...
                      </>
                    ) : "Complete Setup"}
                  </button>
                )}
              </div>
            </form>

            {/* Add Recover Account Link */}
            <div className="text-center mt-3">
              <small className="text-muted">
                Already registered?{" "}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/recover-account";
                  }}
                  className="text-primary text-decoration-none fw-medium"
                >
                  Recover School Account
                </a>
              </small>
            </div>

            <div className="mt-4">
              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> 
                  {isElectron() 
                    ? ' All data is saved locally and synced to cloud when online.'
                    : ' All data is saved directly to our secure cloud database.'}
                  You need to stay online throughout the setup process.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Background Side */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
          <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
            <h2 className="fw-bold mb-3 text-light">Complete Cloud Setup</h2>
            <p className="lead text-light mb-4">
              Create school and admin account in one process.
            </p>
            
            <div className="setup-progress mb-4">
              <div className="d-flex justify-content-center align-items-center">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="d-flex align-items-center">
                    <div className={`progress-step ${step >= stepNum ? 'active' : ''}`}>
                      <div className="step-circle">{stepNum}</div>
                      <div className="step-label">
                        {stepNum === 1 && "School"}
                        {stepNum === 2 && "Location"}
                        {stepNum === 3 && "Admin"}
                        {stepNum === 4 && "Security"}
                      </div>
                    </div>
                    {stepNum < 4 && <div className="progress-line"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="cloud-info mt-4">
              <div className="feature-item mb-3">
                <ShieldCheck size={24} className="mb-2" />
                <h5>Atomic Operation</h5>
                <p className="small mb-0">School and admin created together</p>
              </div>
              <div className="feature-item mb-3">
                <Wifi size={24} className="mb-2" />
                <h5>{isElectron() ? 'IPC Communication' : 'Cloud Storage'}</h5>
                <p className="small mb-0">
                  {isElectron() 
                    ? 'Fast local communication with Python'
                    : 'Saved to SQLiteCloud database'}
                </p>
              </div>
              <div className="feature-item">
                <CheckCircle size={24} className="mb-2" />
                <h5>No Race Conditions</h5>
                <p className="small mb-0">Eliminates concurrent setup issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}