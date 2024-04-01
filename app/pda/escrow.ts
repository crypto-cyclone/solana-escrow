import * as anchor from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";
import {getProgramFromIDl} from "../util/get-program-from-idl";

export function getEscrowPDA(
    owner: anchor.web3.PublicKey,
    recipient: anchor.web3.PublicKey,
) {
    const program = getProgramFromIDl();

    return PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("escrow_account"),
            owner.toBytes(),
            recipient.toBytes(),
        ],
        program.programId
    );
}