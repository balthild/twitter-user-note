declare namespace TwitterAPI.Response {
    interface User {
        data: {
            user: Result<TwitterAPI.User>;
        };
    }

    interface UsersByRestIds {
        data: {
            users: Result<TwitterAPI.User>[];
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

    interface Following {
        data: {
            user: {
                result: {
                    timeline: {
                        timeline: {
                            instructions: TwitterAPI.Timeline.Instruction[];
                        };
                    };
                };
            };
        };
    }

    interface PinnedTimelines {
        data: {
            pinned_timelines: {
                pinned_timelines: TwitterAPI.CommunityPinnedTimeline[];
            };
        };
    }

    interface TweetDetail {
        data: {
            threaded_conversation_with_injections_v2: TwitterAPI.Timeline;
        };
    }
}
