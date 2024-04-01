export class QueryState {
    query: string | undefined;
    arguments: Record<string, any> | undefined;

    private constructor(queryStateInterface: QueryStateInterface) {
        Object.assign(this, queryStateInterface);
    }

    static factory(queryStateInterface: QueryStateInterface) {
        return new QueryState(queryStateInterface);
    }
}

export interface QueryStateInterface {
    query: string | undefined;
    arguments: Record<string, any> | undefined;
}
