import {promptKeypair} from "./prompts/prompt-keypair";
import {Connection, Keypair} from "@solana/web3.js";
import {loadKeypairFromFile} from "./util/load-keypair-from-file";
import {promptInstruction} from "./prompts/prompt-instruction";
import {promptRpcUrl} from "./prompts/prompt-rpc-url";
import {AnchorProvider, setProvider, Wallet} from '@coral-xyz/anchor';
import {promptInstructionArguments} from "./prompts/prompt-instruction-arguments";
import {promptInstructionAccounts} from "./prompts/prompt-instruction-accounts";
import {KeypairState} from "./model/keypair-state";
import {RPCState} from "./model/rpc-state";
import {InstructionState} from "./model/instruction-state";
import {QueryState} from "./model/query-state";
import {promptInstructionOrQuery} from "./prompts/prompt-instruction-or-query";
import {promptQuery} from "./prompts/prompt-query";
import {promptQueryArguments} from "./prompts/prompt-query-arguments";
import {
    createEscrow, prepareCreateEscrowAccounts, prepareCreateEscrowArguments,

} from "./instruction/create-escrow";
import {getEscrowAccount} from "./query/get-escrow-account";
import {getEscrowAccounts} from "./query/get-escrow-accounts";
import {deleteEscrow, prepareDeleteEscrowAccounts, prepareDeleteEscrowArguments} from "./instruction/delete-escrow";
import {promptDefaultOwner} from "./prompts/prompt-default-owner";
import {
    prepareUpdateEscrowAccounts,
    prepareUpdateEscrowArguments,
    prepareUpdateEscrowOnArgument,
    updateEscrow
} from "./instruction/update-escrow";
import {
    prepareWithdrawEscrowAccounts,
    prepareWithdrawEscrowArguments,
    withdrawEscrow
} from "./instruction/withdraw-escrow";

async function main() {
    let keypairState = await setupKeypair();

    if (!keypairState.keypair) throw Error();

    let rpcState = await setupRPCURLState();

    if (!rpcState.rpcUrl) throw Error();

    setProvider(
        new AnchorProvider(
            new Connection(rpcState.rpcUrl),
            new Wallet(keypairState.keypair),
            {
                preflightCommitment: 'confirmed',
            })
    );

    let instructionOrQueryState = await setupInstructionOrQueryState(keypairState.keypair);

    const unknownActionError = new Error(`Unknown action`)

    if (instructionOrQueryState instanceof InstructionState) {
        if (!instructionOrQueryState.instruction) throw unknownActionError;

        await executeInstruction(
            instructionOrQueryState,
            [keypairState.keypair]
        );
    } else if (instructionOrQueryState instanceof QueryState) {
        if (!instructionOrQueryState.query) throw unknownActionError;

        await executeQuery(instructionOrQueryState, keypairState.keypair);
    } else {
        throw unknownActionError;
    }
}

async function setupKeypair(): Promise<KeypairState> {
    let state: KeypairState = KeypairState.factory({
        keypair: undefined,
    });

    while (true) {
        let keypairPath = await promptKeypair();

        if (keypairPath != null) {
            let keypair = loadKeypairFromFile(keypairPath);

            if (keypair != null) {
                state.keypair = keypair;
                break;
            }
        }
    }

    return state;
}

async function setupRPCURLState(): Promise<RPCState> {
    const state: RPCState = RPCState.factory({
        rpcUrl: undefined,
    });

    while (true) {
        let rpcUrl = await promptRpcUrl();

        if (rpcUrl != null) {
            state.rpcUrl = rpcUrl;
            break;
        }
    }

    return state;
}

async function setupInstructionOrQueryState(keypair: Keypair): Promise<InstructionState | QueryState> {
    while (true) {
        let instructionOrQuery = await promptInstructionOrQuery();

        if (instructionOrQuery == 'instruction') {
            return await setupInstructionState(keypair);
        } else if (instructionOrQuery == 'query') {
            return await setupQueryState(keypair);
        }
    }
}

async function setupInstructionState(keypair: Keypair): Promise<InstructionState> {
    const state: InstructionState = InstructionState.factory({
        instruction: undefined,
        arguments: undefined,
        accounts: undefined,
    });

    while (true) {
        let instruction = await promptInstruction();

        if (instruction != null) {
            state.instruction = instruction;

            let preparedArguments = null;
            let onArgument = null;

            switch (instruction) {
                case 'createEscrow':
                    preparedArguments = prepareCreateEscrowArguments();
                    onArgument = () => {};

                    break;

                case 'updateEscrow':
                    preparedArguments = prepareUpdateEscrowArguments();
                    onArgument = () => {};

                    break;

                case 'withdrawEscrow':
                    preparedArguments = prepareWithdrawEscrowArguments()
                    onArgument = () => {};

                    break;

                case 'deleteEscrow':
                    preparedArguments = prepareDeleteEscrowArguments();
                    onArgument = () => {};
            }

            let args = await promptInstructionArguments(
                instruction,
                preparedArguments,
                onArgument
            );

            if (args != null) {
                state.arguments = args

                let preparedAccounts = null;

                switch (instruction) {
                    case 'createEscrow':
                        preparedAccounts = prepareCreateEscrowAccounts(
                            args,
                            keypair.publicKey
                        );

                        break;
                    case 'updateEscrow':
                        preparedAccounts = prepareUpdateEscrowAccounts(
                            args,
                            keypair.publicKey
                        );

                        break;
                    case 'withdrawEscrow':
                        preparedAccounts = prepareWithdrawEscrowAccounts(
                            args,
                            keypair.publicKey
                        );

                        break;
                    case 'deleteEscrow':
                        preparedAccounts = prepareDeleteEscrowAccounts(
                            args,
                            keypair.publicKey
                        );
                }

                if (preparedAccounts != null) {
                    let accounts = await promptInstructionAccounts(
                        instruction,
                        preparedAccounts
                    );

                    if (accounts != null) {
                        state.accounts = accounts;
                        break;
                    }
                }
            }
        }
    }

    return state;
}

async function setupQueryState(keypair: Keypair): Promise<QueryState> {
    const state: QueryState = QueryState.factory({
        query: undefined,
        arguments: undefined,
    });

    while (true) {
        let query = await promptQuery();

        if (query != null) {
            state.query = query;

            const defaultOwner = await promptDefaultOwner();

            let preparedArguments = {};

            if (defaultOwner) {
                preparedArguments = { owner: keypair.publicKey.toBase58() }
            }

            let args = await promptQueryArguments(query, preparedArguments);

            if (args != null) {
                state.arguments = args
                break;
            }
        }
    }

    return state;
}

async function executeInstruction(state: InstructionState, signers: [Keypair]) {
    switch (state.instruction) {
        case 'createEscrow':
            await createEscrow(
                state.arguments,
                state.accounts,
                signers
            );

            break;

        case 'updateEscrow':
            await updateEscrow(
                state.arguments,
                state.accounts,
                signers
            );

            break;

        case 'withdrawEscrow':
            await withdrawEscrow(
                state.arguments,
                state.accounts,
                signers
            );

            break;

        case 'deleteEscrow':
            await deleteEscrow(
                state.arguments,
                state.accounts,
                signers
            );
    }
}

async function executeQuery(state: QueryState, keypair: Keypair) {
    switch (state.query) {
        case 'get-escrow-account':
            await getEscrowAccount(state.arguments);

            break;

        case 'get-escrow-accounts':
            await getEscrowAccounts(state.arguments);

            break;
    }
}

main();
