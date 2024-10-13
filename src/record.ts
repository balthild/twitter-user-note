import { useStorage } from '@plasmohq/storage/hook';
import { type Draft, produce } from 'immer';
import { useEffect } from 'react';

import { type TwitterUser } from './twitter';

interface LocalRecord {
    readonly id: string;
    readonly username: string;
    readonly nickname: string;
    readonly note: string;
}

type StoredRecord = string | Partial<LocalRecord>;

function fillDefaults(user: TwitterUser, stored?: StoredRecord): LocalRecord | undefined {
    const fill = produce((draft) => {
        draft.id ??= user.id;
        draft.username ??= user.username;
        draft.nickname ??= user.nickname;
        draft.note ??= '';
    });

    if (typeof stored === 'string') {
        return fill({ note: stored });
    }

    return fill(stored ?? {});
}

function isRecordEmpty(record: LocalRecord) {
    return !record.note.trim();
}

interface LocalRecordItem extends LocalRecord {
    setNote(note: string): Promise<void> | undefined;
}

export function useLocalRecord(user?: TwitterUser): LocalRecordItem | undefined {
    const key = user?.id ? `/notes/${user.id}` : '';
    const [stored, setStored, storedItem] = useStorage<StoredRecord>(key);

    const record = user && fillDefaults(user, stored);

    useEffect(() => {
        if (stored && record && stored !== record) {
            setStored(record);
        }
    });

    // React hook calls end

    if (!user || !record || storedItem.isLoading) {
        return;
    }

    // `useStorage` may return invalidated data when key is changed
    if (user.id !== record.id) {
        return;
    }

    const update = (receipt: (draft: Draft<LocalRecord>) => void) => {
        const updated = produce(record, receipt);
        if (isRecordEmpty(updated)) {
            storedItem.remove();
        } else if (updated !== record) {
            return setStored(updated);
        }
    };

    return {
        ...record,
        setNote(note: string) {
            return update((draft) => {
                draft.note = note;
            });
        },
    };
}
