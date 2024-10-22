declare namespace TwitterAPI {
    interface Entry<T = EntryContent> {
        entryId: string;
        content: T;
    }

    interface EntryContent {
        entryType: string;
    }
}

interface HKT<T> {
    'TwitterAPI.Entry': TwitterAPI.Entry<T>;
}
