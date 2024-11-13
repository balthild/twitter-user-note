import styled from '@emotion/styled';
import { FormEventHandler, KeyboardEventHandler, useId, useLayoutEffect, useRef, useState } from 'react';

import { useEditable } from '~/hooks/misc';
import { useNote } from '~/hooks/note-item';
import { noop } from '~/utils/misc';

import { Button } from './Button';

export interface NoteProps {
    user: Optional<TwitterUser>;
    readonly: boolean;
}

export function Note(props: NoteProps) {
    const user = props.user;
    const note = useNote(user);

    const input = useEditable(note?.note ?? '', note?.setText ?? noop);

    const [renderedUserId, setRenderedUserId] = useState(user?.id);
    if (user?.id !== renderedUserId) {
        setRenderedUserId(user?.id);
        input.cancel();
    }

    const loading = !user || !note;
    const working = loading || input.saving;

    const onInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
        e.preventDefault();
        input.input(e.currentTarget.value);
    };

    const onType: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.currentTarget.form?.requestSubmit();
        }
    };

    const onFocus = () => {
        if (!working && !props.readonly) {
            input.edit();
        }
    };

    const onBlur = () => {
        if (!input.dirty) {
            input.cancel();
        }
    };

    const onCancel = () => {
        input.cancel();
    };

    const onSave: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        input.persist();
    };

    const inputId = useId();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        if (!inputRef.current) return;

        inputRef.current.style.height = 'unset';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }, [input.rendered]);

    return (
        <Form onSubmit={onSave}>
            <Label htmlFor={inputId}>Note</Label>

            <Textarea
                id={inputId}
                ref={inputRef}
                onInput={onInput}
                onKeyDown={onType}
                onFocus={onFocus}
                onBlur={onBlur}
                className={props.readonly ? 'readonly' : 'editable'}
                placeholder={loading ? 'Loading...' : 'Write a note...'}
                readOnly={!input.editing}
                disabled={working}
                value={input.rendered}
            />

            <Actions className={input.dirty ? 'show' : ''}>
                <Button type="submit" className="primary" disabled={working}>
                    Save
                </Button>
                <Button type="button" disabled={working} onClick={onCancel}>
                    Cancel
                </Button>
            </Actions>
        </Form>
    );
}

const Form = styled.form`
    width: 100%;
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
    user-select: none;
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
    background: light-dark(#eff1f5, rgb(255 255 255 / 10%));

    &.readonly {
        outline: none;
    }

    &.editable {
        outline-color: #1d9bf0;

        &:focus {
            background: transparent;
        }
    }
`;

const Actions = styled.div`
    display: none;
    margin-top: 0.75rem;
    gap: 0.75rem;

    &.show {
        display: flex;
    }
`;
