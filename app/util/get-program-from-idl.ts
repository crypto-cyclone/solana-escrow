import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaEscrow } from "../../target/types/solana_escrow";

export function getProgramFromIDl(): Program<SolanaEscrow> {
    return anchor.workspace.SolanaEscrow as Program<SolanaEscrow>;
}