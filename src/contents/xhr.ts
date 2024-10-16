import type { PlasmoCSConfig } from 'plasmo';

import { cache, cleanupCache } from '../utils/cache';
import { isFollowingAPI, isNotificationsAPI, isRecommandationsAPI, isUserAPI } from '../utils/url';

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
    world: 'MAIN',
    run_at: 'document_start',
};

requestIdleCallback(cleanupCache);

const open = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (...args: any) {
    const url = new URL(args[1]);
    if (isUserAPI(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            const user = json.data?.user?.result;
            if (!user) return;

            cacheTwitterUser(user);
        });
    } else if (isNotificationsAPI(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            const users = json.globalObjects?.users;
            if (!users) return;

            for (const user of Object.values(users)) {
                cacheTwitterUser(user as TwitterUserResult);
            }
        });
    } else if (isRecommandationsAPI(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            if (!json || !json[0]) return;

            for (const item of json) {
                cacheTwitterUser(item.user as TwitterUserResult);
            }
        });
    } else if (isFollowingAPI(url)) {
        this.addEventListener('load', () => {
            const json = JSON.parse(this.response);
            if (!json || !json[0]) return;

            for (const user of json) {
                cacheTwitterUser(user as TwitterUserResult);
            }
        });
    }

    return open.apply(this, args);
};

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
    if (!resolved) return;

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
