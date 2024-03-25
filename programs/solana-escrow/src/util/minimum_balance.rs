use anchor_lang::prelude::{Rent, SolanaSysvar};

pub fn get(space: usize) -> u64 {
    let rent = Rent::get().unwrap();
    rent.minimum_balance(space)
}