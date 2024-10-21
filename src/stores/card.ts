import { TwitterURL } from '../utils/twitter';
import { CachedExternalStore as Store } from './base';
import { TwitterUserStore } from './user';

export class CardUsernameStore extends Store<string> {
    private card: Optional<Element>;

    public setCard(card: Optional<Element>) {
        this.card = card;
        this.update();
    }

    private update() {
        const tx = this.transaction();

        if (!this.card) {
            return tx.remove().commit();
        }

        const links = this.card.querySelectorAll('a');
        for (const link of links ?? []) {
            const url = new URL(link.href);
            const name = TwitterURL.getUsernameLowercase(url.pathname);
            if (name) {
                return tx.put(name).commit();
            }
        }

        return tx.remove().commit();
    }
}

export class CardUserStore extends TwitterUserStore {}

export const twitterCardUsernameStore = new CardUsernameStore();

export const twitterCardUserStore = new CardUserStore(twitterCardUsernameStore);
