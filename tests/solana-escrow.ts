import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaEscrow } from "../target/types/solana_escrow";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction, Keypair,
} from "@solana/web3.js";
import {expect} from "chai";
import BN from "bn.js";
import * as bs58 from 'bs58';

describe("solana-escrow", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;

  const program = anchor.workspace.SolanaEscrow as Program<SolanaEscrow>;

  const owner = anchor.web3.Keypair.generate();
  const recipient = anchor.web3.Keypair.generate();

  const FEE_RENT_CREATE_ESCROW = 4454400;
  const FEE_TX_CREATE_ESCROW = 5000;
  const FEE_TX_UPDATE_ESCROW = 5000;
  const FEE_TX_WITHDRAW_ESCROW = 5000;
  const FEE_TX_DELETE_ESCROW = 5000;

  before(async() => {
    await airdropToActors([owner.publicKey, recipient.publicKey]);

    // delay until (32 blocks 32 * ~400ms = 12.8s)
    await delay(30000);
  })

  it("it creates escrow", async () => {
    const [escrowAccount, escrowBump] = getEscrowAccountPDA(
        owner.publicKey,
        recipient.publicKey
    );

    const ownerLamports = await getLamports(owner.publicKey);

    await createEscrowAccount(
        owner,
        recipient.publicKey,
        10,
        5,
        { minute: {} },
        1
    );

    const escrowAccountUpdate =
        await program.account.escrowAccount.fetch(escrowAccount);

    const ownerLamportsUpdate = await getLamports(owner.publicKey);

    expect(escrowAccountUpdate.bump).to.be.eq(escrowBump);
    expect(Array.from(escrowAccountUpdate.owner.toBytes())).to.have.same.members(Array.from(owner.publicKey.toBytes()));
    expect(Array.from(escrowAccountUpdate.recipient.toBytes())).to.have.same.members(Array.from(recipient.publicKey.toBytes()));
    expect(escrowAccountUpdate.lamports.toNumber()).to.be.eq(10);
    expect(escrowAccountUpdate.withdrawIntervalStep.toNumber()).to.be.eq(1);
    expect(escrowAccountUpdate.withdrawLamports.toNumber()).to.be.eq(5);
    expect(escrowAccountUpdate.withdrawInterval.minute).to.not.be.undefined;
    expect(escrowAccountUpdate.createdAtTs.toNumber()).to.be.gt(0);
    expect(escrowAccountUpdate.lastWithdrawalTs.toNumber()).to.be.eq(0);

    expect(ownerLamportsUpdate).to.be.eq(ownerLamports - 10 - FEE_TX_CREATE_ESCROW - FEE_RENT_CREATE_ESCROW);

    await delay(1000);
  });

  it("it withdraws escrow", async () => {
    const [escrowAccount, escrowBump] = getEscrowAccountPDA(
        owner.publicKey,
        recipient.publicKey
    );

    const recipientLamports = await getLamports(recipient.publicKey);

    await withdrawEscrowAccount(
        owner.publicKey,
        recipient,
    );

    const escrowAccountUpdate =
        await program.account.escrowAccount.fetch(escrowAccount);

    const recipientLamportsUpdate = await getLamports(recipient.publicKey);

    expect(escrowAccountUpdate.lamports.toNumber()).to.be.eq(5);
    expect(escrowAccountUpdate.lastWithdrawalTs.toNumber()).to.be.gt(0);

    expect(recipientLamportsUpdate).to.be.eq(recipientLamports + 5 - FEE_TX_WITHDRAW_ESCROW);

    await delay(1000);
  });

  it("it fails to withdraws escrow", async () => {
    await withdrawEscrowAccount(
        owner.publicKey,
        recipient,
    )
        .then(() => expect(false).to.be.true)
        .catch(() => expect(true).to.be.true);

    await delay(1000);
  });

  it("it waits and withdraws escrow", async () => {
    await delay(60000);

    const [escrowAccount, escrowBump] = getEscrowAccountPDA(
        owner.publicKey,
        recipient.publicKey
    );

    const recipientLamports = await getLamports(recipient.publicKey);

    await withdrawEscrowAccount(
        owner.publicKey,
        recipient,
    );

    const escrowAccountUpdate =
        await program.account.escrowAccount.fetch(escrowAccount);

    const recipientLamportsUpdate = await getLamports(recipient.publicKey);

    expect(escrowAccountUpdate.lamports.toNumber()).to.be.eq(0);
    expect(escrowAccountUpdate.lastWithdrawalTs.toNumber()).to.be.gt(0);

    expect(recipientLamportsUpdate).to.be.eq(recipientLamports + 5 - FEE_TX_WITHDRAW_ESCROW);

    await delay(1000);
  });

  it("it updates escrow account", async () => {
    const [escrowAccount, escrowBump] = getEscrowAccountPDA(
        owner.publicKey,
        recipient.publicKey
    );

    const ownerLamports = await getLamports(owner.publicKey);

    await updateEscrowAccount(
        owner,
        recipient.publicKey,
        60,
        7,
        { hour: {} },
        3
    );

    const escrowAccountUpdate =
        await program.account.escrowAccount.fetch(escrowAccount);

    const ownerLamportsUpdate = await getLamports(owner.publicKey);

    expect(escrowAccountUpdate.bump).to.be.eq(escrowBump);
    expect(Array.from(escrowAccountUpdate.owner.toBytes())).to.have.same.members(Array.from(owner.publicKey.toBytes()));
    expect(Array.from(escrowAccountUpdate.recipient.toBytes())).to.have.same.members(Array.from(recipient.publicKey.toBytes()));
    expect(escrowAccountUpdate.lamports.toNumber()).to.be.eq(60);
    expect(escrowAccountUpdate.withdrawIntervalStep.toNumber()).to.be.eq(3);
    expect(escrowAccountUpdate.withdrawLamports.toNumber()).to.be.eq(7);
    expect(escrowAccountUpdate.withdrawInterval.hour).to.not.be.undefined;
    expect(escrowAccountUpdate.createdAtTs.toNumber()).to.be.gt(0);
    expect(escrowAccountUpdate.lastWithdrawalTs.toNumber()).to.be.gt(0);

    expect(ownerLamportsUpdate).to.be.eq(ownerLamports - 60 - FEE_TX_UPDATE_ESCROW)

    await delay(1000);
  });

  it("it deletes escrow", async () => {
    const [escrowAccount, escrowBump] = getEscrowAccountPDA(
        owner.publicKey,
        recipient.publicKey
    );

    const ownerLamports = await getLamports(owner.publicKey);
    const escrowLamports = await getLamports(escrowAccount);

    await deleteEscrowAccount(
        owner,
        recipient.publicKey,
    );

    const ownerLamportsUpdate = await getLamports(owner.publicKey);

    await program.account.escrowAccount.fetch(escrowAccount)
        .then(() => expect(false).to.be.true)
        .catch(() => expect(true).to.be.true);

    expect(ownerLamportsUpdate).to.be.eq(ownerLamports - FEE_TX_DELETE_ESCROW + escrowLamports);

    await delay(1000);
  });

  async function createEscrowAccount(
      owner: anchor.web3.Keypair,
      recipient: anchor.web3.PublicKey,
      escrowLamports: number,
      withdrawLamports: number,
      withdrawInterval: any,
      withdrawIntervalStep: number,
  ) {
    const [escrowAccountPDA] = getEscrowAccountPDA(owner.publicKey, recipient);

    const transaction = new Transaction()
        .add(
            await program.methods
                .createEscrow(
                    new BN(escrowLamports),
                    new BN(withdrawLamports),
                    withdrawInterval,
                    new BN(withdrawIntervalStep)
                )
                .accounts({
                  escrowAccount: escrowAccountPDA,
                  owner: owner.publicKey,
                  recipient: recipient,
                  systemProgram: SystemProgram.programId
                })
                .transaction()
        )

    printTransaction(
        new Transaction()
            .add(
                await program.methods
                    .createEscrow(
                        new BN(escrowLamports),
                        new BN(withdrawLamports),
                        withdrawInterval,
                        new BN(withdrawIntervalStep)
                    )
                    .accounts({
                      escrowAccount: escrowAccountPDA,
                      owner: owner.publicKey,
                      recipient: recipient,
                      systemProgram: SystemProgram.programId
                    })
                    .transaction()
            ),
        "563MEMYqt2tQuaAM6aWwcfgsNdopaetuqABoEAiVnsAk",
        [owner]
    );

    await sendAndConfirmTransaction(connection, transaction, [owner]);
  }

  async function updateEscrowAccount(
      owner: anchor.web3.Keypair,
      recipient: anchor.web3.PublicKey,
      escrowLamports: number,
      withdrawLamports: number,
      withdrawInterval: any,
      withdrawIntervalStep: number,
  ) {
    const [escrowAccountPDA] = getEscrowAccountPDA(owner.publicKey, recipient);

    const transaction = new Transaction()
        .add(
            await program.methods
                .updateEscrow(
                    new BN(escrowLamports),
                    new BN(withdrawLamports),
                    withdrawInterval,
                    new BN(withdrawIntervalStep)
                )
                .accounts({
                  escrowAccount: escrowAccountPDA,
                  owner: owner.publicKey,
                  systemProgram: SystemProgram.programId
                })
                .transaction()
        )

    printTransaction(
        new Transaction()
            .add(
                await program.methods
                    .updateEscrow(
                        new BN(escrowLamports),
                        new BN(withdrawLamports),
                        withdrawInterval,
                        new BN(withdrawIntervalStep)
                    )
                    .accounts({
                      escrowAccount: escrowAccountPDA,
                      owner: owner.publicKey,
                      systemProgram: SystemProgram.programId
                    })
                    .transaction()
            ),
        "563MEMYqt2tQuaAM6aWwcfgsNdopaetuqABoEAiVnsAk",
        [owner]
    );

    await sendAndConfirmTransaction(connection, transaction, [owner]);
  }

  async function withdrawEscrowAccount(
      owner: anchor.web3.PublicKey,
      recipient: anchor.web3.Keypair,
  ) {
    const [escrowAccountPDA] = getEscrowAccountPDA(owner, recipient.publicKey);

    const transaction = new Transaction()
        .add(
            await program.methods
                .withdrawEscrow()
                .accounts({
                  escrowAccount: escrowAccountPDA,
                  recipient: recipient.publicKey,
                  systemProgram: SystemProgram.programId
                })
                .transaction()
        )

    printTransaction(
        new Transaction()
            .add(
                await program.methods
                    .withdrawEscrow()
                    .accounts({
                      escrowAccount: escrowAccountPDA,
                      recipient: recipient.publicKey,
                      systemProgram: SystemProgram.programId
                    })
                    .transaction()
            ),
        "563MEMYqt2tQuaAM6aWwcfgsNdopaetuqABoEAiVnsAk",
        [recipient]
    );

    await sendAndConfirmTransaction(connection, transaction, [recipient]);
  }

  async function deleteEscrowAccount(
      owner: anchor.web3.Keypair,
      recipient: anchor.web3.PublicKey,
  ) {
    const [escrowAccountPDA] = getEscrowAccountPDA(owner.publicKey, recipient);

    const transaction = new Transaction()
        .add(
            await program.methods
                .deleteEscrow()
                .accounts({
                  escrowAccount: escrowAccountPDA,
                  owner: owner.publicKey,
                })
                .transaction()
        )

    printTransaction(
        new Transaction()
            .add(
                await program.methods
                    .deleteEscrow()
                    .accounts({
                      escrowAccount: escrowAccountPDA,
                      owner: owner.publicKey,
                    })
                    .transaction()
            ),
        "563MEMYqt2tQuaAM6aWwcfgsNdopaetuqABoEAiVnsAk",
        [owner]
    );

    await sendAndConfirmTransaction(connection, transaction, [owner]);
  }

  function getEscrowAccountPDA(
      owner: anchor.web3.PublicKey,
      recipient: anchor.web3.PublicKey
  ) {
    return PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("escrow_account"),
          owner.toBytes(),
          recipient.toBytes()
        ],
        program.programId
    );
  }

  function printTransaction(
      transaction: anchor.web3.Transaction,
      recentBlockhash: string,
      signers: anchor.web3.Signer[]
  ) {
    transaction.recentBlockhash = recentBlockhash;
    transaction.sign(...signers);
    console.log(bs58.encode(transaction.serialize()));
  }

  async function airdropToActors(actors: PublicKey[]) {
    for (const actor of actors) {
      await connection.confirmTransaction(
          await connection.requestAirdrop(
              actor,
              10 * LAMPORTS_PER_SOL,
          ),
          "confirmed"
      );
    }
  }

  async function getLamports(pubkey: PublicKey) {
    return await connection.getBalance(pubkey);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});
