import {PublicKey} from "@solana/web3.js";
import {getProgramFromIDl} from "../util/get-program-from-idl";
import {getEscrowPDA} from "../pda/escrow";

export async function getEscrowAccount(args: Record<string, any>) {
    const owner = args['owner'] as string;
    const recipient = args['recipient'] as string;

    try {
        const [escrowPDA] = getEscrowPDA(
            new PublicKey(owner),
            new PublicKey(recipient),
        );

        const program = getProgramFromIDl();

        await program.account.escrowAccount.fetch(escrowPDA)
            .then((acc) => console.log(acc))
            .catch(() => console.log(null));
    } catch (e) {
        console.log(null);
    }
}