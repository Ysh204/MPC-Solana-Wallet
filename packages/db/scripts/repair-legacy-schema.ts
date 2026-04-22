import { prismaClient } from "../index";

async function columnExists(columnName: string) {
  const rows = await prismaClient.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'User'
          AND column_name = $1
      ) AS "exists";
    `,
    columnName,
  );

  return rows[0]?.exists === true;
}

async function ensureRoleEnum() {
  await prismaClient.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'Role'
      ) THEN
        CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'CREATOR', 'FAN');
      END IF;
    END
    $$;
  `);
}

async function addMissingColumns() {
  await prismaClient.$executeRawUnsafe(`
    ALTER TABLE "public"."User"
      ADD COLUMN IF NOT EXISTS "phone" TEXT,
      ADD COLUMN IF NOT EXISTS "role" "public"."Role",
      ADD COLUMN IF NOT EXISTS "displayName" TEXT,
      ADD COLUMN IF NOT EXISTS "bio" TEXT,
      ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
  `);
}

async function backfillDisplayNames() {
  await prismaClient.$executeRawUnsafe(`
    UPDATE "public"."User"
    SET "displayName" = split_part("email", '@', 1)
    WHERE "displayName" IS NULL;
  `);
}

async function backfillPhones() {
  await prismaClient.$executeRawUnsafe(`
    WITH numbered AS (
      SELECT
        id,
        (7000000000 + ROW_NUMBER() OVER (ORDER BY "createdAt", id))::text AS generated_phone
      FROM "public"."User"
      WHERE "phone" IS NULL
    )
    UPDATE "public"."User" AS u
    SET "phone" = numbered.generated_phone
    FROM numbered
    WHERE u.id = numbered.id;
  `);
}

async function backfillRoles(hasIsAdminColumn: boolean) {
  if (hasIsAdminColumn) {
    await prismaClient.$executeRawUnsafe(`
      UPDATE "public"."User"
      SET "role" = CASE
        WHEN "isAdmin" = true THEN 'ADMIN'::"public"."Role"
        ELSE 'FAN'::"public"."Role"
      END
      WHERE "role" IS NULL;
    `);
  } else {
    await prismaClient.$executeRawUnsafe(`
      UPDATE "public"."User"
      SET "role" = 'FAN'::"public"."Role"
      WHERE "role" IS NULL;
    `);
  }

  const adminCandidates = await prismaClient.$queryRawUnsafe<Array<{ id: string }>>(`
    SELECT id
    FROM "public"."User"
    WHERE lower("email") = 'admin@example.com'
    LIMIT 1;
  `);

  if (adminCandidates.length > 0) {
    await prismaClient.$executeRawUnsafe(
      `
        UPDATE "public"."User"
        SET "role" = 'ADMIN'::"public"."Role"
        WHERE id = $1;
      `,
      adminCandidates[0].id,
    );
  }
}

async function enforceConstraints() {
  await prismaClient.$executeRawUnsafe(`
    ALTER TABLE "public"."User"
      ALTER COLUMN "role" SET DEFAULT 'FAN'::"public"."Role",
      ALTER COLUMN "role" SET NOT NULL,
      ALTER COLUMN "phone" SET NOT NULL;
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key"
    ON "public"."User"("phone");
  `);
}

async function printSummary() {
  const rows = await prismaClient.$queryRawUnsafe(`
    SELECT
      id,
      email,
      "phone",
      "role"::text AS role,
      "displayName",
      "publicKey"
    FROM "public"."User"
    ORDER BY "createdAt" ASC;
  `);

  console.log(JSON.stringify(rows, null, 2));
}

async function main() {
  const hasPhoneColumn = await columnExists("phone");

  if (hasPhoneColumn) {
    console.log("Legacy schema repair not needed: User.phone already exists.");
    await printSummary();
    return;
  }

  const hasIsAdminColumn = await columnExists("isAdmin");

  await ensureRoleEnum();
  await addMissingColumns();
  await backfillDisplayNames();
  await backfillPhones();
  await backfillRoles(hasIsAdminColumn);
  await enforceConstraints();

  console.log("Legacy schema repaired successfully.");
  await printSummary();
}

try {
  await main();
} finally {
  await prismaClient.$disconnect();
}
