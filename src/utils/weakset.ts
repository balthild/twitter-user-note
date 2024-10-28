import { debug } from './misc';

// Fallbacks to normal `Set` if `WeakRef` is not available.
export class IterableWeakSet<T extends WeakKey> {
    protected impl = typeof WeakRef === 'function' ? new WeakRefSet<T>() : new Set<T>();

    public readonly add = (value: T) => this.impl.add(value);
    public readonly has = (value: T) => this.impl.has(value);
    public readonly delete = (value: T) => this.impl.delete(value);
    public readonly forEach = (callback: (value: T) => void) => this.impl.forEach(callback);
}

class WeakRefSet<T extends WeakKey> {
    protected weak = new WeakMap<T, WeakRef<T>>();
    protected ref = new Set<WeakRef<T>>();

    public add(value: T) {
        if (this.weak.has(value)) return;

        const ref = new WeakRef(value);
        this.weak.set(value, ref);
        this.ref.add(ref);
    }

    public has(value: T) {
        return this.weak.has(value);
    }

    public delete(value: T) {
        const ref = this.weak.get(value);
        if (ref === undefined) return;

        this.weak.delete(value);
        this.ref.delete(ref);
    }

    public forEach(callback: (value: T) => void) {
        let count = 0;

        this.ref.forEach((ref) => {
            const value = ref.deref();
            if (value !== undefined) {
                callback(value);
                count += 1;
            }
        });

        debug('WeakRefSet Iteration:', count);
    }
}
