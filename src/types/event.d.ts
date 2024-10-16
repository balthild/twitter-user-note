interface WindowEventMap {
    'cache-twitter-user': CustomEvent<CacheTwitterUserEventDetail>;
}

interface CacheTwitterUserEventDetail {
    id: string;
    key: string;
}
