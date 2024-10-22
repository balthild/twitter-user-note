declare namespace TwitterAPI {
    interface User {
        __typename: 'User';
        rest_id: string;
        legacy: {
            screen_name: string;
            name: string;
        };
    }
}
