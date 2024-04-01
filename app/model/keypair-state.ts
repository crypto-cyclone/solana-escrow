import {Keypair} from "@solana/web3.js";

export class KeypairState {
    keypair: Keypair | undefined

    private constructor(keypairStateInterface: KeypairStateInterface) {
        Object.assign(this, keypairStateInterface);
    }

    static factory(keypairStateInterface: KeypairStateInterface) {
        return new KeypairState(keypairStateInterface);
    }
}

export interface KeypairStateInterface {
    keypair: Keypair | undefined,
}