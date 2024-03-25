use anchor_lang::{prelude::*};

#[account]
pub struct EscrowAccount {
    pub bump: u8,
    pub owner: Pubkey,
    pub recipient: Pubkey,
    pub lamports: u64,
    pub withdraw_lamports: u64,
    pub withdraw_interval: TimeInterval,
    pub withdraw_interval_step: u64,
    pub created_at_ts: u64,
    pub last_withdrawal_ts: u64,
}

#[derive(PartialEq, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum TimeInterval {
    Second,
    Minute,
    Hour,
    Day,
}