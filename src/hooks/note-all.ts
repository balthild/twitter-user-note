import { useEffect, useState } from 'react';

import { noteKeyPrefix, noteStorage } from '../utils/storage';
import { normalizeNote } from './note-item';

export function useAllNotes() {
    const [notes, setNotes] = useState([] as NoteEntry[]);

    useEffect(() => {
        getAllNotes().then(setNotes);
        return subscribeAllNotes(() => getAllNotes().then(setNotes));
    }, []);

    return notes;
}

async function getAllNotes() {
    const entries = [];

    const record = await noteStorage.getAll();
    for (const [id, json] of Object.entries(record)) {
        if (json) {
            const stored = JSON.parse(json);
            const user = {
                id,
                username: stored.username ?? '',
                nickname: stored.nickname ?? '',
            };
            const note = normalizeNote(user, stored);

            entries.push([id, note] as NoteEntry);
        }
    }

    return entries;
}

function subscribeAllNotes(callback: () => void) {
    const listener = (changes: object) => {
        for (const key of Object.keys(changes)) {
            if (key.startsWith(noteKeyPrefix)) {
                return callback();
            }
        }
    };

    noteStorage.primaryClient.onChanged.addListener(listener);

    return () => noteStorage.primaryClient.onChanged.removeListener(listener);
}
