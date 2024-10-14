chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (!changeInfo.url) {
        return;
    }

    const url = new URL(changeInfo.url);
    if (!isTwitterUrl(url)) {
        return;
    }

    chrome.tabs.sendMessage<ExtensionMessage>(tabId, {
        action: 'url-changed',
        href: url.href,
        pathname: url.pathname,
    });
});

function isTwitterUrl(url: URL) {
    return url.hostname === 'twitter.com'
        || url.hostname === 'x.com';
}
