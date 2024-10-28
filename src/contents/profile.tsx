import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { PlasmoCreateShadowRoot, PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetShadowHostId } from 'plasmo';

import { Note } from '~/components/Note';
import { useTwitterProfileUser } from '~/hooks/user';
import { createShadowEmotion } from '~/utils/style';

const emotion = createShadowEmotion('twitter-user-note-profile-emotion');

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () => ({
    element: document.querySelector('[data-testid="UserName"]')!,
    insertPosition: 'afterend',
});

export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost) => {
    const root = shadowHost.attachShadow({ mode: 'open' });
    emotion.sheet.attach(root);
    return root;
};

export const getShadowHostId: PlasmoGetShadowHostId = () => 'twitter-user-note-profile-shadow-host';

export default function () {
    const user = useTwitterProfileUser();

    return (
        <CacheProvider value={emotion.cache}>
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
