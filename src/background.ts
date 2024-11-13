import { noop } from './utils/misc';
import { migrateLegacyNotes } from './utils/note';
import { sync } from './utils/sync';
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

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    if (message.action === 'sync-notes') {
        waitUntil(sync());
    }
});

chrome.runtime.onInstalled.addListener(() => {
    waitUntil(migrateLegacyNotes());
});

// https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep-sw-alive
function waitUntil(promise: Promise<void>) {
    const keepAlive = setInterval(chrome.runtime.getPlatformInfo, 25 * 1000);
    promise.catch(noop).then(() => clearInterval(keepAlive));
}
