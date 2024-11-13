import { produce } from 'immer';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fillDummyUser, isNoteEmpty, normalizeNote } from '~/utils/note';
import { collections } from '~/utils/storage';

export function useNote(user?: TwitterUser): Optional<NoteItem> {
    // undefined: loading
    // [k, v] if k === id: loaded
    // [k, v] if k !== id: key invalidated, loading next
    const [stored, setStored] = useState<Pair<string, MaybeStored<Note>>>();

    useEffect(() => {
        if (!user?.id) return;
        fetchNote(user.id).then(setStored);
        return subscribeNote(user.id, setStored);
    }, [user?.id]);

    const loaded = user && stored && stored[0] === user.id;
    const note = loaded && normalizeNote(user, stored[1]);

    const setFields = useCallback(async (...entries: EntryOf<NoteBase>[]) => {
        if (!user || !note) return;

        const updated = produce<Stored<Note>>(note, (draft) => {
            for (const [key, value] of entries) {
                draft[key] = value;
            }
        });

        const normalized = normalizeNote(user, updated);
        if (normalized === note) return;

        await collections.note.twitter.set(user.id, isNoteEmpty(normalized) ? {} : updated);
        await chrome.runtime.sendMessage<ExtensionMessage>({
            action: 'sync-notes',
            name: 'twitter',
        });
    }, [user, note]);

    const setText = useCallback(
        (note: string) => setFields(['note', note]),
        [setFields],
    );

    if (!note) return;

    return {
        ...note,
        setFields,
        setText,
    };
}

export function useNoteList() {
    const [entries, setEntries] = useState<Pair<string, Stored<Note>>[]>();

    useEffect(() => {
        fetchNoteList().then(setEntries);
        return subscribeNoteList(() => fetchNoteList().then(setEntries));
    }, []);

    return useMemo(
        () => entries?.map(([k, v]) => [k, fillDummyUser(k, v)] as const),
        [entries],
    );
}

export async function fetchNote(id: string) {
    const stored = await collections.note.twitter.get(id);
    return [id, stored] as Pair<string, MaybeStored<Note>>;
}

export function subscribeNote(id: string, callback: (entry: Pair<string, MaybeStored<Note>>) => void) {
    return collections.note.twitter.watch(id, (change) => {
        callback([id, change.newValue]);
    });
}

export function fetchNoteList() {
    return collections.note.twitter.getAll();
}

export function subscribeNoteList(callback: () => void) {
    return collections.note.twitter.watchAll(callback);
}
