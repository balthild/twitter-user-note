declare namespace TwitterAPI.REST {
    interface User {
        id_str: string;
        screen_name: string;
        name: string;
    }

    interface Recommendation {
        user: User;
    }
}
