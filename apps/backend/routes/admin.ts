import { Router } from "express";
import { TSSCli } from 'solana-mpc-tss-lib/mpc';
import axios from "axios";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken";
import { CreateUserSchema, SignupSchema } from "common/inputs";
import { adminAuthMiddleware } from "../middleware";
import { NETWORK } from "common/solana";

export const MPC_SERVERS = [
    "http://localhost:3002",
];

export const MPC_THRESHOLD = Math.max(1, MPC_SERVERS.length - 1);

export const cli = new TSSCli(NETWORK);

const router = Router();

export default router;

function isPrismaUniqueError(error: unknown): error is { code: string; meta?: { target?: string[] | string } } {
    return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

router.post("/signin", async (req, res) => {
    const {success, data} = SignupSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { email: data.email, role: "ADMIN" }
    });

    if (!user) {
        res.status(403).json({ message: "Admin account not found" })
        return;
    }

    if (user.password !== data.password) {
        res.status(403).json({ message: "Incorrect creds" })
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.ADMIN_JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token });
});

// Create a wallet user with an MPC-backed public key
router.post("/create-user", adminAuthMiddleware, async (req, res) => {
    const {success, data} = CreateUserSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({ message: "Invalid input" })
        return;
    }

    const existingUser = await prismaClient.user.findFirst({
        where: {
            OR: [
                { email: data.email },
                { phone: data.phone }
            ]
        },
        select: {
            email: true,
            phone: true
        }
    });

    if (existingUser) {
        const duplicateField = existingUser.email === data.email ? "email" : "phone";
        res.status(409).json({
            message: `A user with that ${duplicateField} already exists.`,
            field: duplicateField
        });
        return;
    }

    let user;

    try {
        user = await prismaClient.user.create({
            data: {
                email: data.email,
                password: data.password,
                phone: data.phone,
                displayName: data.displayName || data.email.split("@")[0],
            }
        });
    } catch (error) {
        if (isPrismaUniqueError(error)) {
            const target = Array.isArray(error.meta?.target) ? error.meta.target[0] : error.meta?.target;
            res.status(409).json({
                message: `A user with that ${target ?? "value"} already exists.`,
                field: target ?? null
            });
            return;
        }

        throw error;
    }

    try {
        const responses = await Promise.all(MPC_SERVERS.map(async (server) => {
            const response = await axios.post(`${server}/create-user`, { userId: user.id })
            return response.data;
        }))

        const aggregatedPublicKey = cli.aggregateKeys(responses.map((r) => r.publicKey), MPC_THRESHOLD);

        await prismaClient.user.update({
            where: {id: user.id},
            data: { publicKey: aggregatedPublicKey.aggregatedPublicKey }
        })

        try {
            await cli.airdrop(aggregatedPublicKey.aggregatedPublicKey, 0.1);
        } catch (airdropError) {
            console.warn("Airdrop failed, wallet still created", airdropError);
        }

        res.json({
            message: "Wallet user created",
            user: {
                ...user,
                publicKey: aggregatedPublicKey.aggregatedPublicKey
            }
        })
    } catch (error) {
        console.error("Failed to create user with MPC nodes", error);
        await prismaClient.user.delete({ where: {id: user.id} });
        res.status(500).json({
            message: "Failed to create user's MPC wallet. Rolled back.",
            error: String(error)
        });
    }
})

router.get("/users", adminAuthMiddleware, async (_req, res) => {
    const users = await prismaClient.user.findMany({
        where: { role: { not: "ADMIN" } },
        select: {
            id: true,
            email: true,
            displayName: true,
            publicKey: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    res.json({ users });
});
