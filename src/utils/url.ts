export function isTwitterDomain(url: URL) {
    return url.hostname === 'twitter.com'
        || url.hostname === 'x.com';
}

export function isUserAPI(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    if (!url.pathname.startsWith('/i/api/graphql/')) {
        return false;
    }

    return url.pathname.endsWith('/UserByScreenName')
        || url.pathname.endsWith('/UserByRestId');
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
