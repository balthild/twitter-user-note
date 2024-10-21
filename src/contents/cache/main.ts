import type { PlasmoCSConfig } from 'plasmo';

import { cache } from '../../utils/cache';
import { devLog, isDev, noop } from '../../utils/misc';
import { TwitterURL } from '../../utils/twitter';

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
    world: 'MAIN',
    run_at: 'document_start',
};

interceptFetch();
interceptXHR();

function interceptFetch() {
    const fetch = window.fetch;

    window.fetch = async function (...args) {
        const request = new Request(...args);
        const response = await fetch(request);

        const url = new URL(request.url);
        const clone = response.clone();
        interceptResponse(url, () => clone.json()).catch(noop);

        return response;
    };

    devLog('Intercepting Fetch');
}

function interceptXHR() {
    const open = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (...args: any) {
        this.addEventListener('load', () => {
            const url = new URL(args[1]);
            const response = () => {
                if (typeof this.response == 'object') {
                    return this.response;
                }
                if (typeof this.response === 'string') {
                    return JSON.parse(this.response);
                }

                return Promise.reject();
            };
            interceptResponse(url, response).catch(noop);
        });

        return open.apply(this, args);
    };

    devLog('Intercepting XHR');
}

async function interceptResponse(url: URL, response: <T>() => Promise<T>) {
    if (TwitterURL.API.isUser(url)) {
        const json = await response<TwitterAPI.Response.User>();
        const user = json.data.user.result;
        cacheTwitterUser(user);
        return;
    }

    if (TwitterURL.API.isHomeTimeline(url)) {
        const json = await response<TwitterAPI.Response.HomeTimeline>();
        const timeline = json.data.home.home_timeline_urt;
        processTimeline(timeline, cacheTwitterUser);
        return;
    }

    if (TwitterURL.API.isCommunityTimeline(url)) {
        const json = await response<TwitterAPI.Response.CommunityTimeline>();
        const timeline = json.data.communityResults.result.ranked_community_timeline.timeline;
        processTimeline(timeline, cacheTwitterUser);
        return;
    }

    if (TwitterURL.API.isUserTweets(url)) {
        const json = await response<TwitterAPI.Response.UserTweets>();
        const timeline = json.data.user.result.timeline_v2.timeline;
        processTimeline(timeline, cacheTwitterUser);
        return;
    }

    if (TwitterURL.API.isTweetDetail(url)) {
        const json = await response<TwitterAPI.Response.TweetDetail>();
        const timeline = json.data.threaded_conversation_with_injections_v2;
        processTimeline(timeline, cacheTwitterUser);
        return;
    }

    if (TwitterURL.API.isNotifications(url)) {
        const json = await response<TwitterAPI.REST.Response.Notifications>();
        const users = json.globalObjects.users ?? {};
        for (const user of Object.values(users)) {
            cacheTwitterUser(user);
        }
        return;
    }

    if (TwitterURL.API.isRecommandations(url)) {
        const json = await response<TwitterAPI.REST.Response.Recommendations>();
        for (const item of json) {
            cacheTwitterUser(item.user);
        }
        return;
    }

    if (TwitterURL.API.isFollowing(url)) {
        const json = await response<TwitterAPI.REST.Response.Following>();
        for (const user of json.users) {
            cacheTwitterUser(user);
        }
        return;
    }

    if (isDev() && !url.hostname.includes('twimg')) {
        const json = response();
        const text = JSON.stringify(json);
        if (text.includes('screen_name')) {
            console.warn(`Unmatched Fetch/XHR Request Containing User: ${url.origin}${url.pathname}`, json);
        }
    }
}

type WalkUserCallback = (user: TwitterAPI.User) => void;
function processTimeline(timeline: TwitterAPI.Timeline, callback: WalkUserCallback) {
    for (const instruction of timeline.instructions) {
        if (instruction.type === 'TimelinePinEntry') {
            processTweet(instruction.entry.content, callback);
            continue;
        }

        if (instruction.type === 'TimelineAddEntries') {
            processEntries(instruction.entries, callback);
            continue;
        }
    }

    function processEntries(entries: TwitterAPI.Timeline.Entry[], callback: WalkUserCallback) {
        for (const entry of entries) {
            const { entryType, displayType } = entry.content;

            if (entryType === 'TimelineTimelineItem') {
                processTweet(entry.content, callback);
                continue;
            }

            if (entryType === 'TimelineTimelineModule' && displayType === 'VerticalConversation') {
                for (const item of entry.content.items) {
                    processTweet(item.item, callback);
                }
                continue;
            }
        }
    }

    function processTweet(item: TwitterAPI.Timeline.ItemTypes['Tweet'], callback: WalkUserCallback) {
        const tweet = item.itemContent.tweet_results.result;
        const user = tweet.core.user_results.result;
        callback(user);
    }
}

type TwitterAPIUserMixed = Discriminated<TwitterAPI.User, TwitterAPI.REST.User>;

async function cacheTwitterUser(user: Optional<TwitterAPIUserMixed>) {
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

function resolveTwitterUser(user: Optional<TwitterAPIUserMixed>): Optional<TwitterUser> {
    if (!user) return;

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
