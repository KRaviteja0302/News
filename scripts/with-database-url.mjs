import { spawn } from "node:child_process";

const requiredDatabaseVariables = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

const hasHostedDatabase = requiredDatabaseVariables.every(
  (name) => process.env[name],
);

const databaseUrl = hasHostedDatabase
  ? `mysql://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(
      process.env.DB_PASSWORD,
    )}@${process.env.DB_HOST}:${process.env.DB_PORT}/${encodeURIComponent(
      process.env.DB_NAME,
    )}`
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "Database configuration is missing. Set DATABASE_URL or all GoDaddy DB_* variables.",
  );
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("No command was provided.");
  process.exit(1);
}

const child = spawn(command, args, {
  env: { ...process.env, DATABASE_URL: databaseUrl },
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
