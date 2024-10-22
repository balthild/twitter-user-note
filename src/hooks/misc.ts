import type { EmotionCache } from '@emotion/cache';
import { useLayoutEffect, useSyncExternalStore } from 'react';

import type { CachedExternalStore } from '../stores/base';

// https://github.com/PlasmoHQ/plasmo/issues/1054
export function useEmotionWorkaround(cache: EmotionCache) {
    useLayoutEffect(() => {
        return () => {
            cache.inserted = {};
        };
    }, []);
}

export function useStore<T>(store: CachedExternalStore<T>) {
    return useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
    );
}
