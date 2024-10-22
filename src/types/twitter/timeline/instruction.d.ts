declare namespace TwitterAPI.Timeline {
    type Instruction = ValueOf<InstructionTypes>;

    type InstructionTypes = DiscriminatedMap<{
        Unknown: {};

        ClearCache: {
            type: 'TimelineClearCache';
        };

        PinEntry: {
            type: 'TimelinePinEntry';
            entry: EntryTypes['Tweet'];
        };

        AddEntries: {
            type: 'TimelineAddEntries';
            entries: Entry[];
        };

        Terminate: {
            type: 'TimelineTerminateTimeline';
        };
    }>;
}
