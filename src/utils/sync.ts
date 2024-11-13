import { keyset } from './misc';
import { collections } from './storage';

export async function dump(): Promise<Dump<Note>> {
    const entries = await collections.note.twitter.getAll();

    return Object.fromEntries(entries.map(([id, stored]) => {
        return [id, resolve(stored)] as const;
    }));
}

export async function sync() {
    /*
    const remote = await fetchFromGoogleDrive();
    const delta = await merge(remote);

    if (Object.keys(delta).length) {
        const merged = { ...remote, ...delta };
        await storeToGoogleDrive();
    }
    */
}

export async function merge(remote: Dump<Note>, override = false) {
    const local = await dump();
    const delta: Dump<Note> = {};

    for (const id of keyset(local, remote)) {
        const dateLocal = new Date(local[id].timestamp || 0);
        const dateRemote = new Date(remote[id].timestamp || 0);

        if (override || dateLocal <= dateRemote) {
            const timestamp = override || !remote[id].timestamp;
            await collections.note.twitter.set(id, remote[id], timestamp);
        } else {
            delta[id] = local[id];
        }
    }

    return delta;
}

function resolve(stored: Stored<Note>): ExplicitPartial<Stored<Note>> {
    return {
        username: stored.username || undefined,
        nickname: stored.nickname || undefined,
        note: stored.note || undefined,
        timestamp: stored.timestamp,
    };
}
