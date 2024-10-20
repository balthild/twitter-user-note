namespace TwitterAPI.Timeline {
    type Entry = ValueOf<EntryTypes>;

    type EntryContent = ValueOf<EntryContentTypes>;

    type EntryTypes = TwitterAPI.EntryTypeMap<EntryContentTypes>;

    interface EntryContentTypes {
        Base: EntryContentTypes.Base;
        Cursor: EntryContentTypes.Cursor;
        Tweet: EntryContentTypes.Tweet;
        Module: EntryContentTypes.Module;
        HomeConversation: EntryContentTypes.HomeConversation;
    }

    namespace EntryContentTypes {
        interface Base extends TwitterAPI.EntryContent {
            displayType: never;
        }

        interface Cursor extends Base {
            entryType: 'TimelineTimelineCursor';
        }

        interface Tweet extends Base {
            entryType: 'TimelineTimelineItem';
            itemContent: ItemContentTypes['Tweet'];
        }

        interface Module extends Base {
            entryType: 'TimelineTimelineModule';
            items: { item: Item; }[];
        }

        interface HomeConversation extends Base {
            entryType: 'TimelineTimelineModule';
            displayType: 'VerticalConversation';
            items: { item: ItemTypes['Tweet']; }[];
        }
    }
}
