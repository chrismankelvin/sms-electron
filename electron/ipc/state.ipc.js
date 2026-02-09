// state.ipc.js
const { electron } = window;

export async function getActivationStatus() {
  try {
    const result = await electron.activation.request({ action: "status" });
    return result || { activated: false, machine_fingerprint: null, school_name: null };
  } catch (err) {
    console.error("Failed to get activation status:", err);
    return { activated: false, machine_fingerprint: null, school_name: null };
  }
}

export async function deactivateSystem() {
  try {
    const result = await electron.activation.request({ action: "deactivate" });
    return result;
  } catch (err) {
    console.error("Failed to deactivate system:", err);
    return { success: false, error: err.message };
  }
}

export async function getMachineFingerprint() {
  try {
    const fp = await electron.system.getFingerprint();
    return fp;
  } catch (err) {
    console.error("Failed to get machine fingerprint:", err);
    return null;
  }
}

export default {
  getActivationStatus,
  deactivateSystem,
  getMachineFingerprint,
};
