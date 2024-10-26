interface TwitterUser {
    readonly id: string;
    readonly username: string;
    readonly nickname: string;
}

interface NoteBase {
    readonly note: string;
}

interface Note extends NoteBase {
    readonly username: string;
    readonly nickname: string;
}

interface NoteItem extends Note {
    setFields(...entries: EntryOf<NoteBase>[]): Async<void>;
    setText(note: string): Async<void>;
}

type NoteEntry = readonly [string, Note];

type StoredNote = string | Partial<Note>;

type StoredNoteEntry = readonly [string, StoredNote];
