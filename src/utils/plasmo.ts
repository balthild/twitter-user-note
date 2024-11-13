import { PlasmoCreateShadowRoot } from 'plasmo';

import { debug, dev, module } from './misc';
import { createShadowEmotion, ShadowEmotion } from './style';

const BaseInternalID = dev('twitter-user-note', window.crypto.randomUUID());

export class ContentScriptFactory {
    private name: string;
    private emotion!: ShadowEmotion;

    public constructor(meta: ImportMeta) {
        debug('Content Script Factory Created', meta);
        this.name = module(meta).replace(/[^0-9A-Za-z_]+/g, '-');
    }

    protected getId(scope: string) {
        return `${BaseInternalID}__${scope}__${this.name}`;
    }

    protected getEmotion() {
        if (!this.emotion) {
            this.emotion = createShadowEmotion(this.getId('emotion'));
        }

        return this.emotion;
    }

    public getEmotionCache() {
        const emotion = this.getEmotion();
        return emotion.cache;
    }

    public getShadowRootFactory(): PlasmoCreateShadowRoot {
        const emotion = this.getEmotion();

        return (shadowHost) => {
            const root = shadowHost.attachShadow({ mode: 'open' });
            emotion.sheet.attach(root);
            return root;
        };
    }

    public getShadowHostId() {
        return this.getId('shadow-host');
    }
}
