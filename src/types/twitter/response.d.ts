namespace TwitterAPI.Response {
    interface User {
        data: {
            user: {
                result: TwitterAPI.User;
            };
        };
    }

    interface HomeTimeline {
        data: {
            home: {
                home_timeline_urt: TwitterAPI.Timeline;
            };
        };
    }

    interface CommunityTimeline {
        data: {
            communityResults: {
                result: {
                    ranked_community_timeline: {
                        timeline: TwitterAPI.Timeline;
                    };
                };
            };
        };
    }

    interface UserTweets {
        data: {
            user: {
                result: {
                    timeline_v2: {
                        timeline: TwitterAPI.Timeline;
                    };
                };
            };
        };
    }

    interface TweetDetail {
        data: {
            threaded_conversation_with_injections_v2: TwitterAPI.Timeline;
        };
    }
}
