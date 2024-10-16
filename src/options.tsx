import styled from '@emotion/styled';

import { useAllNotes } from './hooks/note-all';

export default function ListNotes() {
    const notes = useAllNotes();

    return (
        <Container>
            <h1>Twitter User Notes</h1>

            <Table>
                <thead>
                    <tr>
                        <HeadCell style={{ width: '40%' }}>User</HeadCell>
                        <HeadCell>Note</HeadCell>
                    </tr>
                </thead>
                <tbody>
                    {notes.map(([id, note]) => (
                        <tr key={id}>
                            <ItemCell>
                                <Paragraph>
                                    {note.nickname && <NoteNickname>{note.nickname}{' '}</NoteNickname>}
                                    {note.username && <NoteUsername>@{note.username}</NoteUsername>}
                                </Paragraph>
                                <NoteId>{id}</NoteId>
                            </ItemCell>
                            <ItemCell>
                                <Paragraph>{note.note}</Paragraph>
                            </ItemCell>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

const Container = styled.section`
    font-size: 16px;
    margin: 2.5em auto 3em;
    padding: 0 2em;
    max-width: 1280px;
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

const NoteNickname = styled.span`
    font-weight: bolder;
    margin-right: 0.25em;
`;

const NoteUsername = styled.span`
    color: gray;
`;
