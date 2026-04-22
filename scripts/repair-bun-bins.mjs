import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const wrappers = [
  {
    binPath: path.join(root, "node_modules", ".bin", "prisma"),
    content: `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const enginesDir = path.join(__dirname, "..", "@prisma", "engines");

function firstMatch(predicate) {
  if (!fs.existsSync(enginesDir)) {
    return null;
  }

  return fs.readdirSync(enginesDir).find(predicate) || null;
}

if (!process.env.PRISMA_SCHEMA_ENGINE_BINARY) {
  const schemaEngine = firstMatch((name) => {
    if (!name.startsWith("schema-engine-")) return false;
    if (process.platform === "win32") return name.endsWith(".exe");
    if (process.platform === "darwin") return !name.endsWith(".exe");
    return !name.endsWith(".exe");
  });

  if (schemaEngine) {
    process.env.PRISMA_SCHEMA_ENGINE_BINARY = path.join(enginesDir, schemaEngine);
  }
}

if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
  const queryLibrary = firstMatch((name) => {
    if (!name.startsWith("libquery_engine-")) return false;
    if (process.platform === "win32") return name.endsWith(".dll.node");
    if (process.platform === "darwin") return name.endsWith(".dylib.node");
    return name.endsWith(".so.node");
  });

  if (queryLibrary) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(enginesDir, queryLibrary);
  }
}

const cliPath = path.join(__dirname, "..", "prisma", "build", "index.js");
const result = childProcess.spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
`,
  },
];

for (const { binPath, content } of wrappers) {
  if (!fs.existsSync(binPath)) {
    continue;
  }

  fs.writeFileSync(binPath, content, "utf8");

  try {
    fs.chmodSync(binPath, 0o755);
  } catch {}
}
