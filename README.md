# MPC Solana Wallet

A wallet-first Solana project secured by MPC (multi-party computation). The app provisions user wallets, stores MPC key shares on signing nodes, and sends SOL on devnet without a single service ever holding the full private key.

## What this repo includes

- `apps/fe`: Next.js wallet UI on port `4000`
- `apps/backend`: Express API on port `3000` for auth, profile updates, wallet lookups, transfers, and admin wallet provisioning
- `apps/mpc-backend`: MPC signing node on port `3002` that stores one key share per user
- `packages/solana-mpc-tss`: Solana MPC/TSS signing library used by the backend and MPC node
- `packages/db`: Prisma schema for app users and wallet metadata
- `packages/mpc-db`: Prisma schema for MPC key shares
- `packages/common`: shared Zod validation and network config

## Current product scope

This repo has been trimmed down to wallet-only flows:

- admin provisions a wallet user
- user signs in to the dashboard
- user sees the aggregated public key and balance
- user sends SOL through the MPC signing flow
- user reviews recent transactions
- user updates wallet profile metadata

## MPC flow

1. An admin calls `POST /admin/create-user`.
2. Each MPC node generates and stores its own key share in `packages/mpc-db`.
3. The backend aggregates the resulting public keys and stores the combined public key on the user record.
4. When the user sends SOL, the backend asks MPC nodes for partial signatures.
5. The backend aggregates those signatures and broadcasts the final Solana transaction.

## Local setup

### 1. Install dependencies

```bash
bun install
```

### 2. Start PostgreSQL

```bash
docker run -d --name postgres-db --restart unless-stopped -e POSTGRES_PASSWORD=password -p 5432:5432 -v pgdata:/var/lib/postgresql postgres
```

Create two databases inside that container:

```bash
docker exec -it postgres-db psql -U postgres -c "CREATE DATABASE wallet_app;"
docker exec -it postgres-db psql -U postgres -c "CREATE DATABASE mpc_db;"
```

### 3. Configure environment variables

`apps/backend/.env`

```env
PORT=3000
JWT_SECRET="super_secret_user_jwt"
ADMIN_JWT_SECRET="super_secret_admin_jwt"
```

`packages/db/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/wallet_app?schema=public"
```

`packages/mpc-db/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mpc_db?schema=public"
```

### 4. Generate Prisma clients and push schemas

```bash
bunx prisma generate --schema packages/db/prisma/schema.prisma
bunx prisma db push --schema packages/db/prisma/schema.prisma

bunx prisma generate --schema packages/mpc-db/prisma/schema.prisma
bunx prisma db push --schema packages/mpc-db/prisma/schema.prisma
```

### 5. Create the first admin

```bash
bun run create-admin --email admin@example.com --password password123 --phone 1234567890 --display-name "Admin"
```

### 6. Start the apps

```bash
bun run dev
```

Default local ports:

- frontend: `http://localhost:4000`
- backend API: `http://localhost:3000`
- MPC node: `http://localhost:3002`

## Useful routes

### Admin

- `POST /admin/signin`
- `POST /admin/create-user`
- `GET /admin/users`

### User

- `POST /user/signin`
- `GET /user/profile`
- `PUT /user/profile`
- `GET /user/wallet`
- `POST /user/send`
- `GET /user/transactions`

## Notes

- The frontend is wired for Solana devnet.
- The Prisma schema still keeps legacy role enum values for compatibility with older records, but the active app surface is wallet-only.
- `apps/web` is still present in the monorepo, but the wallet app lives in `apps/fe`.
