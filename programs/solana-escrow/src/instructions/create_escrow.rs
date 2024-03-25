use anchor_lang::Accounts;
use anchor_lang::context::Context;
use anchor_lang::{prelude::*, solana_program::{system_program}};
use crate::error::SolanaEscrowError;
use crate::state::{EscrowAccount, TimeInterval};
use crate::util::transfer_lamports;

pub fn invoke(
    ctx: Context<CreateEscrowAccountContext>,
    escrow_lamports: u64,
    withdraw_lamports: u64,
    withdraw_interval: TimeInterval,
    withdraw_interval_step: u64,
) -> Result<()> {
    let owner = &ctx.accounts.owner;
    let recipient = &ctx.accounts.recipient;
    let mut escrow_account = &mut ctx.accounts.escrow_account;

    let clock = Clock::get()?;
    let timestamp: u64 = clock.unix_timestamp.try_into().unwrap();

    escrow_account.bump = ctx.bumps.escrow_account;
    escrow_account.created_at_ts = timestamp;
    escrow_account.owner = owner.key();
    escrow_account.recipient = recipient.key();
    escrow_account.lamports = escrow_lamports;
    escrow_account.withdraw_lamports = withdraw_lamports;
    escrow_account.withdraw_interval = withdraw_interval;
    escrow_account.withdraw_interval_step = withdraw_interval_step;

    transfer_lamports::invoke(
        &owner.to_account_info(),
        &escrow_account.as_ref(),
        escrow_lamports
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateEscrowAccountContext<'info> {
    #[account(
        init,
        payer=owner,
        space=512,
        seeds=[b"escrow_account", owner.key.as_ref(), recipient.key.as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK : no check necessary
    pub recipient: UncheckedAccount<'info>,

    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
}