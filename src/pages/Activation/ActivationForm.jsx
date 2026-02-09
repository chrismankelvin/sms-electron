// import { useState } from "react";
// import { activateSystem } from "../../services/api.service";

// function ActivationForm({ onActivated }) {
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     setLoading(true);
//     setError("");

//     const result = await activateSystem(code);

//     if (result.success) {
//       onActivated();
//     } else {
//       setError(result.message || "Activation failed");
//     }

//     setLoading(false);
//   };

//   return (
//     <div>
//       <h2>System Activation</h2>

//       <input
//         placeholder="Enter activation code"
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//       />

//       <button onClick={submit} disabled={loading}>
//         Activate
//       </button>

//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }

// export default ActivationForm;



import { useState } from "react";
import { KeyRound, Cpu, HelpCircle } from "lucide-react";
import Notification from "../../components/Notification";
import PageHelper from "../../components/PageHelper";
import "../../styles/school-details.css";
import "../../styles/global.css";

export default function ActivationPage() {
  const [formData, setFormData] = useState({
    manufacturerCode: "",
    activationCode: "",
  });
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.manufacturerCode || !formData.activationCode) {
      setNotification({
        message: "Please enter both Manufacturer Code and Activation Code.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // Simulate activation
    setTimeout(() => {
      setLoading(false);
      setNotification({
        message: "Activation successful! Welcome to SMS.",
        type: "success",
      });
      console.log("Activation Data:", formData);
    }, 1200);
  };

  return (
    <div className="app app-login p-0">
      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <div className="row g-0 app-auth-wrapper">
        {/* Form Section */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
          <div className="app-auth-body mx-auto">
            <h2 className="auth-heading text-center mb-4">
              Activate School Management System
            </h2>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Manufacturer Code */}
              <div className="mb-3 position-relative">
                <Cpu
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Manufacturer Code"
                  name="manufacturerCode"
                  value={formData.manufacturerCode}
                  onChange={handleChange}
                />
              </div>

              {/* Activation Code */}
              <div className="mb-4 position-relative">
                <KeyRound
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Activation Code"
                  name="activationCode"
                  value={formData.activationCode}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn app-btn-primary w-100 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? "Activating..." : "Activate System"}
              </button>
            </form>

            {/* Help Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                className="btn btn-link d-inline-flex align-items-center gap-1 text-muted"
                onClick={() => setShowHelp(true)}
              >
                <HelpCircle size={16} />
                How do I get my activation code?
              </button>
            </div>
          </div>
        </div>

        {/* Background Side */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
          <div className="auth-background-overlay bg-dark bg-opacity-50 p-5 text-center">
            <h2 className="fw-bold text-light">System Activation</h2>
            <p className="lead text-light">
              Secure your installation before continuing.
            </p>
          </div>
        </div>

        {/* Help Modal */}
        <PageHelper
          open={showHelp}
          title="How to Get Your Activation Code"
          onClose={() => setShowHelp(false)}
        >
          <p>
            To activate the <strong>School Management System</strong>, you need a
            valid <strong>Activation Code</strong> issued by PHASH-C.
          </p>
          <ul>
            <li>Purchase the School Management System from <strong>PHASH-C</strong></li>
            <li>Provide your device’s <strong>Manufacturer Code</strong></li>
            <li>An activation code will be generated and assigned to your system</li>
          </ul>
          <p>
            If you need assistance or have misplaced your activation details, please
            contact our support team:
          </p>
          <p><a href="mailto:support@phash-c.com">support@phash-c.com</a></p>
          <p><a href="mailto:support@phash-c.com">Restore Activation Code</a></p>
        </PageHelper>
      </div>
    </div>
  );
}
