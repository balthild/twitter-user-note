import { produce } from 'immer';
import { useSyncExternalStore } from 'react';

export interface TwitterUser {
    readonly id: string;
    readonly username: string;
    readonly nickname: string;
}

type Listener = () => void;

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

class TwitterUserStore {
    private listeners: Listener[] = [];

    private current: TwitterUser | undefined = undefined;

    public constructor() {
        window.navigation.addEventListener('navigatesuccess', () => this.update());

        const observer = new MutationObserver((updates) => {
            for (const update of updates) {
                for (const node of update.addedNodes) {
                    if (node instanceof HTMLScriptElement === false) {
                        continue;
                    }
                    if (node.dataset.testid !== 'UserProfileSchema-test') {
                        continue;
                    }

                    this.update();

                    return;
                }
            }
        });

        observer.observe(document.head, {
            childList: true,
        });
    }

    private update() {
        const segments = location.pathname.split('/').slice(1);
        if (segments.length !== 1) {
            return this.remove();
        }

        const name = segments[0].toLowerCase();
        if (NON_USERNAMES.has(name)) {
            return this.remove();
        }

        const selector = 'script[data-testid="UserProfileSchema-test"]';
        const scripts = document.querySelectorAll(selector);

        for (const script of scripts) {
            const json = script?.textContent;
            if (!json) {
                continue;
            }

            const profile = JSON.parse(json);
            if (profile?.author?.additionalName?.toLowerCase() !== name) {
                continue;
            }

            if (process.env.NODE_ENV !== 'production') {
                console.log(profile.author);
            }

            this.current = produce(this.current ?? {} as TwitterUser, (draft) => {
                draft.id = profile.author.identifier;
                draft.username = profile.author.additionalName;
                draft.nickname = profile.author.givenName;
            });

            return this.trigger();
        }

        this.remove();
    }

    private remove() {
        this.current = undefined;
        this.trigger();
    }

    private trigger() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    public subscribe = (callback: Listener) => {
        this.listeners.push(callback);
        return () => this.unsubscribe(callback);
    };

    public unsubscribe = (callback: Listener) => {
        this.listeners = this.listeners.filter((x) => x != callback);
    };

    public getSnapshot = (): TwitterUser | undefined => {
        return this.current;
    };
}

export const store = new TwitterUserStore();

export function useTwitterUser(): TwitterUser | undefined {
    return useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
    );
}
