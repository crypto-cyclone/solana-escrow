import {Keypair} from "@solana/web3.js";
import * as fs from "fs";

export function loadKeypairFromFile(keypairPath: string): Keypair | undefined {
    try {
        const secretKeyString = fs.readFileSync(keypairPath, { encoding: 'utf8' });
        const secretKeyUint8Array = new Uint8Array(JSON.parse(secretKeyString));

        return Keypair.fromSecretKey(secretKeyUint8Array);
    } catch (err) {
        console.error(`Failed to load keypair from ${keypairPath}`);
    }

    return null;
}