import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "./generated/prisma";

function loadLocalDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const envPath = join(currentDir, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const envContents = readFileSync(envPath, "utf8");
  const databaseUrlLine = envContents
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("DATABASE_URL="));

  if (!databaseUrlLine) {
    return;
  }

  const rawValue = databaseUrlLine.slice("DATABASE_URL=".length).trim();
  process.env.DATABASE_URL = rawValue.replace(/^['"]|['"]$/g, "");
}

loadLocalDatabaseUrl();

export const prismaClient = new PrismaClient();
