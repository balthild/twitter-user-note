import type { EmotionCache } from '@emotion/cache';
import { useCallback, useLayoutEffect, useState, useSyncExternalStore } from 'react';

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

export function useEditable<T>(stored: T, setStored: (value: T) => Async<void>) {
    const [draft, setDraft] = useState(stored);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const rendered = editing ? draft : stored;
    const dirty = editing && draft !== stored;

    const edit = useCallback(() => {
        setDraft(rendered);
        setEditing(true);
    }, [rendered]);

    const input = useCallback((value: T) => {
        if (saving) return;
        setDraft(value);
    }, []);

    const reset = useCallback(() => {
        if (saving) return;
        setDraft(stored);
    }, [stored]);

    const cancel = useCallback(() => {
        setEditing(false);
    }, []);

    const persist = useCallback(async () => {
        if (saving) return;

        setSaving(true);
        await setStored(draft);
        setEditing(false);
        setSaving(false);
    }, [setStored, draft]);

    return {
        rendered,
        dirty,
        draft,
        stored,
        editing,
        saving,
        edit,
        input,
        reset,
        cancel,
        persist,
    };
}
