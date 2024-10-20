import { produce } from 'immer';

import { cache } from '../utils/cache';
import { CachedExternalStore } from './base';

export class TwitterUserStore extends CachedExternalStore<TwitterUser> {
    public constructor(private key: CachedExternalStore<string>) {
        super();

        key.subscribe(this.update);

        addEventListener('cache-twitter-user', (event) => {
            if (event.detail.key === this.key.getSnapshot()) {
                this.update();
            }
        });

        this.update();
    }

    private update = async () => {
        const tx = this.transaction();

        const key = this.key.getSnapshot();
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
