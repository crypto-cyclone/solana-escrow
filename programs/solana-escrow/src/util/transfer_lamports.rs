use std::borrow::Borrow;
use anchor_lang::{prelude::*, solana_program::{system_instruction, program}};
use anchor_lang::solana_program::entrypoint::ProgramResult;
pub fn invoke<'a>(from: &AccountInfo<'a>, to: &AccountInfo<'a>, lamports: u64) -> ProgramResult {
    let ix = system_instruction::transfer(
        &from.key(),
        &to.key(),
        lamports,
    );
    program::invoke(
        &ix,
        &[
            from.to_account_info(),
            to.to_account_info(),
        ],
    )
}