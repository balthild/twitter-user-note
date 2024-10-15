import styled from '@emotion/styled';
import { produce } from 'immer';
import { useEffect, useState } from 'react';
import { recordKeyPrefix, recordStorage } from './storage';

async function getRecords() {
    const entries = Object.entries(await recordStorage.getAll());

    return entries.map(([key, value]) => {
        let record = JSON.parse(value);
        if (typeof record === 'string') {
            record = { note: record };
        }

        return produce(record as LocalRecord, (draft) => {
            draft.id = key;
        });
    });
}

function subscribeRecords(callback: () => void) {
    const listener = (changes: object) => {
        for (const key in changes) {
            if (key.startsWith(recordKeyPrefix)) {
                return callback();
            }
        }
    };

    recordStorage.primaryClient.onChanged.addListener(listener);

    return () => recordStorage.primaryClient.onChanged.removeListener(listener);
}

function useRecords(): LocalRecord[] {
    const [records, setRecords] = useState<LocalRecord[]>([]);

    useEffect(() => {
        getRecords().then(setRecords);
        return subscribeRecords(() => getRecords().then(setRecords));
    }, []);

    return records;
}

export default function ListNotes() {
    const records = useRecords();

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
                    {records.map((record) => (
                        <tr key={record.id}>
                            <DataCell>
                                <CellParagraph>
                                    {record.nickname && <RecordNickname>{record.nickname}{' '}</RecordNickname>}
                                    {record.username && <RecordUsername>@{record.username}</RecordUsername>}
                                </CellParagraph>
                                <RecordId>{record.id}</RecordId>
                            </DataCell>
                            <DataCell>
                                <CellParagraph>{record.note}</CellParagraph>
                            </DataCell>
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

const DataCell = styled.td`
    padding: 0.25em;
    border-bottom: 1px solid darkgray;
    line-height: 1.25;
`;

const CellParagraph = styled.p`
    margin: 0.25em 0;

    &:empty {
        display: none;
    }
`;

const RecordId = styled(CellParagraph)`
    font-size: 0.9em;
    color: gray;
`;

const RecordNickname = styled.span`
    font-weight: bolder;
    margin-right: 0.25em;
`;

const RecordUsername = styled.span`
    color: gray;
`;
