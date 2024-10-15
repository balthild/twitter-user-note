import type { PlasmoCSConfig } from 'plasmo';

import { cache, cleanup } from '../cache';

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
    world: 'MAIN',
    run_at: 'document_start',
};

requestIdleCallback(cleanup);

const open = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (...args: any) {
    const url = new URL(args[1]);
    if (isUserRequest(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            const user = json.data?.user?.result;
            if (!user) {
                return;
            }

            cacheTwitterUser(user);
        });
    } else if (isNotificationsRequest(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            const users = json.globalObjects?.users;
            if (!users) {
                return;
            }

            for (const user of Object.values(users)) {
                cacheTwitterUser(user as TwitterUserResult);
            }
        });
    } else if (isRecommandationsRequest(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            if (!json || !json[0]) {
                return;
            }

            for (const item of json) {
                cacheTwitterUser(item.user as TwitterUserResult);
            }
        });
    } else if (isFollowingRequest(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            if (!json || !json[0]) {
                return;
            }

            for (const user of json) {
                cacheTwitterUser(user as TwitterUserResult);
            }
        });
    }

    return open.apply(this, args);
};

function isUserRequest(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    if (!url.pathname.startsWith('/i/api/graphql/')) {
        return false;
    }

    return url.pathname.endsWith('/UserByScreenName')
        || url.pathname.endsWith('/UserByRestId');
}

function isNotificationsRequest(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname === '/i/api/2/notifications/all.json';
}

function isRecommandationsRequest(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname === '/i/api/1.1/users/recommendations.json';
}

function isFollowingRequest(url: URL) {
    if (!isTwitterDomain(url)) {
        return false;
    }

    return url.pathname === '/i/api/1.1/friends/following/list.json';
}

function isTwitterDomain(url: URL) {
    return url.hostname === 'twitter.com'
        || url.hostname === 'x.com';
}

interface TwitterUserResultGQL {
    __typename: 'User';
    rest_id: string;
    legacy: {
        screen_name: string;
        name: string;
    };
}

interface TwitterUserResultREST {
    id_str: string;
    screen_name: string;
    name: string;
}

type TwitterUserResult = Discriminated<TwitterUserResultGQL, TwitterUserResultREST>;

async function cacheTwitterUser(user: TwitterUserResult) {
    const resolved = resolveTwitterUser(user);
    if (!resolved) {
        return;
    }

    const id = resolved.id;
    const key = resolved.username.toLowerCase();

    await cache.users.put({
        key,
        timestamp: new Date().getTime(),
        value: resolved,
    });

    dispatchEvent(
        new CustomEvent(
            'cache-twitter-user',
            { detail: { id, key } },
        ),
    );
}

function resolveTwitterUser(user: TwitterUserResult): Optional<TwitterUser> {
    if (user.__typename === 'User') {
        return {
            id: user.rest_id,
            username: user.legacy.screen_name,
            nickname: user.legacy.name,
        };
    } else if (user.id_str) {
        return {
            id: user.id_str,
            username: user.screen_name,
            nickname: user.name,
        };
    }
}
