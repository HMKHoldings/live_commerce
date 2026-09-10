import { spawn } from "node:child_process";

const processes = [];
const backendPort = Number(process.env.PORT || 3111);
const backendHealthUrl = "http://127.0.0.1:" + backendPort + "/api/health";

async function backendIsRunning() {
  try {
    const response = await fetch(backendHealthUrl, {
      signal: AbortSignal.timeout(1200),
    });
    return response.ok;
  } catch {
    return false;
  }
}

if (await backendIsRunning()) {
  console.log("Backend already running at http://127.0.0.1:" + backendPort);
} else {
  processes.push(
    spawn(
      process.execPath,
      ["--env-file-if-exists=.env.server", "backend/index.mjs"],
      { stdio: "inherit" },
    ),
  );
}

processes.push(
  spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--config",
      "frontend/vite.config.js",
      "--host",
      "0.0.0.0",
    ],
    { stdio: "inherit" },
  ),
);

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of processes) {
    if (!child.killed) child.kill();
  }

  process.exitCode = exitCode;
}

for (const child of processes) {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });

  child.on("exit", (code, signal) => {
    if (!stopping) stop(signal ? 1 : (code ?? 0));
  });
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());