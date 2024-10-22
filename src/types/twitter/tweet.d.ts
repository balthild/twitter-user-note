declare namespace TwitterAPI {
    interface Tweet {
        __typename: 'Tweet';
        core: {
            user_results: Result<User>;
        };
    }
}
