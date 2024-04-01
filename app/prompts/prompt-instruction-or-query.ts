import inquirer from 'inquirer';
import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";

export async function promptInstructionOrQuery(): Promise<'instruction' | 'query'> {
    const argv = yargs(hideBin(process.argv))
        .option('instruction', {
            alias: 'i',
            description: 'Execute an instruction',
            type: 'boolean',
            conflicts: 'query',
        })
        .option('query', {
            alias: 'q',
            description: 'Perform a query',
            type: 'boolean',
            conflicts: 'instruction',
        })
        .help()
        .alias('help', 'h')
        .version(false)
        .argv;


    if (argv['instruction']) {
        return 'instruction';
    } else if (argv['query']) {
        return 'query';
    }

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'actionType',
            message: 'Do you want to execute an instruction or perform a query?',
            choices: [
                { name: 'Execute an Instruction', value: 'instruction' },
                { name: 'Perform a Query', value: 'query' }
            ],
        }]
    );

    return answer.actionType;
}
