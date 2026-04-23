import { Router } from "express";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken";
import { SignupSchema, ProfileSchema, SendSchema } from "common/inputs";
import { authMiddleware } from "../middleware";
import { cli, MPC_SERVERS, MPC_THRESHOLD } from "./admin";
import axios from "axios";
import { NETWORK } from "common/solana";

const router = Router();

export default router;

// Sign in
router.post("/signin", async (req, res) => {
    const {success, data} = SignupSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({ message: "Incorrect credentials" })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { email: data.email }
    });

    if (!user) {
        res.status(403).json({ message: "User not found" })
        return;
    }

    if (user.password !== data.password) {
        res.status(403).json({ message: "Incorrect creds" })
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            publicKey: user.publicKey
        }
    });
});

// Get current user's profile
router.get("/profile", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findFirst({
        where: { id: req.userId },
        select: {
            id: true, email: true, displayName: true, bio: true,
            avatarUrl: true, publicKey: true, role: true, createdAt: true
        }
    });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ user });
});

// Update profile
router.put("/profile", authMiddleware, async (req, res) => {
    const { success, data } = ProfileSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const user = await prismaClient.user.update({
        where: { id: req.userId },
        data: {
            displayName: data.displayName,
            bio: data.bio,
            avatarUrl: data.avatarUrl
        },
        select: {
            id: true, displayName: true, bio: true, avatarUrl: true
        }
    });
    res.json({ user });
});


// Send SOL (General transfer from wallet page)
router.post("/send", authMiddleware, async (req, res) => {
    const { success, data } = SendSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(403).json({ message: "Your wallet is not set up" });
        return;
    }

    try {
        const blockhash = await cli.recentBlockHash();

        // MPC signing - Step 1
        const step1Responses = await Promise.all(MPC_SERVERS.map(async (server) => {
            const response = await axios.post(`${server}/send/step-1`, {
                to: data.to,
                amount: data.amount,
                userId: req.userId,
                recentBlockhash: blockhash
            })
            return response.data.response;
        }))

        // MPC signing - Step 2
        const step2Responses = await Promise.all(MPC_SERVERS.map(async (server, index) => {
            const response = await axios.post(`${server}/send/step-2`, {
                to: data.to,
                amount: data.amount,
                userId: req.userId,
                recentBlockhash: blockhash,
                step1Response: JSON.stringify(step1Responses[index]),
                allPublicNonces: step1Responses.map((r) => r.publicNonce)
            })
            return response.data;
        }))

        const partialSignatures = step2Responses.map((r) => r.response);
        const transactionDetails = {
            amount: data.amount,
            to: data.to,
            from: user.publicKey,
            network: NETWORK,
            memo: undefined,
            recentBlockhash: blockhash
        };

        const signature = await cli.aggregateSignaturesAndBroadcast(
            JSON.stringify(partialSignatures),
            JSON.stringify(transactionDetails),
            JSON.stringify({
                aggregatedPublicKey: user.publicKey,
                participantKeys: step2Responses.map((r) => r.publicKey),
                threshold: MPC_THRESHOLD
            })
        );

        res.json({ signature });
    } catch (e: any) {
        console.error("Send transaction failed", e);
        res.status(500).json({ message: "Transaction failed: " + (e?.message || "Unknown error") });
    }
});

// Wallet info
router.get("/wallet", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findFirst({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(404).json({ message: "Wallet not found" });
        return;
    }

    try {
        const balance = await cli.balance(user.publicKey);
        res.json({ publicKey: user.publicKey, balance, network: NETWORK });
    } catch (e) {
        console.error("Failed to fetch balance", e);
        res.json({ publicKey: user.publicKey, balance: 0, network: NETWORK });
    }
});

// Transactions
router.get("/transactions", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findFirst({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(404).json({ message: "Wallet not found" });
        return;
    }

    try {
        const { Connection, PublicKey, clusterApiUrl } = await import("@solana/web3.js");
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const pubkey = new PublicKey(user.publicKey);
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 20 });

        const transactions = signatures.map((sig) => ({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            err: sig.err ? true : false,
            memo: sig.memo || null
        }));

        res.json({ transactions });
    } catch (e) {
        console.error("Failed to fetch transactions", e);
        res.json({ transactions: [] });
    }
});
