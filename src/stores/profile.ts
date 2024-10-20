import { getTwitterUsernameLowercase } from '../utils/url';
import { CachedExternalStore as Store } from './base';
import { TwitterUserStore } from './user';

export class ProfileUsernameStore extends Store<string> {
    public constructor() {
        super();

        if (window.navigation) {
            window.navigation.addEventListener('navigatesuccess', () => {
                this.update(location.pathname);
            });
        } else {
            chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
                if (message && message.action === 'url-changed') {
                    this.update(message.pathname);
                }
            });
        }

        this.update(location.pathname);
    }

    private update(pathname: string) {
        const tx = this.transaction();
        const name = getTwitterUsernameLowercase(pathname);
        return tx.put(name).commit();
    }
}

export class ProfileUserStore extends TwitterUserStore {}

export const twitterProfileUsernameStore = new ProfileUsernameStore();

export const twitterProfileUserStore = new ProfileUserStore(twitterProfileUsernameStore);
