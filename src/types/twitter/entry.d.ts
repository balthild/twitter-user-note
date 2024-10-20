namespace TwitterAPI {
    interface Entry<T = EntryContent> {
        entryId: string;
        content: T;
    }

    interface EntryContent {
        entryType: never;
    }

    type EntryTypeMap<Map> = {
        [Name in keyof Map]: Entry<Map[Name]>;
    };
}
