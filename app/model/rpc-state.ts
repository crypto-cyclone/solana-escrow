export class RPCState {
    rpcUrl: string | undefined;

    private constructor(rpcStateInterface: RPCStateInterface) {
        Object.assign(this, rpcStateInterface);
    }

    static factory(rpcStateInterface: RPCStateInterface) {
        return new RPCState(rpcStateInterface);
    }
}

export interface RPCStateInterface {
    rpcUrl: string | undefined;
}
