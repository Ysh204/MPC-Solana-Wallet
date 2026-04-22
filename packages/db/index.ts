import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "./generated/prisma";

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return;
  }

  try {
    const envFile = fs.readFileSync(new URL("./.env", import.meta.url), "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separator = trimmed.indexOf("=");
      if (separator === -1) {
        continue;
      }

      const key = trimmed.slice(0, separator).trim();
      if (key !== "DATABASE_URL") {
        continue;
      }

      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (value) {
        process.env.DATABASE_URL = value;
      }

      return;
    }
  } catch {}
}

function loadPrismaEngineLibrary() {
  if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
    return;
  }

  const candidates =
    process.platform === "win32"
      ? ["../../node_modules/@prisma/engines/query_engine-windows.dll.node"]
      : process.platform === "linux"
        ? ["../../node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node"]
        : [];

  for (const candidate of candidates) {
    const resolvedPath = fileURLToPath(new URL(candidate, import.meta.url));
    if (fs.existsSync(resolvedPath)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = resolvedPath;
      return;
    }
  }
}

loadDatabaseUrl();
loadPrismaEngineLibrary();

export const prismaClient = new PrismaClient();
