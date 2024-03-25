use anchor_lang::prelude::*;

declare_id!("ipThDHDJhCK9wXoBshZzLQZuGrkbXfvQWR2MMhmH4Uz");

#[program]
pub mod solana_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
