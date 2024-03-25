use anchor_lang::{prelude::*};
use crate::state::EscrowAccount;

pub fn invoke(ctx: Context<DeleteEscrowAccountContext>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteEscrowAccountContext<'info> {
    #[account(
        mut,
        seeds=[b"escrow_account", owner.key.as_ref(), recipient.key.as_ref()],
        bump=escrow_account.bump,
        close=owner
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    /// CHECK : no check necessary
    pub recipient: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,
}