import { CachedExternalStore } from './base';

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

class TwitterUsernameStore extends CachedExternalStore<string> {
    public constructor() {
        super();

        if (window.navigation) {
            window.navigation.addEventListener('navigatesuccess', () => {
                this.update(location.pathname);
            });
        } else {
            chrome.runtime.onMessage.addListener((message) => {
                if (message && message.action === 'url-changed') {
                    this.update(message.pathname);
                }
            });
        }

        this.update(location.pathname);
    }

    private update(pathname: string) {
        const tx = this.transaction();

        const segments = pathname.split('/').slice(1);
        if (segments.length === 0) {
            return tx.remove().commit();
        }

        const name = segments[0].toLowerCase();
        if (NON_USERNAMES.has(name)) {
            return tx.remove().commit();
        }

        return tx.put(name.toLowerCase()).commit();
    }
}

export const username = new TwitterUsernameStore();
