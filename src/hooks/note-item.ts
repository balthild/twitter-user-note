import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';

import { noteStorage } from '../utils/storage';

export function useNote(user?: TwitterUser): Optional<NoteItem> {
    // undefined: loading
    // [k, v] if k === id: loaded
    // [k, v] if k !== id: key invalidated, loading next
    const [stored, setStored] = useState<StoredNoteEntry>();

    useEffect(() => {
        if (!user?.id) return;
        fetchNote(user.id).then(setStored);
        return subscribeNote(user.id, setStored);
    }, [user?.id]);

    const loaded = user && stored && stored[0] === user.id;
    const note = loaded && normalizeNote(user, stored[1]);

    const setFields = useCallback((...entries: EntryOf<NoteBase>[]) => {
        if (!user || !note) return;

        const updated = produce(note, (draft) => {
            for (const [key, value] of entries) {
                draft[key] = value;
            }
        });

        const normalized = normalizeNote(user, updated);

        if (isNoteEmpty(normalized)) {
            return noteStorage.remove(user.id);
        }
        if (normalized !== note) {
            return noteStorage.set(user.id, updated);
        }
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

async function fetchNote(id: string) {
    const stored = await noteStorage.get<StoredNote>(id);
    return [id, stored] as StoredNoteEntry;
}

function subscribeNote(id: string, callback: (entry: StoredNoteEntry) => void) {
    return noteStorage.watch<StoredNote>(id, (change) => {
        callback([id, change.newValue]);
    });
}

export function normalizeNote(user: TwitterUser, stored?: StoredNote): Note {
    const overrides: Partial<Note> = {
        username: user.username,
        nickname: user.nickname,
    };

    const defaults: Partial<Note> = {
        note: '',
    };

    const transformers: Partial<ApplyIndex<Note, 'Mapper'>> = {
        note: (value) => value.trim(),
    };

    const normalize = produce((draft) => {
        for (const key of Object.keys<Note>(draft)) {
            if (!overrides.hasOwnProperty(key) && !defaults.hasOwnProperty(key)) {
                delete draft[key];
            }
        }

        for (const [key, value] of Object.entries(overrides)) {
            draft[key] = value;
        }

        for (const [key, value] of Object.entries(defaults)) {
            draft[key] ??= value;
        }

        for (const [key, transformer] of Object.entries(transformers)) {
            draft[key] = transformer(draft[key]);
        }
    });

    if (typeof stored === 'string') {
        return normalize({ note: stored });
    }

    return normalize(stored ?? {});
}

function isNoteEmpty(note: Note) {
    return !note.note.trim();
}
