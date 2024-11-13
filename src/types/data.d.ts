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

type Stored<T> = Partial<T> & {
    readonly timestamp?: string;
};

type MaybeStored<T> = Optional<Stored<T>>;

type Dump<T> = Record<string, Stored<T>>;
