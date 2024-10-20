export function isTwitterDomain(url: URL) {
    return url.hostname === 'twitter.com'
        || url.hostname === 'x.com';
}

export function isTwitterGraphQL(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname.startsWith('/i/api/graphql/');
}

export function isUserAPI(url: URL) {
    if (!isTwitterGraphQL(url)) {
        return false;
    }

    return url.pathname.endsWith('/UserByScreenName')
        || url.pathname.endsWith('/UserByRestId');
}

export function isHomeTimelineAPI(url: URL) {
    if (!isTwitterGraphQL(url)) {
        return false;
    }

    return url.pathname.endsWith('/HomeTimeline');
}

export function isCommunityTimelineAPI(url: URL) {
    if (!isTwitterGraphQL(url)) {
        return false;
    }

    return url.pathname.endsWith('/CommunityTweetsTimeline');
}

export function isUserTweetsAPI(url: URL) {
    if (!isTwitterGraphQL(url)) {
        return false;
    }

    return url.pathname.endsWith('/UserTweets');
}

export function isNotificationsAPI(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname === '/i/api/2/notifications/all.json';
}

export function isRecommandationsAPI(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname === '/i/api/1.1/users/recommendations.json';
}

export function isFollowingAPI(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname === '/i/api/1.1/friends/following/list.json';
}

const NON_USERNAMES = new Set([
    'i',
    'home',
    'explore',
    'notifications',
    'messages',
    'jobs',
    'settings',
    'account',
]);

export function getTwitterUsernameLowercase(pathname: string) {
    const segments = pathname.split('/').slice(1);
    if (segments.length === 0) {
        return;
    }

    const name = segments[0].toLowerCase();
    if (NON_USERNAMES.has(name)) {
        return;
    }

    return name;
}
