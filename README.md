# Solana MPC Wallet

A wallet-only Solana app built around multi-party computation (MPC). The frontend lets a user sign in, view their wallet, send SOL, and review recent transactions while wallet signing is coordinated through the backend and MPC node.

## Project Structure

### Apps
- `apps/fe` (Port `4000`): Landing page, sign-in flow, and wallet UI.
- `apps/backend` (Port `3000`): Auth and wallet API used by the frontend.
- `apps/mpc-backend` (Port `3002`): MPC node that stores key shares and participates in signing.

### Packages
- `packages/db`: Prisma schema for the main application database.
- `packages/mpc-db`: Prisma schema for MPC key-share storage.
- `packages/common`: Shared validation schemas and Solana network config.
- `packages/solana-mpc-tss`: MPC/TSS signing utilities used by the backend services.

## MPC Flow

No single service should own the full wallet private key. In local development, the backend talks to the MPC node, which stores key-share data in the MPC database and helps sign wallet actions.

- Main DB: stores the app user record and aggregated public key.
- MPC DB: stores the signing key share for the user.
- Frontend: never handles private keys directly.

## Getting Started

### 1. Start PostgreSQL

```bash
docker run -d --name postgres-db --restart unless-stopped -e POSTGRES_PASSWORD=password -p 5432:5432 -v pgdata:/var/lib/postgresql postgres
```

If you need a clean reset:

```bash
docker stop postgres-db
docker rm postgres-db
docker volume rm pgdata
docker run -d --name postgres-db --restart unless-stopped -e POSTGRES_PASSWORD=password -p 5432:5432 -v pgdata:/var/lib/postgresql postgres
```

Create the databases:

```bash
docker exec -it postgres-db psql -U postgres -c "CREATE DATABASE school_cms;"
docker exec -it postgres-db psql -U postgres -c "CREATE DATABASE mpc_db;"
```

### 2. Configure Environment Variables

`apps/backend/.env`

```env
PORT=3000
JWT_SECRET="super_secret_user_jwt"
ADMIN_JWT_SECRET="super_secret_admin_jwt"
```

`packages/db/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_cms?schema=public"
```

`packages/mpc-db/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mpc_db?schema=public"
```

### 3. Install Dependencies and Prepare Prisma

```bash
bun install

cd packages/db
bunx prisma generate
bunx prisma db push

cd ../mpc-db
bunx prisma generate
bunx prisma db push
node scripts/run-prisma.mjs db push --schema packages/db/prisma/schema.prisma


cd ../../
```

### 4. Open Prisma Studio

Main user database:

```bash
bun run prisma:studio
```

MPC key-share database:

```bash
bun run prisma:studio:mpc
```

Prisma Studio usually starts at `http://localhost:5555`.

### 5. Start the App

```bash
bun turbo run dev
```

## Local URLs

- `http://localhost:4000/`: Landing page and sign-in entry.
- `http://localhost:4000/signin`: Wallet sign-in page.
- `http://localhost:3000`: Backend API.
- `http://localhost:3002`: MPC backend.

## Using the Wallet

1. Open `http://localhost:4000/`.
2. Go to the sign-in page.
3. Sign in with an existing user account.
4. Open the wallet page to view the public key, balance, send SOL, and inspect recent transactions.

## Troubleshooting

### Cannot reach backend

Make sure the backend is running on `http://localhost:3000` and that `NEXT_PUBLIC_BACKEND_URL` points to the correct API base URL.

### Wallet not found

If a user exists in the main database but does not have an MPC wallet provisioned, wallet calls will fail. A working wallet account needs both:

- a user row in the main database
- a matching key share in the MPC database

### Prisma Studio exits immediately

Use the repo scripts instead of calling Bun's generated Prisma wrapper directly:

```bash
bun run prisma:studio
bun run prisma:studio:mpc
```
