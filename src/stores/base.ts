import { debug } from '~/utils/misc';

type Listener = () => void;

export abstract class CachedExternalStore<T> {
    private listeners: Listener[] = [];

    private current: Optional<T>;

    private tx!: Transaction<T>;

    public subscribe = (callback: Listener) => {
        if (!this.listeners.includes(callback)) {
            this.listeners.push(callback);
        }

        return () => this.unsubscribe(callback);
    };

    public unsubscribe = (callback: Listener) => {
        const index = this.listeners.indexOf(callback);
        if (index != -1) {
            this.listeners.splice(index, 1);
        }
    };

    public getSnapshot = (): Optional<T> => {
        return this.current;
    };

    protected transaction() {
        this.tx?.abort();

        return this.tx = new Transaction(
            this.current,
            (value: Optional<T>) => {
                this.current = value;
                this.emit();
            },
        );
    }

    private emit() {
        for (const listener of this.listeners) {
            listener();
        }

        debug(this.constructor.name, this.current);
    }
}

// Level = READ UNCOMMITTED
class Transaction<T> {
    private active = true;

    private live: Optional<T>;
    private backup: Optional<T>;

    private set: (value: Optional<T>) => void;

    constructor(current: Optional<T>, set: (value: Optional<T>) => void) {
        this.live = current;
        this.backup = current;
        this.set = set;
    }

    public put = (value: Optional<T>) => {
        if (this.active && this.live !== value) {
            this.live = value;
            this.set(value);
        }
        return this;
    };

    public remove = () => {
        return this.put(undefined);
    };

    public commit = () => {
        this.active = false;
    };

    public abort = () => {
        this.put(this.backup);
        this.active = false;
    };
}
