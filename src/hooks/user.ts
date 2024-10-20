import type { PlasmoCSUIAnchor } from 'plasmo';
import { useEffect } from 'react';

import { twitterCardUsernameStore, twitterCardUserStore } from '../stores/card';
import { twitterProfileUserStore } from '../stores/profile';
import { useStore } from './misc';

export function useTwitterProfileUser() {
    return useStore(twitterProfileUserStore);
}

export function useTwitterCardUser(anchor?: PlasmoCSUIAnchor) {
    useEffect(() => {
        twitterCardUsernameStore.setCard(anchor?.element);
    }, [anchor?.element]);

    return useStore(twitterCardUserStore);
}
