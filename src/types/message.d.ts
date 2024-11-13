interface UrlChangedMessage {
    action: 'url-changed';
    href: string;
    pathname: string;
}

interface SyncNotesMessage {
    action: 'sync-notes';
    name: string;
}

interface UnknownMessage {
    action: never;
}

type ExtensionMessage =
    | UrlChangedMessage
    | SyncNotesMessage
    | UnknownMessage;
