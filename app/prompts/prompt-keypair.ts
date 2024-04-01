import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

export async function promptKeypair(): Promise<string | undefined> {
    const argv = yargs(hideBin(process.argv))
        .option('keypair', {
            alias: 'k',
            description: 'Path to Solana wallet keypair file',
            type: 'string',
        })
        .help()
        .alias('help', 'h')
        .version(false)
        .argv;

    async function promptForKeyPairPath(): Promise<string> {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'keypairPath',
                message: 'Enter the path to your Solana wallet keypair file:',
                validate: (input) => !!input || 'Path cannot be empty.',
            },
        ]);

        return answers.keypairPath;
    }

    let keypairPath = argv['keypair'];

    if (!keypairPath) {
        return await promptForKeyPairPath();
    }

    return keypairPath;
}