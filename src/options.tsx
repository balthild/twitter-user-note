import styled from '@emotion/styled';
import { FormEventHandler, useRef } from 'react';

import { BaseContainer, Button } from './components/styled';
import { useExecutor } from './hooks/misc';
import { useNoteList } from './hooks/note';
import { download } from './utils/misc';
import { dump, merge } from './utils/sync';

export default function ListNotes() {
    const notes = useNoteList();

    const executor = useExecutor();

    const onExport = executor.wrap(async () => {
        const date = new Date().toLocaleString('sv').split(' ').shift();
        const name = `note-export-${date}.json`;

        const data = await dump();
        const json = JSON.stringify(data, null, 2);

        download(name, json);
    });

    const onPick = () => {
        executor.clear();
        requestIdleCallback(() => importInputRef.current?.click());
    };

    const onImport = executor.wrap<FormEventHandler<HTMLInputElement>>(async (e) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        e.currentTarget.value = '';

        const json = await file.text();
        const data = JSON.parse(json);

        await merge(data);
        await chrome.runtime.sendMessage<ExtensionMessage>({
            action: 'sync-notes',
            name: 'twitter',
        });
    });

    const importInputRef = useRef<HTMLInputElement>(null);

    return (
        <Container>
            <Section>
                <h1>Twitter User Notes</h1>
            </Section>

            <Actions className={notes ? '' : 'hidden'}>
                <Button className="light" disabled={executor.working} onClick={onExport}>Export</Button>
                <Button className="light" disabled={executor.working} onClick={onPick}>Import</Button>
            </Actions>

            <input type="file" className="hidden" ref={importInputRef} onInput={onImport} />

            <ErrorMessage className={executor.error ? '' : 'hidden'}>
                <p>Error: {executor.error?.message}</p>
            </ErrorMessage>

            <Table>
                <thead>
                    <tr>
                        <HeadCell style={{ width: '40%' }}>User</HeadCell>
                        <HeadCell>Note</HeadCell>
                    </tr>
                </thead>
                <tbody>
                    {(notes ?? []).map(([id, note]) => (
                        <tr key={id}>
                            <ItemCell>
                                <Paragraph>
                                    {note.nickname && <NoteNickname>{note.nickname}{' '}</NoteNickname>}
                                    {note.username && <NoteUsername>@{note.username}</NoteUsername>}
                                </Paragraph>
                                <NoteId>{id}</NoteId>
                            </ItemCell>
                            <ItemCell>
                                <NoteText>{note.note}</NoteText>
                            </ItemCell>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

const Container = styled(BaseContainer)`
    font-size: 16px;
    margin: 2.5em auto 3em;
    padding: 0 2em;
    max-width: 1280px;
`;

const Section = styled.section`
    margin: 1.25rem 0;
`;

const ErrorMessage = styled(Section)`
    color: #cc0000;

    p {
        margin: 0;
    }
`;

const Actions = styled(Section)`
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', 'Liberation Sans', Arial, sans-serif, 'Apple  Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-size: 15px;
    display: flex;
    gap: 1em;
`;

const Table = styled.table`
    width: 100%;
    text-align: left;
    border-collapse: collapse;
`;

const HeadCell = styled.th`
    padding: 0.25em;
    border-bottom: 2px solid gray;
`;

const ItemCell = styled.td`
    padding: 0.25em;
    border-bottom: 1px solid darkgray;
    line-height: 1.25;
`;

const Paragraph = styled.p`
    margin: 0.25em 0;

    &:empty {
        display: none;
    }
`;

const NoteId = styled(Paragraph)`
    font-size: 0.9em;
    color: gray;
`;

const NoteText = styled(Paragraph)`
    white-space: pre-wrap;
`;

const NoteNickname = styled.span`
    font-weight: bolder;
    margin-right: 0.25em;
`;

const NoteUsername = styled.span`
    color: gray;
`;
