import { useEffect, useState } from 'react';

import { storages } from '~/utils/storage';

import { normalizeNote } from './note-item';

export function useAllNotes() {
    const [notes, setNotes] = useState([] as NoteEntry[]);

    useEffect(() => {
        fetchAllNotes().then(setNotes);
        return subscribeAllNotes(() => fetchAllNotes().then(setNotes));
    }, []);

    return notes;
}

async function fetchAllNotes() {
    const entries = [];

    for (const [id, stored] of await storages.note.getAll()) {
        if (!stored) continue;

        const user = {
            id,
            username: stored.username ?? '',
            nickname: stored.nickname ?? '',
        };

        const note = normalizeNote(user, stored);

        entries.push([id, note] as NoteEntry);
    }

    return entries;
}

function subscribeAllNotes(callback: () => void) {
    return storages.note.watchAll(callback);
}
