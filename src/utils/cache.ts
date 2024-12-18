import { Dexie, EntityTable } from 'dexie';

import { debug } from './misc';

interface CacheEntity<T> {
    key: string;
    timestamp: number;
    value: T;
}

type CacheTable<T> = EntityTable<CacheEntity<T>, 'key'>;

interface CacheDatabase extends Dexie {
    users: CacheTable<TwitterUser>;
}

export const cache = new Dexie('TwitterUserNoteCache') as CacheDatabase;

cache.version(1).stores({
    users: `key, timestamp`,
});

export async function cleanupCache() {
    const stale = new Date().getTime() - 86400 * 30 * 1000;

    const rows = await Promise.all([
        cache.users.where('timestamp').below(stale).delete(),
    ]);

    const total = rows.reduce((a, b) => a + b, 0);

    debug(`Removed ${total} Stale Cache`);
}
