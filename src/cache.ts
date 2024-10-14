import Dexie from 'dexie';
import type { EntityTable } from 'dexie';

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

export function cleanup() {
    const stale = new Date().getTime() - 86400 * 3 * 1000;

    return Promise.all([
        cache.users.where('timestamp').below(stale).delete(),
    ]);
}
