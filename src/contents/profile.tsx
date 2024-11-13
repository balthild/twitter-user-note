import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { PlasmoCreateShadowRoot, PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetShadowHostId } from 'plasmo';

import { Note } from '~/components/Note';
import { useTwitterProfileUser } from '~/hooks/user';
import { ContentScriptFactory } from '~/utils/plasmo';

const factory = new ContentScriptFactory(import.meta);

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () => ({
    element: document.querySelector('[data-testid="UserName"]')!,
    insertPosition: 'afterend',
});

export const createShadowRoot: PlasmoCreateShadowRoot = factory.getShadowRootFactory();

export const getShadowHostId: PlasmoGetShadowHostId = () => factory.getShadowHostId();

export default function () {
    const user = useTwitterProfileUser();

    return (
        <CacheProvider value={factory.getEmotionCache()}>
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
