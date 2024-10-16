import { produce } from 'immer';

import { cache } from '../utils/cache';
import { CachedExternalStore } from './base';
import { username } from './username';

class TwitterUserStore extends CachedExternalStore<TwitterUser> {
    public constructor() {
        super();

        username.subscribe(this.update);

        addEventListener('cache-twitter-user', (event) => {
            if (event.detail.key === username.getSnapshot()) {
                this.update();
            }
        });

        this.update();
    }

    private update = async () => {
        const tx = this.transaction();

        const key = username.getSnapshot();
        if (!key) {
            return tx.remove().commit();
        }

        const result = await cache.users.get(key);
        if (!result) {
            return tx.remove().commit();
        }

        const current = this.getSnapshot();
        const value = produce(current ?? {} as TwitterUser, (draft) => {
            draft.id = result.value.id;
            draft.username = result.value.username;
            draft.nickname = result.value.nickname;
        });

        return tx.put(value).commit();
    };
}

export const user = new TwitterUserStore();
