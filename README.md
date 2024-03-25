# Solana Escrow

The Solana Escrow is a robust, decentralized solution designed to facilitate escrow transactions on the Solana blockchain. This program allows users to securely lock funds until predetermined conditions are met, ensuring a trustless exchange between parties.

## Features

- **Escrow Account Creation**: Securely initialize escrow accounts with specific terms, including escrow amounts, withdrawal conditions, and time intervals.
- **Dynamic Escrow Updates**: Effortlessly modify the terms of existing escrow agreements, accommodating changes in the agreement conditions.
- **Secure Withdrawals**: Enable the designated recipient to withdraw the agreed amount from the escrow account, adhering to the predefined terms.
- **Escrow Account Closure**: Safely close and delete escrow accounts, returning any remaining assets to the account owner, ensuring a clean and efficient termination of the escrow agreement.

## Getting Started

### Prerequisites

- Install [Node.js](https://nodejs.org/en/)
- Install [Yarn](https://yarnpkg.com/) or npm
- Set up Solana CLI and Anchor CLI

### Installation

1. Clone the repository:
    ```
    git clone git@github.com:crypto-cyclone/solana-escrow.git
    ```

2. Navigate to the project directory:
    ```
    cd solana-escrow
    ```

3. Install the dependencies:
    ```
    yarn install
    ```

4. Build the program:
    ```
    anchor build
    ```

### Deployment

Deploy the Solana Escrow Program to your chosen Solana cluster with the following command:


## Usage

Ensure your project has `@coral-xyz/anchor` and `@solana/web3.js` installed to use these examples.

### Creating an Escrow Account

Initialize the escrow environment and create a new escrow account with specific terms.

```typescript
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { SolanaEscrow } from '../target/types/solana_escrow';

const provider = AnchorProvider.env();
const program = new Program<SolanaEscrow>(IDL, programId, provider);

const owner = Keypair.generate();
const recipient = new PublicKey('<recipient-public-key>');

const escrowAccount = Keypair.generate();
const transaction = new Transaction().add(
    program.instruction.createEscrow(
        new BN(escrowAmount),
        new BN(withdrawAmount),
        withdrawInterval,
        new BN(withdrawIntervalStep),
        {
            accounts: {
                escrowAccount: escrowAccount.publicKey,
                owner: owner.publicKey,
                recipient: recipient,
                systemProgram: SystemProgram.programId,
            },
            signers: [escrowAccount, owner],
        }
    )
);

await provider.sendAndConfirm(transaction, [owner, escrowAccount]);
```

### Withdrawing from an Escrow Account

Withdraw from an escrow account adhering to the agreed terms and conditions.

```typescript
const transaction = new Transaction().add(
    program.instruction.withdrawEscrow({
        accounts: {
            escrowAccount: escrowAccount.publicKey,
            owner: owner.publicKey,
            recipient: recipient,
            systemProgram: SystemProgram.programId,
        },
    })
);

await provider.sendAndConfirm(transaction, [recipient]);

```

### Updating an Escrow Account

Update the terms of an existing escrow account.

```typescript
const transaction = new Transaction().add(
    program.instruction.updateEscrow(
        new BN(updatedEscrowAmount),
        new BN(updatedWithdrawAmount),
        updatedWithdrawInterval,
        new BN(updatedWithdrawIntervalStep),
        {
            accounts: {
                escrowAccount: escrowAccount.publicKey,
                owner: owner.publicKey,
                recipient: recipient,
                systemProgram: SystemProgram.programId,
            },
        }
    )
);

await provider.sendAndConfirm(transaction, [owner]);

```

### Deleting an Escrow Account

Safely close and delete an escrow account, returning any remaining assets to the account owner.

```typescript
const transaction = new Transaction().add(
    program.instruction.deleteEscrow({
        accounts: {
            escrowAccount: escrowAccount.publicKey,
            owner: owner.publicKey,
            recipient: recipient,
        },
    })
);

await provider.sendAndConfirm(transaction, [owner]);
```

## License
This project is licensed under the MIT License.