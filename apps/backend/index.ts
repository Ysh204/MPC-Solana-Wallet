import express from "express";
import cors from "cors";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function loadEnvFile(path: string) {
  if (!existsSync(path)) {
    return;
  }

  const contents = readFileSync(path, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnvFile(join(currentDir, ".env"));
loadEnvFile(join(currentDir, "../../packages/db/.env"));

const [{ default: userRouter }, { default: adminRouter }] = await Promise.all([
  import("./routes/user"),
  import("./routes/admin"),
]);

const app = express()
app.use(cors())
app.use(express.json());

app.use("/user", userRouter);
app.use("/admin", adminRouter)

app.listen(process.env.PORT || 3000);

