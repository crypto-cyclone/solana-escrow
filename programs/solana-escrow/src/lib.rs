mod state;
mod error;
mod constant;
mod instructions;
mod util;

use anchor_lang::prelude::*;

use crate::instructions::*;
use crate::state::*;

declare_id!("ipThDHDJhCK9wXoBshZzLQZuGrkbXfvQWR2MMhmH4Uz");

#[program]
pub mod solana_escrow {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrowAccountContext>,
        escrow_lamports: u64,
        withdraw_lamports: u64,
        withdraw_interval: TimeInterval,
        withdraw_interval_step: u64,
    ) -> Result<()> {
        create_escrow::invoke(
            ctx,
            escrow_lamports,
            withdraw_lamports,
            withdraw_interval,
            withdraw_interval_step
        )
    }

    pub fn update_escrow(
        ctx: Context<UpdateEscrowAccountContext>,
        escrow_lamports: u64,
        withdraw_lamports: u64,
        withdraw_interval: TimeInterval,
        withdraw_interval_step: u64,
    ) -> Result<()> {
        update_escrow::invoke(
            ctx,
            escrow_lamports,
            withdraw_lamports,
            withdraw_interval,
            withdraw_interval_step
        )
    }

    pub fn withdraw_escrow(ctx: Context<WithdrawEscrowAccountContext>) -> Result<()> {
        withdraw_escrow::invoke(ctx)
    }

    pub fn delete_escrow(ctx: Context<DeleteEscrowAccountContext>) -> Result<()> {
        delete_escrow::invoke(ctx)
    }
}
