namespace TwitterAPI.REST.Response {
    interface Following {
        users: TwitterAPI.REST.User[];
    }

    interface Notifications {
        globalObjects: {
            users?: Record<string, TwitterAPI.REST.User>;
        };
    }

    type Recommendations = TwitterAPI.REST.Recommendation[];
}
