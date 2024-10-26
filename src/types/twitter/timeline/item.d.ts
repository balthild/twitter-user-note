declare namespace TwitterAPI.Timeline {
    type Item = ValueOf<ItemTypes>;

    type ItemContent = ValueOf<ItemContentTypes>;

    type ItemTypes = ApplyIndex<ItemContentTypes, 'TwitterAPI.Item'>;

    type ItemContentTypes = DiscriminatedMap<{
        Unknown: {};

        Tweet: {
            itemType: 'TimelineTweet';
            tweet_results: Result<TwitterAPI.Tweet>;
        };

        User: {
            itemType: 'TimelineUser';
            userDisplayType: string;
            user_results: Result<TwitterAPI.User>;
        };
    }>;
}
