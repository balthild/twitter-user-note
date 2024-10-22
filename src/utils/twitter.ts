export namespace TwitterURL {
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

    export function getUsernameLowercase(pathname: string) {
        const segments = pathname.split('/').slice(1);
        if (segments.length === 0) return;

        const name = segments[0].toLowerCase();
        if (NON_USERNAMES.has(name)) return;

        return name;
    }

    export function isTwitterDomain(url: URL) {
        return url.hostname === 'twitter.com'
            || url.hostname === 'x.com';
    }

    export namespace API {
        export function isGraphQL(url: URL) {
            if (!isTwitterDomain(url)) return false;
            return url.pathname.startsWith('/i/api/graphql/');
        }

        export function isUser(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/UserByScreenName')
                || url.pathname.endsWith('/UserByRestId');
        }

        export function isUsersByRestIds(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/UsersByRestIds');
        }

        export function isFollowing(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/Following');
        }

        export function isHomeTimeline(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/HomeTimeline');
        }

        export function isCommunityTimeline(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/CommunityTweetsTimeline');
        }

        export function isUserTweets(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/UserTweets');
        }

        export function isPinnedTimelines(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/PinnedTimelines');
        }

        export function isTweetDetail(url: URL) {
            if (!isGraphQL(url)) return false;
            return url.pathname.endsWith('/TweetDetail');
        }

        export namespace REST {
            export function isNotifications(url: URL) {
                if (!isTwitterDomain(url)) return false;
                return url.pathname === '/i/api/2/notifications/all.json';
            }

            export function isRecommandations(url: URL) {
                if (!isTwitterDomain(url)) return false;
                return url.pathname === '/i/api/1.1/users/recommendations.json';
            }

            export function isFollowing(url: URL) {
                if (!isTwitterDomain(url)) return false;
                return url.pathname === '/i/api/1.1/friends/following/list.json';
            }

            export function isUserUpdates(url: URL) {
                if (!isTwitterDomain(url)) return false;
                return url.pathname === '/i/api/1.1/friends/following/list.json';
            }
        }
    }
}
