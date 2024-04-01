export class InstructionState {
    instruction: string | undefined;
    arguments: Record<string, any> | undefined;
    accounts: Record<string, string> | undefined;

    private constructor(instructionStateInterface: InstructionStateInterface) {
        Object.assign(this, instructionStateInterface);
    }

    static factory(instructionStateInterface: InstructionStateInterface) {
        return new InstructionState(instructionStateInterface);
    }
}

export interface InstructionStateInterface {
    instruction: string | undefined;
    arguments: Record<string, any> | undefined;
    accounts: Record<string, string> | undefined;
}
