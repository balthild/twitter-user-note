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
import { ContentScriptFactory } from '~/utils/plasmo';

const factory = new ContentScriptFactory(import.meta);

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

export const createShadowRoot: PlasmoCreateShadowRoot = factory.getShadowRootFactory();

export const getShadowHostId: PlasmoGetShadowHostId = () => factory.getShadowHostId();

export default function (props: PlasmoCSUIProps) {
    const user = useTwitterCardUser(props.anchor);

    return (
        <CacheProvider value={factory.getEmotionCache()}>
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
