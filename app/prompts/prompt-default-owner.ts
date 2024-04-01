import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";
import inquirer from "inquirer";

export async function promptDefaultOwner(): Promise<boolean> {
    const argv = yargs(hideBin(process.argv))
        .option('owner', {
            alias: 'o',
            description: 'Use current keypair as owner',
            type: 'boolean',
        })
        .version(false)
        .help()
        .alias('help', 'h')
        .argv;

    async function promptForDefaultOwner(): Promise<boolean> {
        const answer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'owner',
                message: 'Do you wish to use the current keypair as owner?',
                default: false,
            }
        ]);

        return answer.owner;
    }

    let owner = argv['owner'];

    if (owner == null) {
        return await promptForDefaultOwner()
    }

    return owner;
}