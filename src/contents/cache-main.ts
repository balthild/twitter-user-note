import { PlasmoCSConfig } from 'plasmo';

import { cache } from '~/utils/cache';
import { debug, dev, noop } from '~/utils/misc';
import { TwitterURL } from '~/utils/twitter';

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

    debug('Intercepting Fetch');
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

    debug('Intercepting XHR');
}

async function interceptResponse(url: URL, response: <T>() => Async<T>) {
    const cacheTwitterUser = cacheTwitterUserDeduplicate();

    if (TwitterURL.API.isUser(url)) {
        const json = await response<TwitterAPI.Response.User>();
        const user = json.data.user.result;
        cacheTwitterUser(user);
        return;
    }

    if (TwitterURL.API.isUsersByRestIds(url)) {
        const json = await response<TwitterAPI.Response.UsersByRestIds>();
        const users = json.data.users;
        for (const user of users) {
            cacheTwitterUser(user.result);
        }
        return;
    }

    if (TwitterURL.API.isFollowing(url)) {
        const json = await response<TwitterAPI.Response.Following>();
        const timeline = json.data.user.result.timeline.timeline;
        processTimeline(timeline, cacheTwitterUser);
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

    if (TwitterURL.API.isPinnedTimelines(url)) {
        const json = await response<TwitterAPI.Response.PinnedTimelines>();
        const timelines = json.data.pinned_timelines.pinned_timelines;
        for (const timeline of timelines) {
            const community = timeline.community_results.result;
            cacheTwitterUser(community.creator_results.result);
            cacheTwitterUser(community.admin_results.result);
            for (const user of community.members_facepile_results) {
                cacheTwitterUser(user.result);
            }
        }
        return;
    }

    if (TwitterURL.API.isTweetDetail(url)) {
        const json = await response<TwitterAPI.Response.TweetDetail>();
        const timeline = json.data.threaded_conversation_with_injections_v2;
        processTimeline(timeline, cacheTwitterUser);
        return;
    }

    if (TwitterURL.API.REST.isNotifications(url)) {
        const json = await response<TwitterAPI.REST.Response.Notifications>();
        const users = json.globalObjects.users ?? {};
        for (const user of Object.values(users)) {
            cacheTwitterUser(user);
        }
        return;
    }

    if (TwitterURL.API.REST.isRecommandations(url)) {
        const json = await response<TwitterAPI.REST.Response.Recommendations>();
        for (const item of json) {
            cacheTwitterUser(item.user);
        }
        return;
    }

    if (TwitterURL.API.REST.isFollowing(url)) {
        const json = await response<TwitterAPI.REST.Response.Following>();
        const users = json.users;
        for (const user of users) {
            cacheTwitterUser(user);
        }
        return;
    }

    if (TwitterURL.API.REST.isUserUpdates(url)) {
        const json = await response<TwitterAPI.REST.Response.UserUpdates>();
        const users = json.users ?? {};
        for (const user of Object.values(users)) {
            cacheTwitterUser(user);
        }
        return;
    }

    if (dev() && !url.hostname.includes('twimg')) {
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
            processItem(instruction.entry.content, callback);
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
                processItem(entry.content, callback);
                continue;
            }

            if (entryType === 'TimelineTimelineModule' && displayType === 'VerticalConversation') {
                for (const item of entry.content.items) {
                    processItem(item.item, callback);
                }
                continue;
            }
        }
    }

    function processItem(item: TwitterAPI.Timeline.Item, callback: WalkUserCallback) {
        if (item.itemContent.itemType === 'TimelineTweet') {
            const tweet = item.itemContent.tweet_results.result;
            const user = tweet.core.user_results.result;
            callback(user);
            return;
        }

        if (item.itemContent.itemType === 'TimelineUser') {
            const user = item.itemContent.user_results.result;
            callback(user);
            return;
        }
    }
}

type TwitterAPIUserMixed = Discriminated<TwitterAPI.User, TwitterAPI.REST.User>;

function cacheTwitterUserDeduplicate() {
    const cached = new Set();

    return async (user: Optional<TwitterAPIUserMixed>) => {
        const resolved = resolveTwitterUser(user);
        if (!resolved) return;

        const id = resolved.id;
        if (cached.has(id)) return;

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

        cached.add(id);
    };
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
