import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const enginesDir = path.join(root, "node_modules", "@prisma", "engines");
const cliPath = path.join(root, "node_modules", "prisma", "build", "index.js");
const args = process.argv.slice(2);

function firstMatch(predicate) {
  if (!fs.existsSync(enginesDir)) {
    return null;
  }

  return fs.readdirSync(enginesDir).find(predicate) || null;
}

function isWindows() {
  return process.platform === "win32";
}

function isMac() {
  return process.platform === "darwin";
}

function getSchemaEngine() {
  return firstMatch((name) => {
    if (!name.startsWith("schema-engine-")) return false;
    if (isWindows()) return name.endsWith(".exe");
    return !name.endsWith(".exe");
  });
}

function getQueryEngineLibrary() {
  return firstMatch((name) => {
    if (!name.startsWith("libquery_engine-")) return false;
    if (isWindows()) return name.endsWith(".dll.node");
    if (isMac()) return name.endsWith(".dylib.node");
    return name.endsWith(".so.node");
  });
}

function getSchemaPath() {
  const flagIndex = args.findIndex((arg) => arg === "--schema");
  if (flagIndex !== -1 && args[flagIndex + 1]) {
    return path.resolve(root, args[flagIndex + 1]);
  }

  return null;
}

function loadEnvFile(envPath, env) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    if (!key || env[key] !== undefined) {
      continue;
    }

    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }
}

const env = { ...process.env };
const schemaEngine = getSchemaEngine();
const queryEngineLibrary = getQueryEngineLibrary();
const schemaPath = getSchemaPath();

loadEnvFile(path.join(root, ".env"), env);
if (schemaPath) {
  loadEnvFile(path.join(path.dirname(schemaPath), ".env"), env);
  loadEnvFile(path.join(path.dirname(path.dirname(schemaPath)), ".env"), env);
}

if (schemaEngine && !env.PRISMA_SCHEMA_ENGINE_BINARY) {
  env.PRISMA_SCHEMA_ENGINE_BINARY = path.join(enginesDir, schemaEngine);
}

if (queryEngineLibrary && !env.PRISMA_QUERY_ENGINE_LIBRARY) {
  env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(enginesDir, queryEngineLibrary);
}

const result = spawnSync(process.execPath, [cliPath, ...args], {
  stdio: "inherit",
  env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
