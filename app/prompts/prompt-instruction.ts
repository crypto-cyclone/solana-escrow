import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';
import {getProgramFromIDl} from "../util/get-program-from-idl";

export async function promptInstruction(): Promise<string | undefined> {
    const instructionNames = Object.keys(getProgramFromIDl().methods);

    const argv = yargs(hideBin(process.argv))
        .option('instruction', {
            alias: 'i',
            description: 'The instruction to execute',
            type: 'string',
            choices: instructionNames,
        })
        .help()
        .alias('help', 'h')
        .version(false)
        .argv;

    async function promptForInstruction(): Promise<string> {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'instruction',
                message: 'Select the instruction you want to execute:',
                choices: instructionNames.map((name) => {
                   return { name, value: name }
                }),
            },
        ]);

        return answers.instruction;
    }

    let instruction = argv['instruction'];

    if (!instruction) {
        return await promptForInstruction();
    }

    return instruction;
}
