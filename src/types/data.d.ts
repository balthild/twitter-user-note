interface TwitterUser {
    readonly id: string;
    readonly username: string;
    readonly nickname: string;
}

interface Note {
    readonly username: string;
    readonly nickname: string;
    readonly note: string;
}

interface NoteItem extends Note {
    setText(note: string): Promise<void> | void;
}

type NoteEntry = readonly [string, Note];

type StoredNote = string | Partial<Note>;

type StoredNoteEntry = readonly [string, StoredNote];
