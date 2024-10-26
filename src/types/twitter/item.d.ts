declare namespace TwitterAPI {
    interface Item<T = ItemContent> {
        itemContent: T;
    }

    interface ItemContent {
        itemType: string;
    }
}

interface TypeMap<T> {
    'TwitterAPI.Item': TwitterAPI.Item<T>;
}
