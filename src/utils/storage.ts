interface StorageChange<T = any> extends chrome.storage.StorageChange {
    newValue?: T;
    oldValue?: T;
}

type WatchItemCallback<T = any> = (change: StorageChange<T>) => void;
type WatchAllCallback<T = any> = (entries: [string, StorageChange<T>][]) => void;

interface StorageCollectionConfig {
    area: chrome.storage.StorageArea;
    collection?: string;
    timestamp?: boolean;
}

export class StorageCollection<V = any> {
    private callbacksItem: Record<string, WatchItemCallback[]> = {};
    private callbacksAll: WatchAllCallback[] = [];

    constructor(protected readonly config: StorageCollectionConfig) {
        if (config.collection && !/^(\/[0-9A-Za-z_]+)+\/$/.test(config.collection)) {
            throw new Error('Invalid storage collection');
        }

        this.area().onChanged.addListener((changes) => {
            this.onChange(changes);
        });
    }

    public area() {
        return this.config.area;
    }

    public prefix() {
        return this.config.collection ?? '';
    }

    public async get<T extends V = V>(key: string) {
        const rawKey = this.addPrefix(key);
        const rawItems = await this.area().get([rawKey]);
        if (!rawItems[rawKey]) return;

        return JSON.parse(rawItems[rawKey]) as T;
    }

    public async getAll<T extends V = V>() {
        const items = await this.area().get(null);

        const entries = [] as [string, T][];
        for (const [rawKey, rawValue] of Object.entries(items)) {
            if (this.hasPrefix(rawKey) && rawValue !== undefined) {
                const key = this.removePrefix(rawKey);
                const value = JSON.parse(rawValue);
                entries.push([key, value]);
            }
        }

        return entries;
    }

    public async set<T extends V = V>(key: string, value: T, timestamp?: boolean) {
        if (timestamp ?? this.config.timestamp) {
            value = { ...value, timestamp: new Date().toISOString() };
        }

        const rawKey = this.addPrefix(key);
        const rawValue = JSON.stringify(value);

        await this.area().set({
            [rawKey]: rawValue,
        });
    }

    public async remove(key: string) {
        const rawKey = this.addPrefix(key);
        await this.area().remove([rawKey]);
    }

    public watch<T extends V = V>(key: string, callback: WatchItemCallback<T>) {
        const callbacks = this.callbacksItem[key] ??= [];
        return this.addCallback(callbacks, callback);
    }

    public watchAll<T extends V = V>(callback: WatchAllCallback<T>) {
        const callbacks = this.callbacksAll;
        return this.addCallback(callbacks, callback);
    }

    private addCallback<F>(callbacks: F[], callback: F) {
        const index = callbacks.indexOf(callback);
        if (index === -1) {
            callbacks.push(callback);
        }

        return () => this.removeCallback(callbacks, callback);
    }

    private removeCallback<F>(callbacks: F[], callback: F) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    private onChange(changes: Record<string, StorageChange>) {
        const entries = [] as [string, StorageChange][];

        for (const [rawKey, rawChange] of Object.entries(changes)) {
            if (!this.hasPrefix(rawKey)) continue;

            const key = this.removePrefix(rawKey);
            const change = {} as StorageChange;

            if (rawChange.oldValue !== undefined) {
                change.oldValue = JSON.parse(rawChange.oldValue);
            }
            if (rawChange.newValue !== undefined) {
                change.newValue = JSON.parse(rawChange.newValue);
            }

            entries.push([key, change]);
        }

        for (const callback of this.callbacksAll) {
            callback(entries);
        }

        for (const [key, change] of entries) {
            for (const callback of this.callbacksItem[key] ?? []) {
                callback(change);
            }
        }
    }

    protected hasPrefix(rawKey: string) {
        return rawKey.startsWith(this.prefix());
    }

    protected removePrefix(rawKey: string) {
        return rawKey.substring(this.prefix().length);
    }

    protected addPrefix(key: string) {
        return this.prefix() + key;
    }
}

export const collections = Object.freeze({
    note: Object.freeze({
        twitter: new StorageCollection<Stored<Note>>({
            area: chrome.storage.local,
            collection: '/notes/twitter/',
            timestamp: true,
        }),
    }),
    settings: Object.freeze({
        sync: new StorageCollection({
            area: chrome.storage.sync,
            collection: '/settings/',
        }),
        local: new StorageCollection({
            area: chrome.storage.local,
            collection: '/settings/',
        }),
    }),
});
