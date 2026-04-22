import express from "express";
import { TSSCli } from 'solana-mpc-tss-lib/mpc';
import { NETWORK } from "common/solana";
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
loadEnvFile(join(currentDir, "../../packages/mpc-db/.env"));

const { prismaClient } = await import("mpc-db/client");

const cli = new TSSCli(NETWORK);

const app = express();
app.use(express.json());

async function getKeyShare(userId: string) {
    return prismaClient.keyShare.findFirst({
        where: { userId }
    });
}

app.post("/create-user", async (req, res) => {
    const {userId} = req.body;
    const participant = await cli.generate();
    await prismaClient.keyShare.create({
        data: {
            userId,
            publicKey: participant.publicKey,
            secretKey: participant.secretKey
        }
    })

    res.json({
        publicKey: participant.publicKey,
    })
})

app.post("/send/step-1", async (req, res) => {
    const {to, amount, userId, recentBlockhash} = req.body;
    const user = await getKeyShare(userId);
    if (!user) {
        res.status(403).json({
            message: "User not found"
        })
        return
    }

    const response = await cli.aggregateSignStepOne(
        user.secretKey,
        to,
        amount,
        req.body.memo, // Pass memo if present
        recentBlockhash
    );

    res.json({
        response
    })
})

app.post("/send/step-2", async (req, res) => {
    const {to, amount, userId, recentBlockhash, step1Response, allPublicNonces} = req.body;
    const user = await getKeyShare(userId);

    if (!user) {
        res.status(403).json({
            message: "User not found"
        })
        return
    }

    const response = await cli.aggregateSignStepTwo(
        step1Response,
        user.secretKey,
        to,
        amount,
        allPublicNonces,
        req.body.memo,
        recentBlockhash
    );

    res.json({
        response,
        publicKey: user.publicKey
    })
})

app.listen(3002);
