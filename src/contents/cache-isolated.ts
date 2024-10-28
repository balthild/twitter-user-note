import { PlasmoCSConfig } from 'plasmo';

import { normalizeNote } from '~/hooks/note-item';
import { cache, cleanupCache } from '~/utils/cache';
import { debug } from '~/utils/misc';
import { noteStorage } from '~/utils/storage';

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
    run_at: 'document_start',
};

listenCacheEvent();
requestIdleCallback(cleanupCache);

function listenCacheEvent() {
    addEventListener('cache-twitter-user', async (event) => {
        const user = await cache.users.get(event.detail.key);
        if (!user) return;

        const stored = await noteStorage.get<StoredNote>(event.detail.id);
        if (!stored) return;

        let note = normalizeNote(user.value, stored);
        if (!note) return;

        if (stored !== note) {
            await noteStorage.set(event.detail.id, note);
            debug('Updated User Info in Note:', note);
        }
    });

    debug('Listening Cache Event');
}
