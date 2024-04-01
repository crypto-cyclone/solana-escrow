use std::cmp::{max, min};
use anchor_lang::Accounts;
use anchor_lang::context::Context;
use anchor_lang::{prelude::*, solana_program::{system_program}};
use crate::constant::{SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE};
use crate::error::SolanaEscrowError;
use crate::state::{EscrowAccount, TimeInterval};
use crate::util::minimum_balance;

pub fn invoke(ctx: Context<WithdrawEscrowAccountContext>) -> Result<()> {
    let recipient = &ctx.accounts.recipient;
    let escrow_account = &mut ctx.accounts.escrow_account;

    let clock = Clock::get()?;
    let timestamp: u64 = clock.unix_timestamp.try_into().unwrap();

    let available_lamports = escrow_account.to_account_info().get_lamports()
        .saturating_sub(minimum_balance::get(512));

    let transfer_lamports: u64 = min(escrow_account.withdraw_lamports, available_lamports);

    require!(
        available_lamports > 0,
        SolanaEscrowError::WithdrawEscrowAccountInsufficientLamports
    );

    require!(
        escrow_account.lamports >= transfer_lamports,
        SolanaEscrowError::WithdrawEscrowAccountInsufficientLamports
    );

    let validation_ts = match escrow_account.withdraw_interval {
        TimeInterval::Second => {
            let step_seconds = escrow_account.withdraw_interval_step;
            escrow_account.last_withdrawal_ts.saturating_add(step_seconds)
        }
        TimeInterval::Minute => {
            let step_seconds = escrow_account.withdraw_interval_step.saturating_mul(SECONDS_PER_MINUTE);
            escrow_account.last_withdrawal_ts.saturating_add(step_seconds)
        }
        TimeInterval::Hour => {
            let step_seconds = escrow_account.withdraw_interval_step.saturating_mul(SECONDS_PER_HOUR);
            escrow_account.last_withdrawal_ts.saturating_add(step_seconds)
        }
        TimeInterval::Day => {
            let step_seconds = escrow_account.withdraw_interval_step.saturating_mul(SECONDS_PER_DAY);
            escrow_account.last_withdrawal_ts.saturating_add(step_seconds)
        }
    };

    require!(
        timestamp > validation_ts,
        SolanaEscrowError::WithdrawEscrowAccountInvalidWithdrawalTimeInterval
    );

    **escrow_account.to_account_info().try_borrow_mut_lamports()? =
        escrow_account.to_account_info().lamports().saturating_sub(transfer_lamports);

    **recipient.to_account_info().try_borrow_mut_lamports()? =
        recipient.to_account_info().lamports().saturating_add(transfer_lamports);

    escrow_account.last_withdrawal_ts = timestamp;
    escrow_account.lamports = max(0, escrow_account.lamports.saturating_sub(transfer_lamports));

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawEscrowAccountContext<'info> {
    #[account(
        mut,
        seeds=[b"escrow_account", owner.key.as_ref(), recipient.key.as_ref()],
        bump=escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    /// CHECK : no check necessary
    pub owner: UncheckedAccount<'info>,

    #[account(mut)]
    pub recipient: Signer<'info>,

    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
}