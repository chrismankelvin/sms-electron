// activation.ipc.js
const { electron } = window;

export async function activateSystem({ schoolName, activationCode }) {
  try {
    const result = await electron.activation.request({
      action: "activate",
      school_name: schoolName,
      activation_code: activationCode,
    });
    return result;
  } catch (err) {
    console.error("Activation failed:", err);
    return { success: false, error: err.message };
  }
}

export async function getActivationInfo() {
  try {
    const result = await electron.activation.request({ action: "info" });
    return result || null;
  } catch (err) {
    console.error("Failed to get activation info:", err);
    return null;
  }
}

export default {
  activateSystem,
  getActivationInfo,
};
