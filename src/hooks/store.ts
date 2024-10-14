import { useSyncExternalStore } from 'react';
import type { CachedExternalStore } from '../stores/base';
import { user } from '../stores/user';

export function useStore<T>(store: CachedExternalStore<T>) {
    return useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
    );
}

export function useTwitterUser() {
    return useStore(user);
}
