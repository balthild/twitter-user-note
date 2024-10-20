import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import type {
    PlasmoCSConfig,
    PlasmoCSUIProps,
    PlasmoGetInlineAnchor,
    PlasmoGetShadowHostId,
    PlasmoGetStyle,
} from 'plasmo';

import { Note } from '../components/Note';
import { useEmotionWorkaround } from '../hooks/misc';
import { useTwitterCardUser } from '../hooks/user';

const styleElement = document.createElement('style');

const styleCache = createCache({
    key: 'twitter-user-note-card-emotion-cache',
    container: styleElement,
});

export const getStyle: PlasmoGetStyle = () => styleElement;

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

export const getShadowHostId: PlasmoGetShadowHostId = () => 'twitter-user-note-card-shadow-host';

export default function (props: PlasmoCSUIProps) {
    useEmotionWorkaround(styleCache);

    const user = useTwitterCardUser(props.anchor);

    return (
        <CacheProvider value={styleCache}>
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
