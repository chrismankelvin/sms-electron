import { useState } from "react";
import {
  DatabaseBackup,
  Cloud,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import PageHelper from "../../components/PageHelper";

export default function RestoreBackupPage() {
  const [step, setStep] = useState(1);
  const [restoreMethod, setRestoreMethod] = useState(null);
  const [backupFile, setBackupFile] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const lastBackup = {
    date: "2025-01-12 14:32",
    commit: "a8f9c2e",
  };

  return (
    <div className="app-login">
      <div className="app-auth-wrapper">
        <div className="auth-main-col p-5 auth-form">

          {/* STEP INDICATOR */}
          <div className="step-indicator mb-4">
            <span className={step === 1 ? "active" : ""}>1</span>
            <span className={step === 2 ? "active" : ""}>2</span>
            <span className={step === 3 ? "active" : ""}>3</span>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="auth-heading mb-3">
                <ShieldCheck size={22} /> Restore Backup
              </h2>

              <input className="form-control mb-3" placeholder="School Name" />
              <input className="form-control mb-3" placeholder="School Email" />
              <input className="form-control mb-3" placeholder="Admin Email" />
              <input
                type="password"
                className="form-control mb-4"
                placeholder="Admin Password"
              />

              <button
                className="app-btn-primary w-100"
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="auth-heading mb-3">
                <DatabaseBackup size={22} /> Select Restore Method
              </h2>

              <div
                className={`restore-option ${
                  restoreMethod === "local" ? "selected" : ""
                }`}
                onClick={() => setRestoreMethod("local")}
              >
                <HardDrive size={20} />
                <span>Restore from Local Backup</span>
              </div>

              {restoreMethod === "local" && (
                <input
                  type="file"
                  className="form-control my-3"
                  onChange={(e) => setBackupFile(e.target.files[0])}
                />
              )}

              <div
                className={`restore-option ${
                  restoreMethod === "online" ? "selected" : ""
                }`}
                onClick={() => {
                  setRestoreMethod("online");
                  setStep(3);
                }}
              >
                <Cloud size={20} />
                <span>Restore from Cloud Backup</span>
              </div>

              {restoreMethod === "local" && (
                <button className="app-btn-primary w-100 mt-3">
                  Restore Backup
                </button>
              )}

              <p
                className="help-link mt-4"
                onClick={() => setShowHelp(true)}
              >
                Need help restoring backups?
              </p>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="auth-heading mb-3">
                <Cloud size={22} /> Online Restore
              </h2>

              <div className="backup-card mb-4">
                <p>
                  <strong>Last Backup</strong>
                  <br />
                  {lastBackup.date}
                </p>
                <p>
                  <strong>Latest Commit</strong>
                  <br />
                  {lastBackup.commit}
                </p>
              </div>

              <button className="app-btn-primary w-100">
                Restore This Backup
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAGE HELPER */}
      <PageHelper
        open={showHelp}
        title="Restore Backup Help"
        onClose={() => setShowHelp(false)}
      >
        <p>
          You can restore your school data using either a local backup
          file or a cloud backup linked to your activation.
        </p>
        <ul>
          <li>Local restore requires a valid backup file</li>
          <li>Cloud restore uses your latest saved commit</li>
          <li>Admin verification is required</li>
        </ul>
      </PageHelper>
    </div>
  );
}
