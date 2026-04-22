# db

Prisma package for the main wallet database.

It stores wallet users, hashed login credentials, the aggregated Solana public key, and the admin flag used for wallet provisioning flows.

Useful commands from the repo root:

```bash
bun run prisma:studio
bun run create-admin --email admin@example.com --password password123
```
