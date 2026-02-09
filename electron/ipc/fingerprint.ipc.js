const { ipcMain } = require("electron");
const { execFile } = require("child_process");
const path = require("path");

const CLI_PATH = path.join(__dirname, "../../backend/app/activation/fingerprint_cli.py");

function runPythonAction(action, arg) {
  return new Promise((resolve, reject) => {
    const args = arg ? [action, arg] : [action];
    execFile("python3", [CLI_PATH, ...args], (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e.message);
      }
    });
  });
}

ipcMain.handle("fingerprint-get", async () => runPythonAction("get"));
ipcMain.handle("fingerprint-existing", async () => runPythonAction("existing"));
ipcMain.handle("fingerprint-reset", async () => runPythonAction("reset"));
ipcMain.handle("fingerprint-info", async (event, deviceId) => runPythonAction("info", deviceId));
