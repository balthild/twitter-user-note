import { useStorage } from '@plasmohq/storage/hook';
import { type Draft, produce } from 'immer';

export function fillDefaults(user: TwitterUser, stored?: StoredRecord): Optional<LocalRecord> {
    const fill = produce((draft) => {
        draft.id = user.id;
        draft.username = user.username;
        draft.nickname = user.nickname;
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

export function useLocalRecord(user?: TwitterUser): Optional<LocalRecordItem> {
    const key = user?.id ? `/notes/${user.id}` : '';
    const [stored, setStored, storedItem] = useStorage<StoredRecord>(key);

    const record = user && fillDefaults(user, stored);
    if (!user || !record || storedItem.isLoading) {
        return;
    }

    // `useStorage` may return invalidated data when key is changed
    if (typeof stored === 'object' && user.id !== stored?.id) {
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
