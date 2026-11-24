import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Storage } from "megajs";

async function uploadBuffer(buffer, fileName) {
    const email = process.env.MEGA_EMAIL;
    const password = process.env.MEGA_PASSWORD;

    if (!email || !password) {
        throw new Error("MEGA_EMAIL and MEGA_PASSWORD must be set in the service environment.");
    }
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error("Cannot upload an empty session file.");
    }

    const storage = await new Storage({
        email,
        password,
        keepalive: false,
    }).ready;

    try {
        const uploadedFile = await storage.upload({
            name: fileName,
            size: buffer.length,
        }, buffer).complete;

        return await uploadedFile.link();
    } finally {
        storage.close();
    }
}

export async function upload(filePath, fileName) {
    const contents = await readFile(filePath);
    return uploadBuffer(contents, fileName);
}

export async function uploadSessionFolder(folderPath, fileName) {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const files = {};

    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
        const safeName = path.basename(entry.name);
        const contents = await readFile(path.join(folderPath, safeName));
        files[safeName] = contents.toString("base64");
    }

    if (!files["creds.json"]) {
        throw new Error("Baileys session is missing creds.json.");
    }

    const bundle = {
        format: "kyzer-baileys-multifile-session",
        version: 1,
        createdAt: new Date().toISOString(),
        files,
    };

    return uploadBuffer(
        Buffer.from(JSON.stringify(bundle), "utf8"),
        fileName,
    );
}
