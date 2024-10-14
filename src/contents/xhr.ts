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
    }

    return open.apply(this, args);
};

function isUserRequest(url: URL) {
    if (url.hostname !== 'twitter.com' && url.hostname !== 'x.com') {
        return false;
    }

    if (!url.pathname.startsWith('/i/api/graphql/')) {
        return false;
    }

    return url.pathname.endsWith('/UserByScreenName')
        || url.pathname.endsWith('/UserByRestId');
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
    user_id: string;
    screen_name: string;
    name: string;
}

type TwitterUserResult = Discriminated<TwitterUserResultGQL, TwitterUserResultREST>;

async function cacheTwitterUser(user: TwitterUserResult) {
    const resolved = resolveTwitterUser(user);
    if (!resolved) {
        return;
    }

    const key = resolved.username.toLowerCase();

    await cache.users.put({
        key,
        timestamp: new Date().getTime(),
        value: resolved,
    });

    dispatchEvent(new CustomEvent('cache-twitter-user', { detail: key }));
}

function resolveTwitterUser(user: TwitterUserResult): Optional<TwitterUser> {
    if (user.__typename === 'User') {
        return {
            id: user.rest_id,
            username: user.legacy.screen_name,
            nickname: user.legacy.name,
        };
    } else if (user.user_id) {
        return {
            id: user.user_id,
            username: user.screen_name,
            nickname: user.name,
        };
    }
}
