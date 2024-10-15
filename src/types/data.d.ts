interface TwitterUser {
    readonly id: string;
    readonly username: string;
    readonly nickname: string;
}

interface LocalRecord {
    readonly id: string;
    readonly username: string;
    readonly nickname: string;
    readonly note: string;
}

interface LocalRecordItem extends LocalRecord {
    setNote(note: string): Promise<void> | void;
}

type StoredRecord = string | Partial<LocalRecord>;
