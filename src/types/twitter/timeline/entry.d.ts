declare namespace TwitterAPI.Timeline {
    type Entry = ValueOf<EntryTypes>;

    type EntryContent = ValueOf<EntryContentTypes>;

    type EntryTypes = ApplyMap<EntryContentTypes, 'TwitterAPI.Entry'>;

    type EntryContentTypes = DiscriminatedMap<{
        Unknown: {};

        Cursor: {
            entryType: 'TimelineTimelineCursor';
        };

        Item: Item & {
            entryType: 'TimelineTimelineItem';
        };

        Tweet: ItemTypes['Tweet'] & {
            entryType: 'TimelineTimelineItem';
        };

        User: ItemTypes['User'] & {
            entryType: 'TimelineTimelineItem';
        };

        Module: {
            entryType: 'TimelineTimelineModule';
            items: { item: Item; }[];
        };

        HomeConversation: {
            entryType: 'TimelineTimelineModule';
            displayType: 'VerticalConversation';
            items: { item: ItemTypes['Tweet']; }[];
        };
    }>;
}
