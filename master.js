import { spawn } from "child_process";
import pidusage from "pidusage";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let child = null;
let monitor = null;

const CPU_THRESHOLD = 70;
const CHECK_INTERVAL = 5000;

const startServer = () => {
  child = spawn("node", [path.join(__dirname, "server.js")], {
    stdio: ["inherit", "inherit", "inherit", "ipc"], // ipc optional unless you need message passing
  });

  console.log(` Server started (PID: ${child.pid})`);

  // Restart automatically on unexpected exit
  child.on("exit", (code, signal) => {
    console.log(
      ` Server stopped (code: ${code}, signal: ${signal}). Restarting...`
    );
    stopMonitor();
    setTimeout(startServer, 1000);
  });
};

const startMonitor = () => {
  if (monitor) return; // prevent multiple intervals

  monitor = setInterval(async () => {
    if (!child || child.killed) return;

    try {
      const stats = await pidusage(child.pid);
      const cpu = stats.cpu.toFixed(2);
      // console.log(`CPU: ${cpu}%`);

      if (stats.cpu > CPU_THRESHOLD) {
        console.warn(` CPU > ${CPU_THRESHOLD}%. Restarting server...`);
        child.kill("SIGTERM");
      }
    } catch (err) {
      // Happens when process already exited
      if (err.code !== "ENOENT") {
        console.error("pidusage error:", err.message);
      }
    }
  }, CHECK_INTERVAL);
};

const stopMonitor = () => {
  if (monitor) {
    clearInterval(monitor);
    monitor = null;
  }
  pidusage.clear(); // Clear internal usage stats cache
};

process.on("SIGINT", () => {
  console.log("Master received SIGINT, shutting down...");
  stopMonitor();
  if (child) child.kill("SIGTERM");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Master received SIGTERM, shutting down...");
  stopMonitor();
  if (child) child.kill("SIGTERM");
  process.exit(0);
});

startServer();
startMonitor();

