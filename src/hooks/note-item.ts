import { useStorage } from '@plasmohq/storage/hook';
import { type Draft, produce } from 'immer';
import { useEffect, useState } from 'react';

import { noteStorage } from '../utils/storage';

export function useNote(user?: TwitterUser): Optional<NoteItem> {
    // undefined: loading
    // [k, v] if k === id: loaded
    // [k, v] if k !== id: invalidated, loading next
    const [stored, setStored] = useState<StoredNoteEntry>();

    useEffect(() => {
        if (!user?.id) return;
        setStored(undefined);
        getNote(user.id).then(setStored);
        return subscribeNote(user.id, setStored);
    }, [user?.id]);

    if (!user || !stored || stored[0] !== user.id) {
        return;
    }

    return toNoteItem(user, stored[1]);
}

async function getNote(id: string) {
    const stored = await noteStorage.get<StoredNote>(id);
    return [id, stored] as StoredNoteEntry;
}

function subscribeNote(id: string, callback: (entry: StoredNoteEntry) => void) {
    const listeners = {
        [id](change: chrome.storage.StorageChange) {
            callback([id, change.newValue]);
        },
    };

    noteStorage.watch(listeners);

    return () => void noteStorage.unwatch(listeners);
}

function toNoteItem(user: TwitterUser, stored?: StoredNote): NoteItem {
    const note = normalizeNote(user, stored);

    const update = (receipt: (draft: Draft<Note>) => void) => {
        const value = produce(note, receipt);
        if (isNoteEmpty(value)) {
            noteStorage.remove(user.id);
        } else if (value !== note) {
            noteStorage.set(user.id, value);
        }
    };

    return {
        ...note,
        setText(note: string) {
            return update((draft) => {
                draft.note = note;
            });
        },
    };
}

export function normalizeNote(user: TwitterUser, stored?: StoredNote): Note {
    const overrides: Partial<Note> = {
        username: user.username,
        nickname: user.nickname,
    };

    const defaults: Partial<Note> = {
        note: '',
    };

    const normalize = produce((draft) => {
        for (const key of Object.keys<Note>(draft)) {
            if (overrides.hasOwnProperty(key)) {
                draft[key] = overrides[key];
            } else if (defaults.hasOwnProperty(key)) {
                draft[key] ??= defaults[key];
            } else {
                delete draft[key];
            }
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
