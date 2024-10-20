import styled from '@emotion/styled';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { FormEventHandler, KeyboardEventHandler } from 'react';

import { useNote } from '../hooks/note-item';

export interface NoteProps {
    user: Optional<TwitterUser>;
    readonly: boolean;
}

export function Note(props: NoteProps) {
    const user = props.user;
    const note = useNote(user);

    const [input, setInput] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [renderedUserId, setRenderedUserId] = useState(user?.id);
    if (user?.id !== renderedUserId) {
        setRenderedUserId(user?.id);
        setEditing(false);
        setSaving(false);
    }

    const loading = !user || !note;
    const working = loading || saving;

    const noteText = note?.note ?? '';
    const inputText = user ? (editing ? input : noteText) : '';
    const dirty = inputText !== noteText;

    const onInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
        e.preventDefault();
        setInput(e.currentTarget.value);
    };

    const onType: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.currentTarget.form?.requestSubmit();
        }
    };

    const onEdit = () => {
        if (!user || editing || working || props.readonly) {
            return false;
        }

        setInput(noteText);
        setEditing(true);
    };

    const onBlur = () => {
        if (editing && !dirty) {
            onCancel();
        }
    };

    const onCancel = () => {
        setEditing(false);
    };

    const onSave: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        setSaving(true);

        await note?.setText(input.trim());

        setEditing(false);
        setSaving(false);
    };

    const inputId = useId();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        if (!inputRef.current) return;

        inputRef.current.style.height = 'unset';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }, [inputText]);

    return (
        <Form onSubmit={onSave}>
            <Label htmlFor={inputId}>Note</Label>

            <Textarea
                id={inputId}
                ref={inputRef}
                onInput={onInput}
                onKeyDown={onType}
                onClick={onEdit}
                onFocus={onEdit}
                onBlur={onBlur}
                className={props.readonly ? 'readonly' : 'editable'}
                placeholder={loading ? 'Loading...' : 'Write a note...'}
                readOnly={!editing}
                disabled={working}
                value={inputText}
            />

            <Actions className={editing && dirty ? 'show' : ''}>
                <Button type="submit" disabled={working}>
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

const Button = styled.button`
    padding: 0.5em 1.5em;
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
