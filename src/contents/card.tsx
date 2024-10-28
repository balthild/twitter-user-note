import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import {
    PlasmoCreateShadowRoot,
    PlasmoCSConfig,
    PlasmoCSUIProps,
    PlasmoGetInlineAnchor,
    PlasmoGetShadowHostId,
} from 'plasmo';

import { Note } from '~/components/Note';
import { useTwitterCardUser } from '~/hooks/user';
import { createShadowEmotion } from '~/utils/style';

const emotion = createShadowEmotion('twitter-user-note-card-emotion');

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
    const card = document.querySelector('[data-testid="HoverCard"]');
    const link = card?.querySelector('a[role="link"][href^="/"][href$="/following"]');

    const anchor = link ? card!.querySelector(':scope > div > div > div:nth-child(2)') : null;

    return {
        element: anchor!,
        insertPosition: 'afterend',
    };
};

export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost) => {
    const root = shadowHost.attachShadow({ mode: 'open' });
    emotion.sheet.attach(root);
    return root;
};

export const getShadowHostId: PlasmoGetShadowHostId = () => 'twitter-user-note-card-shadow-host';

export default function (props: PlasmoCSUIProps) {
    const user = useTwitterCardUser(props.anchor);

    return (
        <CacheProvider value={emotion.cache}>
            <Container>
                <Note user={user} readonly={true} />
            </Container>
        </CacheProvider>
    );
}

const Container = styled.section`
    width: 100%;
    margin-top: 0.8rem;
`;
