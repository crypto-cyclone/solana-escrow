import {Keypair, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {getProgramFromIDl} from "../util/get-program-from-idl";
import {getEscrowPDA} from "../pda/escrow";
import {getProvider} from "@coral-xyz/anchor";

export function prepareDeleteEscrowOnArgument(encryptionEnabled: boolean, keypair: Keypair): (argv: any, argValues: any) => void {
    return async (argv, argValues) => {};
}

export function prepareDeleteEscrowArguments(): any[] {
    return [{name: "recipient", type: "string"}];
}

export function prepareDeleteEscrowAccounts(
    args: Record<string, any>,
    owner: PublicKey,
): Record<string, string> {
    const recipient = args['recipient'] as string;

    if (recipient == null) {
        throw new Error(`prepareDeleteEscrow argument recipient not found.`);
    }

    const [escrowPDA] = getEscrowPDA(
        owner,
        new PublicKey(recipient)
    );

    return {
        escrowAccount: escrowPDA.toBase58(),
        owner: owner.toBase58(),
        recipient: recipient
    }
}

export async function deleteEscrow(
    args: Record<string, any>,
    accounts: Record<string, string>,
    signers: [Keypair]
) {
    const program = getProgramFromIDl();

    const transaction = new Transaction()
        .add(
            await program.methods
                .deleteEscrow()
                .accounts({
                    escrowAccount: accounts['escrowAccount'],
                    owner: accounts['owner'],
                    recipient: accounts['recipient'],
                })
                .transaction()
        );

    await sendAndConfirmTransaction(
        getProvider().connection,
        transaction,
        signers
    )
        .catch((err) => console.log(`failed to execute destroyEscrow`, err))
        .then(() => console.log('executed destroyEscrow'));
}