import {Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction} from "@solana/web3.js";
import {getProgramFromIDl} from "../util/get-program-from-idl";
import BN from "bn.js";
import {getEscrowPDA} from "../pda/escrow";
import {getProvider} from "@coral-xyz/anchor";

export function prepareCreateEscrowOnArgument(encryptionEnabled: boolean, keypair: Keypair): (argv: any, argValues: any) => void {
    return async (argv, argValues) => {};
}

export function prepareCreateEscrowArguments(): any[] {
    return [{name: "recipient", type: "string"}];
}

export function prepareCreateEscrowAccounts(
    args: Record<string, any>,
    owner: PublicKey,
): Record<string, string> {
    const recipient = args['recipient'] as string;

    if (recipient == null) {
        throw new Error(`prepareCreateEscrow argument recipient not found.`);
    }

    const [escrowPDA] = getEscrowPDA(
        owner,
        new PublicKey(recipient)
    );

    return {
        escrowAccount: escrowPDA.toBase58(),
        owner: owner.toBase58(),
        recipient: recipient,
        systemProgram: SystemProgram.programId.toBase58()
    }
}

export async function createEscrow(
    args: Record<string, any>,
    accounts: Record<string, string>,
    signers: [Keypair]
) {
    const program = getProgramFromIDl();

    const escrowLamports: number = args['escrowLamports'] as number;
    const withdrawLamports: number = args['withdrawLamports'] as number;
    const withdrawInterval: string = args['withdrawInterval'] as string;
    const withdrawIntervalStep: number = args['withdrawIntervalStep'] as number;

    const withdrawIntervalObject: any = {};
    withdrawIntervalObject[withdrawInterval] = {};

    const transaction = new Transaction()
        .add(
            await program.methods
                .createEscrow(
                    new BN(escrowLamports),
                    new BN(withdrawLamports),
                    withdrawIntervalObject,
                    new BN(withdrawIntervalStep)
                )
                .accounts({
                    escrowAccount: accounts['escrowAccount'],
                    owner: accounts['owner'],
                    recipient: accounts['recipient'],
                    systemProgram: accounts['systemProgram']
                })
                .transaction()
        );

    await sendAndConfirmTransaction(
        getProvider().connection,
        transaction,
        signers
    )
        .catch((err) => console.log(`failed to execute createEscrow`, err))
        .then(() => console.log('executed createEscrow'));
}