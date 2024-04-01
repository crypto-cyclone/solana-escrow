import {getProgramFromIDl} from "../util/get-program-from-idl";

export async function getEscrowAccounts(args: Record<string, any>) {
    const owner = args['owner'];
    const recipient = args['recipient'];

    const program = getProgramFromIDl();

    const filters = [];

    if (owner) {
        filters.push(
            {
                memcmp: {
                    bytes: owner,
                    offset: 8 + 1,
                },
            }
        )
    }

    if (recipient) {
        filters.push(
            {
                memcmp: {
                    bytes: recipient,
                    offset: 8 + 33,
                },
            }
        )
    }

    if (filters.length < 1) {
        return [];
    }

    await program.account.escrowAccount.all(filters)
        .then((accs) => console.log(accs))
        .catch(() => console.log([]));
}