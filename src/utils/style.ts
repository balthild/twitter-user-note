import createCache, { EmotionCache } from '@emotion/cache';
import { StyleSheet } from '@emotion/sheet';

import { dev } from './misc';
import { IterableWeakSet } from './weakset';

export interface ShadowEmotion {
    readonly cache: EmotionCache;
    readonly sheet: ShadowStyleSheet;
}

// https://github.com/PlasmoHQ/plasmo/issues/1054
export function createShadowEmotion(key: string): ShadowEmotion {
    const cache = createCache({ key });

    const sheet = new ShadowStyleSheet({
        key: cache.key,
        container: document.createElement('head'),
    });

    cache.sheet = sheet;

    return { cache, sheet };
}

class ShadowStyleSheet extends StyleSheet {
    protected roots = new IterableWeakSet<ShadowRoot>();

    protected sheets: CSSStyleSheet[] = [];

    attach(root: ShadowRoot) {
        this.roots.add(root);
        this.adopt(root);
    }

    hydrate(nodes: HTMLStyleElement[]) {
        super.hydrate(nodes);

        for (const node of nodes) {
            this.sheets.push(node.sheet ?? new CSSStyleSheet());
        }

        if (nodes.length) {
            this.roots.forEach(this.adopt);
        }
    }

    insert(rule: string) {
        super.insert(rule);

        if (this.sheets.length < this.tags.length) {
            this.sheets.push(new CSSStyleSheet());
            this.roots.forEach(this.adopt);
        }

        const sheet = this.sheets[this.sheets.length - 1];

        try {
            sheet.insertRule(rule, sheet.cssRules.length);
        } catch (e) {
            const unsupported =
                /:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear|-ms-expand|-ms-reveal){/;

            if (dev() && !unsupported.test(rule)) {
                console.error(`There was a problem inserting the following rule: "${rule}"`, e);
            }
        }
    }

    flush() {
        super.flush();

        this.sheets = [];
        this.roots.forEach(this.adopt);
    }

    protected adopt = (root: ShadowRoot) => {
        root.adoptedStyleSheets = this.sheets;
    };
}
