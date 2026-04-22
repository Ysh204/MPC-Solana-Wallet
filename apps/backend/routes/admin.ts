import { Router } from "express";
import { TSSCli } from "../../../packages/solana-mpc-tss/src/index";
import axios from "axios";
import { prismaClient } from "../../../packages/db/index";
import jwt from "jsonwebtoken";
import { CreateUserSchema, SignupSchema } from "../../../packages/common/inputs";
import { adminAuthMiddleware } from "../middleware";
import { NETWORK } from "../../../packages/common/solana";

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
    const { success, data } = SignupSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({
            message: "Incorrect credentials"
        });
        return;
    }

    const user = await prismaClient.user.findUnique({
        where: { email: data.email }
    });

    if (!user) {
        res.status(403).json({ message: "User not found" });
        return;
    }

    if (user.password !== data.password || !user.isAdmin) {
        res.status(403).json({ message: "Admin access required" });
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.ADMIN_JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token });
});

router.post("/create-user", adminAuthMiddleware, async (req, res) => {
    const { success, data } = CreateUserSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({ message: "Invalid input" });
        return;
    }

    const existingUser = await prismaClient.user.findUnique({
        where: { email: data.email },
        select: {
            email: true
        }
    });

    if (existingUser) {
        res.status(409).json({
            message: "A user with that email already exists.",
            field: "email"
        });
        return;
    }

    let user;

    try {
        user = await prismaClient.user.create({
            data: {
                email: data.email,
                password: data.password,
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
            const response = await axios.post(`${server}/create-user`, { userId: user.id });
            return response.data;
        }));

        const aggregatedPublicKey = cli.aggregateKeys(responses.map((response) => response.publicKey), MPC_THRESHOLD);

        await prismaClient.user.update({
            where: { id: user.id },
            data: { publicKey: aggregatedPublicKey.aggregatedPublicKey }
        });

        try {
            await cli.airdrop(aggregatedPublicKey.aggregatedPublicKey, 0.1);
        } catch (airdropError) {
            console.warn("Airdrop failed, wallet still created", airdropError);
        }

        res.json({
            message: "User created",
            user: {
                ...user,
                publicKey: aggregatedPublicKey.aggregatedPublicKey
            }
        });
    } catch (error) {
        console.error("Failed to create user with MPC nodes", error);
        await prismaClient.user.delete({ where: { id: user.id } });
        res.status(500).json({
            message: "Failed to create user's MPC wallet. Rolled back.",
            error: String(error)
        });
    }
});
