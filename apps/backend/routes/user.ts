import { Router } from "express";
import { prismaClient } from "../../../packages/db/index";
import jwt from "jsonwebtoken";
import { SignupSchema, SendSchema } from "../../../packages/common/inputs";
import { authMiddleware } from "../middleware";
import { cli, MPC_SERVERS, MPC_THRESHOLD } from "./admin";
import axios from "axios";
import { NETWORK } from "../../../packages/common/solana";

const router = Router();

export default router;

router.post("/signin", async (req, res) => {
    const { success, data } = SignupSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({ message: "Incorrect credentials" });
        return;
    }

    const user = await prismaClient.user.findUnique({
        where: { email: data.email }
    });

    if (!user) {
        res.status(403).json({ message: "User not found" });
        return;
    }

    if (user.password !== data.password) {
        res.status(403).json({ message: "Incorrect creds" });
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email } });
});

router.post("/send", authMiddleware, async (req, res) => {
    const { success, data } = SendSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const user = await prismaClient.user.findUnique({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(403).json({ message: "Your wallet is not set up" });
        return;
    }

    try {
        const blockhash = await cli.recentBlockHash();

        const step1Responses = await Promise.all(MPC_SERVERS.map(async (server) => {
            const response = await axios.post(`${server}/send/step-1`, {
                to: data.to,
                amount: data.amount,
                userId: req.userId,
                recentBlockhash: blockhash
            });
            return response.data.response;
        }));

        const step2Responses = await Promise.all(MPC_SERVERS.map(async (server, index) => {
            const response = await axios.post(`${server}/send/step-2`, {
                to: data.to,
                amount: data.amount,
                userId: req.userId,
                recentBlockhash: blockhash,
                step1Response: JSON.stringify(step1Responses[index]),
                allPublicNonces: step1Responses.map((response) => response.publicNonce)
            });
            return response.data;
        }));

        const partialSignatures = step2Responses.map((response) => response.response);
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
                participantKeys: step2Responses.map((response) => response.publicKey),
                threshold: MPC_THRESHOLD
            })
        );

        res.json({ signature });
    } catch (error: any) {
        console.error("Send transaction failed", error);
        res.status(500).json({ message: "Transaction failed: " + (error?.message || "Unknown error") });
    }
});

router.get("/wallet", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findUnique({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(404).json({ message: "Wallet not found" });
        return;
    }

    try {
        const balance = await cli.balance(user.publicKey);
        res.json({ publicKey: user.publicKey, balance, network: NETWORK });
    } catch (error) {
        console.error("Failed to fetch balance", error);
        res.json({ publicKey: user.publicKey, balance: 0, network: NETWORK });
    }
});

router.get("/transactions", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findUnique({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(404).json({ message: "Wallet not found" });
        return;
    }

    try {
        const { Connection, PublicKey, clusterApiUrl } = await import("@solana/web3.js");
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const publicKey = new PublicKey(user.publicKey);
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });

        const transactions = signatures.map((signature) => ({
            signature: signature.signature,
            slot: signature.slot,
            blockTime: signature.blockTime,
            confirmationStatus: signature.confirmationStatus,
            err: Boolean(signature.err),
            memo: signature.memo || null
        }));

        res.json({ transactions });
    } catch (error) {
        console.error("Failed to fetch transactions", error);
        res.json({ transactions: [] });
    }
});
