use anchor_lang::Accounts;
use anchor_lang::context::Context;
use anchor_lang::{prelude::*};
use crate::state::{EscrowAccount, TimeInterval};
use crate::util::{minimum_balance, transfer_lamports};

pub fn invoke(
    ctx: Context<UpdateEscrowAccountContext>,
    escrow_lamports: u64,
    withdraw_lamports: u64,
    withdraw_interval: TimeInterval,
    withdraw_interval_step: u64,
) -> Result<()> {
    let owner = &ctx.accounts.owner;
    let mut escrow_account = &mut ctx.accounts.escrow_account;

    let available_lamports = escrow_account.to_account_info().get_lamports()
        .saturating_sub(minimum_balance::get(512));

    if escrow_lamports > available_lamports {
        let diff = escrow_lamports.saturating_sub(available_lamports);

        transfer_lamports::invoke(
            &owner.to_account_info(),
            &escrow_account.as_ref(),
            diff
        )?;
    } else if available_lamports > escrow_lamports {
        let diff = available_lamports.saturating_sub(escrow_lamports);

        **escrow_account.to_account_info().try_borrow_mut_lamports()? =
            escrow_account.to_account_info().lamports().saturating_sub(diff);

        **owner.to_account_info().try_borrow_mut_lamports()? =
            owner.to_account_info().lamports().saturating_add(diff);
    }

    escrow_account.lamports = escrow_lamports;
    escrow_account.withdraw_lamports = withdraw_lamports;
    escrow_account.withdraw_interval = withdraw_interval;
    escrow_account.withdraw_interval_step = withdraw_interval_step;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateEscrowAccountContext<'info> {
    #[account(
        mut,
        seeds=[b"escrow_account", owner.key.as_ref(), recipient.key.as_ref()],
        bump=escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK : no check necessary
    pub recipient: UncheckedAccount<'info>,
}