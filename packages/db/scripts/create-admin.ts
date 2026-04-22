import { prismaClient } from "../index";

type ParsedArgs = {
  email?: string;
  password?: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--email" && next) {
      parsed.email = next;
      i += 1;
      continue;
    }

    if (arg === "--password" && next) {
      parsed.password = next;
      i += 1;
      continue;
    }

  }

  return parsed;
}

function printUsage() {
  console.error(
    "Usage: bun run create-admin --email admin@example.com --password password123"
  );
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.email || !parsed.password) {
    printUsage();
    process.exit(1);
  }

  const email = parsed.email;
  const password = parsed.password;

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  const existingUser = await prismaClient.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isAdmin: true,
    },
  });

  if (existingUser) {
    console.error("A user with that email already exists.");
    console.error(JSON.stringify(existingUser, null, 2));
    process.exit(1);
  }

  const user = await prismaClient.user.create({
    data: {
      email,
      password,
      isAdmin: true,
    },
    select: {
      id: true,
      email: true,
      isAdmin: true,
    },
  });

  console.log("Admin created successfully:");
  console.log(JSON.stringify(user, null, 2));
}

try {
  await main();
} finally {
  await prismaClient.$disconnect();
}
