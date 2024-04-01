import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

export async function promptRpcUrl(): Promise<string> {
    const rpcUrls = [
        { name: 'Mainnet Beta', value: 'https://api.mainnet-beta.solana.com', monikers: ['mainnet-beta', 'm'] },
        { name: 'Testnet', value: 'https://api.testnet.solana.com', monikers: ['testnet', 't'] },
        { name: 'Devnet', value: 'https://api.devnet.solana.com', monikers: ['devnet', 'd'] },
        { name: 'Custom', value: 'custom', monikers: [] },
    ];

    const argv = yargs(hideBin(process.argv))
        .option('rpc', {
            alias: 'r',
            description: 'Solana RPC URL',
            type: 'string',
        })
        .help()
        .alias('help', 'h')
        .version(false)
        .argv;

    if (argv['rpc']) {
        let urlByMoniker = rpcUrls.find((url) => url.monikers.includes(argv['rpc']) )?.value;

        if (urlByMoniker != null) {
            return urlByMoniker;
        }

        return argv['rpc'];
    }

    const { rpcUrl } = await inquirer.prompt([
        {
            type: 'list',
            name: 'rpcUrl',
            message: 'Select the Solana RPC URL:',
            choices: rpcUrls,
        },
    ]);

    if (rpcUrl === 'custom') {
        const { customRpcUrl } = await inquirer.prompt([
            {
                type: 'input',
                name: 'customRpcUrl',
                message: 'Enter the custom RPC URL:',
                validate: (input) => !!input || 'RPC URL cannot be empty.',
            },
        ]);
        return customRpcUrl;
    }

    return rpcUrl;
}
