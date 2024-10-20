import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetShadowHostId, PlasmoGetStyle } from 'plasmo';

import { Note } from '../components/Note';
import { useEmotionWorkaround } from '../hooks/misc';
import { useTwitterProfileUser } from '../hooks/user';

const styleElement = document.createElement('style');

const styleCache = createCache({
    key: 'twitter-user-note-profile-emotion-cache',
    container: styleElement,
});

export const getStyle: PlasmoGetStyle = () => styleElement;

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () => ({
    element: document.querySelector('[data-testid="UserName"]')!,
    insertPosition: 'afterend',
});

export const getShadowHostId: PlasmoGetShadowHostId = () => 'twitter-user-note-profile-shadow-host';

export default function () {
    useEmotionWorkaround(styleCache);

    const user = useTwitterProfileUser();

    return (
        <CacheProvider value={styleCache}>
            <Container>
                <Note user={user} readonly={false} />
            </Container>
        </CacheProvider>
    );
}

const Container = styled.section`
    width: 100%;
    margin-bottom: 1.25rem;
`;
