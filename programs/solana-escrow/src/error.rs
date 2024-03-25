use anchor_lang::error_code;

#[error_code]
pub enum SolanaEscrowError {
    /* create_escrow */

    /* withdraw_escrow */

    #[msg("escrow account must have enough lamports to honor the withdrawal and must also cover rent")]
    WithdrawEscrowAccountInsufficientLamports,

    #[msg("withdrawals can't occur before the defined time interval from the last withdrawal")]
    WithdrawEscrowAccountInvalidWithdrawalTimeInterval,
}