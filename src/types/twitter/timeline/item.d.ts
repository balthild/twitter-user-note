namespace TwitterAPI.Timeline {
    type Item = ValueOf<ItemTypes>;

    type ItemContent = ValueOf<ItemContentTypes>;

    type ItemTypes = TwitterAPI.ItemTypeMap<ItemContentTypes>;

    interface ItemContentTypes {
        Base: ItemContentTypes.Base;
        Tweet: ItemContentTypes.Tweet;
    }

    namespace ItemContentTypes {
        interface Base extends TwitterAPI.ItemContent {}

        interface Tweet extends Base {
            itemType: 'TimelineTweet';
            tweet_results: {
                result: TwitterAPI.Tweet;
            };
        }
    }
}
