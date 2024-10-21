import { TwitterURL } from './utils/twitter';

chrome.action.onClicked.addListener(() => {
    return chrome.runtime.openOptionsPage();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (!changeInfo.url) return;

    const url = new URL(changeInfo.url);
    if (!TwitterURL.isTwitterDomain(url)) return;

    chrome.tabs.sendMessage<ExtensionMessage>(tabId, {
        action: 'url-changed',
        href: url.href,
        pathname: url.pathname,
    });
});
