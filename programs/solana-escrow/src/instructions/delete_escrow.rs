use anchor_lang::{prelude::*};
use crate::state::EscrowAccount;

pub fn invoke(_ctx: Context<DeleteEscrowAccountContext>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteEscrowAccountContext<'info> {
    #[account(
        mut,
        seeds=[b"escrow_account", owner.key.as_ref(), escrow_account.recipient.as_ref()],
        bump=escrow_account.bump,
        close=owner
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,
}