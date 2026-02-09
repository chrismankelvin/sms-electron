import { useState } from "react";
import { ArrowRight, Mail, Home, Key, AlertCircle, XCircle } from "lucide-react";
import Notification from "../../components/Notification";
import PageHelper from "../../components/PageHelper";
import "../../styles/global.css";
import "../../styles/school-details.css";

export default function AccountRecoveryPage({ onSuccess, isOnline }) {
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    school_name: "",
    school_email: "",
    admin_email: "",
    admin_password: "",
  });
  const [showDeactivateHelper, setShowDeactivateHelper] = useState(false);

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
                  You need an active internet connection to recover your account.
                </p>
                <p className="text-danger">
                  <strong>Please connect to the internet and try again.</strong>
                </p>
              </div>
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
    if (!formData.school_name || !formData.school_email || !formData.admin_email || !formData.admin_password) {
      setNotification({ message: "Please fill in all required fields.", type: "error" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.school_email) || !emailRegex.test(formData.admin_email)) {
      setNotification({ message: "Please enter valid email addresses.", type: "error" });
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: "", type: "" });

    try {
      // Example API call
      const response = await fetch("http://localhost:8000/account/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.detail || "Recovery failed");

      setNotification({ message: result.message, type: "success" });

      // Show helper to deactivate old computer
      setTimeout(() => setShowDeactivateHelper(true), 1000);
    } catch (err) {
      setNotification({ message: err.message || "Something went wrong.", type: "error" });
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

      <div className="row g-0 app-auth-wrapper">
        <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
          <div className="app-auth-body mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              {step === 2 && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </button>
              )}
              <h2 className="auth-heading text-center mb-0 flex-grow-1">Account Recovery</h2>
              {step === 2 && <div style={{ width: "80px" }}></div>}
            </div>

            <form className="auth-form" onSubmit={step === 1 ? handleNext : handleSubmit}>
              {step === 1 && (
                <>
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

                  <div className="mb-3 position-relative">
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

                  <div className="mb-4 position-relative">
                    <Key size={18} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                    <input
                      type="password"
                      className="form-control ps-5"
                      placeholder="Admin Password *"
                      name="admin_password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
                  >
                    Next Step <ArrowRight size={18} className="ms-2" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-center my-5">
                    <XCircle size={64} className="text-warning mb-3" />
                    <h3 className="mb-2">Deactivate Old Device</h3>
                    <p className="text-muted">
                      To continue, please deactivate the previous device using your account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? "Recovering..." : "Confirm Recovery"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Optional Background Side */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex flex-column justify-content-center align-items-center">
          <div className="auth-background-holder"></div>
          <div className="auth-background-mask"></div>
          <div className="auth-background-overlay bg-dark bg-opacity-50 p-3 p-lg-5 text-center">
            <h2 className="fw-bold mb-3 text-light">Secure Recovery</h2>
            <p className="lead text-light">
              Your account information is safely verified before recovery.
            </p>
          </div>
        </div>
      </div>

      <PageHelper
        open={showDeactivateHelper}
        title="Deactivate Previous Device"
        onClose={() => setShowDeactivateHelper(false)}
      >
        <p>
          Please log in to your previous device and deactivate the account, then continue here.
        </p>
        <button
          className="btn app-btn-primary w-100 mt-3"
          onClick={() => {
            setShowDeactivateHelper(false);
            onSuccess();
          }}
        >
          I have deactivated
        </button>
      </PageHelper>
    </div>
  );
}
