import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';
import {getProgramFromIDl} from "../util/get-program-from-idl";

export async function promptInstructionAccounts(
    instructionName: string,
    preparedAccounts: Record<string, string>
): Promise<Record<string, string>> {
    const instruction = getProgramFromIDl().idl.instructions.find(instr => instr.name === instructionName);

    if (!instruction) {
        throw new Error(`Instruction ${instructionName} not found.`);
    }

    let argvBuilder = yargs(hideBin(process.argv))
        .version(false);
    instruction.accounts.forEach(account => {
        argvBuilder = argvBuilder.option(account.name, {
            alias: `acc-${account.name}`,
            description: `Public key for ${account.name}`,
            type: 'string',
        });
    });

    const argv = argvBuilder.argv;

    for (const preparedAccount in preparedAccounts) {
        if (argv[preparedAccount] == null) {
            argv[preparedAccount] = preparedAccounts[preparedAccount];
        }
    }

    async function promptForAccount(account: any): Promise<string> {
        if (argv[account.name] !== undefined) {
            return argv[account.name];
        }

        const answer = await inquirer.prompt([{
            type: 'input',
            name: account.name,
            message: `Enter the public key for ${account.name}:`,
            validate: (input) => !!input || `${account.name} cannot be empty.`,
        }]);

        return answer[account.name];
    }

    const accountValues: Record<string, string> = {};
    for (const account of instruction.accounts) {
        accountValues[account.name] = await promptForAccount(account);
    }

    return accountValues;
}
