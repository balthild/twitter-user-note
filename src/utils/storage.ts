import { Storage } from '@plasmohq/storage';

export const noteKeyPrefix = '/notes/';
export const noteStorage = new Storage();
noteStorage.setNamespace(noteKeyPrefix);
