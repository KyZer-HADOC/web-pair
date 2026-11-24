import { readFile } from "node:fs/promises";
import { Storage } from "megajs";

export async function upload(filePath, fileName) {
    const email = process.env.MEGA_EMAIL;
    const password = process.env.MEGA_PASSWORD;

    if (!email || !password) {
        throw new Error("MEGA_EMAIL and MEGA_PASSWORD must be set in the service environment.");
    }

    const contents = await readFile(filePath);
    if (!contents.length) {
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
            size: contents.length,
        }, contents).complete;

        return await uploadedFile.link();
    } finally {
        storage.close();
    }
}
