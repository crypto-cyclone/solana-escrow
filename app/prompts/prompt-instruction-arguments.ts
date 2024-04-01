import inquirer from 'inquirer';
import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";
import {getProgramFromIDl} from "../util/get-program-from-idl";

export async function promptInstructionArguments(
    instructionName: string,
    preparedArguments: any[],
    onArgument: (argv: any, arg: any) => void
): Promise<Record<string, any>> {
    const instruction = getProgramFromIDl().idl.instructions.find(instr => instr.name === instructionName);

    if (!instruction) {
        throw new Error(`Instruction ${instructionName} not found.`);
    }

    let argvBuilder = yargs(hideBin(process.argv))
        .version(false);
    [...preparedArguments, ...instruction.args].forEach(arg => {
        argvBuilder = argvBuilder.option(arg.name, {
            alias: `arg-${arg.name}`,
            description: `Value for ${arg.name}`,
            type: 'string',
        });
    });

    const argv = argvBuilder.argv;

    async function promptForArgument(arg: any): Promise<string> {
        if (argv[arg.name] !== undefined) {
            return argv[arg.name];
        }

        const answer = await inquirer.prompt([{
            type: 'input',
            name: arg.name,
            message: `Enter value for ${arg.name}:`
        }]);

        return answer[arg.name];
    }

    const argValues: Record<string, any> = {};

    for (const arg of [...preparedArguments, ...instruction.args]) {
        argValues[arg.name] = await promptForArgument(arg);
        await onArgument(argv, argValues);
    }

    for (const argValue in argValues) {
        if (argValues[argValue].trim().length == 0) {
            delete argValues[argValue];
        }
    }

    return argValues;
}
