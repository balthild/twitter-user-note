interface UrlChangedMessage {
    action: 'url-changed';
    href: string;
    pathname: string;
}

interface UnknownMessage {
    action: never;
}

type ExtensionMessage = UrlChangedMessage | UnknownMessage;
