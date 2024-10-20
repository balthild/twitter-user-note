namespace TwitterAPI {
    interface Item<T = ItemContent> {
        itemContent: T;
    }

    interface ItemContent {
        itemType: never;
    }

    type ItemTypeMap<Map> = {
        [Name in keyof Map]: Item<Map[Name]>;
    };
}
