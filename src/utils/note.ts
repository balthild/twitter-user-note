import { produce } from 'immer';

import { keyset } from './misc';
import { collections, StorageCollection } from './storage';

export function isNoteEmpty(note: MaybeStored<Note>) {
    if (!note) return true;

    if (note.note?.trim()) return false;

    return true;
}

export function isNoteEqual(left: Note, right: Note) {
    for (const field of keyset(left, right)) {
        if (left[field] !== right[field]) {
            return false;
        }
    }

    return true;
}

export function normalizeNote(user: TwitterUser, stored?: Stored<Note>): Note {
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

    return normalize(stored ?? {});
}

export function fillDummyUser(id: string, stored: Stored<Note>) {
    const user = {
        id,
        username: stored.username ?? '',
        nickname: stored.nickname ?? '',
    };

    return normalizeNote(user, stored);
}

export async function migrateLegacyNotes() {
    const legacy = new StorageCollection<Stored<Note> | string>({
        area: chrome.storage.sync,
        collection: '/notes/',
        timestamp: true,
    });

    const entries = await legacy.getAll();
    for (let [id, stored] of entries) {
        if (typeof stored === 'string') {
            stored = { note: stored };
        }

        if (!isNoteEmpty(stored)) {
            await collections.note.twitter.set(id, stored, !stored.timestamp);
        }

        await legacy.remove(id);
    }
}
