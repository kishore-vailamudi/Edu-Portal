const { spawn } = require("child_process");
const path = require("path");

// Start Node.js backend
const nodeBackend = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
});

// Start Flask AI backend
const flaskBackend = spawn(
  "python",
  [path.join(__dirname, "..", "flask-ai", "app.py")],
  {
    stdio: "inherit",
    shell: true,
  }
);

// Handle process termination
process.on("SIGINT", () => {
  console.log("Stopping servers...");
  nodeBackend.kill();
  flaskBackend.kill();
  process.exit();
});

nodeBackend.on("close", (code) => {
  console.log(`Node.js backend exited with code ${code}`);
  flaskBackend.kill();
  process.exit(code);
});

flaskBackend.on("close", (code) => {
  console.log(`Flask AI backend exited with code ${code}`);
  nodeBackend.kill();
  process.exit(code);
});
