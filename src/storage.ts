import { Storage } from '@plasmohq/storage';

export const recordKeyPrefix = '/notes/';
export const recordStorage = new Storage();
recordStorage.setNamespace(recordKeyPrefix);
