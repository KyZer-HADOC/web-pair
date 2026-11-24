import express from "express";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "node:url";
import path from "node:path";

import pairRouter from "./pair.js";
import qrRouter from "./qr.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 8000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

const pairingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many pairing attempts. Please try again later." },
});

app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "pair.html"));
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "KyZer Web Pair" });
});

app.use("/pair", pairingLimiter, pairRouter);
app.use("/qr", pairingLimiter, qrRouter);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`KyZer Web Pair listening on port ${PORT}`);
});

export default app;
