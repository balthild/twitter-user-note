declare namespace TwitterAPI {
    interface Community {
        admin_results: Result<User>;
        creator_results: Result<User>;
        members_facepile_results: Result<User>[];
    }

    interface CommunityPinnedTimeline {
        __typename: 'CommunityPinnedTimeline';
        community_results: Result<Community>;
    }
}
