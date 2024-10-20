namespace TwitterAPI.Timeline {
    type Instruction = ValueOf<InstructionTypes>;

    interface InstructionTypes {
        Base: InstructionTypes.Base;
        ClearCache: InstructionTypes.ClearCache;
        PinEntry: InstructionTypes.PinEntry;
        AddEntries: InstructionTypes.AddEntries;
    }

    namespace InstructionTypes {
        interface Base {
            type: never;
        }

        interface ClearCache extends Base {
            type: 'TimelineClearCache';
        }

        interface PinEntry extends Base {
            type: 'TimelinePinEntry';
            entry: EntryTypes['Tweet'];
        }

        interface AddEntries extends Base {
            type: 'TimelineAddEntries';
            entries: Entry[];
        }
    }
}
