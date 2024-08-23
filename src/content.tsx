import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useStorage } from '@plasmohq/storage/hook';
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import type {
    PlasmoCSConfig,
    PlasmoGetInlineAnchor,
    PlasmoGetShadowHostId,
    PlasmoGetStyle,
} from 'plasmo';
import type { FormEventHandler, KeyboardEventHandler } from 'react';

const styleElement = document.createElement('style');

const styleCache = createCache({
    key: 'twitter-user-note-emotion-cache',
    container: styleElement,
});

export const getStyle: PlasmoGetStyle = () => styleElement;

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/*', 'https://x.com/*'],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () => ({
    element: document.querySelector('[data-testid="UserName"]'),
    insertPosition: 'afterend',
});

export const getShadowHostId: PlasmoGetShadowHostId = () => 'twitter-user-note-shadow-host';

export default function () {
    useLayoutEffect(
        () => () => {
            styleCache.inserted = {};
        },
        [],
    );

    const userId = useSyncExternalStore(
        (callback) => {
            window.navigation.addEventListener('navigatesuccess', callback);

            const observer = new MutationObserver((updates) => {
                for (const update of updates) {
                    for (const node of update.addedNodes) {
                        if (node instanceof HTMLScriptElement === false) {
                            continue;
                        }
                        if (node.dataset.testid !== 'UserProfileSchema-test') {
                            continue;
                        }

                        callback();

                        return;
                    }
                }
            });

            observer.observe(document.head, {
                childList: true,
            });

            return () => {
                window.navigation.removeEventListener('navigatesuccess', callback);
                observer.disconnect();
            };
        },
        () => {
            const username = location.pathname.split('/')[1].toLowerCase();
            const scripts = document.querySelectorAll(
                'script[data-testid="UserProfileSchema-test"]',
            );
            for (const script of scripts) {
                const profile = JSON.parse(script?.textContent ?? null);
                if (profile?.author?.additionalName?.toLowerCase() !== username) {
                    continue;
                }

                return profile?.author?.identifier ?? null;
            }

            return '';
        },
    );

    const [noteValue, setNote, noteItem] = useStorage(userId ? `/notes/${userId}` : '');

    const [input, setInput] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const note = noteItem.isLoading ? '' : noteValue;
    const loading = noteItem.isLoading || saving;

    useEffect(() => {
        setEditing(false);
        setSaving(false);
    }, [userId]);

    const onInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
        e.preventDefault();
        setInput(e.currentTarget.value);
    };

    const onType: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.currentTarget.form.requestSubmit();
        }
    };

    const onEdit = () => {
        if (!userId || editing || loading) {
            return false;
        }

        setInput(note);
        setEditing(true);
    };

    const onCancel = () => {
        setEditing(false);
    };

    const onSave: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        setSaving(true);

        if (input.trim() === '') {
            noteItem.remove();
        } else {
            await setNote(input.trim());
        }

        setEditing(false);
        setSaving(false);
    };

    const inputId = useId();
    const inputRef = useRef<HTMLTextAreaElement>();
    const inputValue = userId && (editing ? input : note?.trim() ?? '');

    useLayoutEffect(() => {
        if (!inputRef.current) {
            return;
        }

        inputRef.current.style.height = 'unset';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }, [inputValue]);

    return (
        <CacheProvider value={styleCache}>
            <Form onSubmit={onSave} key={userId}>
                <Label htmlFor={inputId}>Note</Label>

                <Textarea
                    id={inputId}
                    ref={inputRef}
                    onInput={onInput}
                    onKeyDown={onType}
                    onClick={onEdit}
                    onFocus={onEdit}
                    placeholder="Write a note..."
                    className={editing ? 'editing' : ''}
                    readOnly={!editing}
                    disabled={loading}
                    value={inputValue}></Textarea>

                {editing && (
                    <Actions>
                        <Button type="submit" disabled={loading}>
                            Save
                        </Button>
                        <Button type="button" disabled={loading} onClick={onCancel}>
                            Cancel
                        </Button>
                    </Actions>
                )}
            </Form>
        </CacheProvider>
    );
}

const Form = styled.form`
    width: 100%;
    margin-bottom: 1.25rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
`;

const Label = styled.label`
    position: absolute;
    font-size: 0.8rem;
    line-height: 0.8rem;
    opacity: 0.5;
    top: 0.75rem;
    left: 0.75rem;
    pointer-events: none;
`;

const Textarea = styled.textarea`
    display: block;
    box-sizing: border-box;
    resize: none;
    overflow: hidden;
    min-height: 6rem;
    padding: 2rem 0.75rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: inherit;
    font-family: inherit;
    outline-color: #1d9bf0;
    background: light-dark(#eff1f5, rgb(255 255 255 / 10%));

    &:focus {
        background: transparent;
    }
`;

const Actions = styled.div`
    display: flex;
    margin-top: 0.75rem;
    gap: 0.75rem;
`;

const Button = styled.button`
    padding: 0 1.5em;
    line-height: 2.25em;
    font-size: inherit;
    font-family: inherit;
    border: none;
    border-radius: 0.125rem;
    transition: background-color 0.2s;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
    }

    &[type='submit'] {
        background: #1d9bf0;
        color: #ffffff;

        &:hover {
            background: #1a8cd8;
        }
    }

    &[type='button'] {
        background: light-dark(#eff1f5, rgb(255 255 255 / 15%));
        color: inherit;

        &:hover {
            background: light-dark(#e0e4eb, rgb(255 255 255 / 20%));
        }
    }
`;
