interface UrlChangedMessage {
    action: 'url-changed';
    href: string;
    pathname: string;
}

type ExtensionMessage = UrlChangedMessage | Record<string, any>;
