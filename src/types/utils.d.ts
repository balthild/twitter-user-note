interface ObjectConstructor {
    keys<T extends object>(o: T): KeyOfObject<T>[];
    fromEntries<K extends PropertyKey = any, T = any>(entries: Iterable<readonly [K, T]>): Record<K, T>;
}

type Optional<T> = T | undefined;

type Async<T> = Promise<T> | T;

type Pair<K, V> = readonly [K, V];

type ArgumentsOf<T> = T extends (...args: infer Args) => any ? Args : never;

type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;

type EntryOf<T, K = keyof T> = K extends keyof T ? [K, T[K]] : never;

type KeyOfObject<T extends object> = keyof T extends never ? string : keyof T;

type KeyOfUnion<T> = T extends any ? keyof T : never;

type ComplementaryFields<T, U> = {
    [K in Exclude<KeyOfUnion<U>, keyof T>]?: never;
};

type StrictComplementaryFields<T, U> = {
    [K in Exclude<KeyOfUnion<U>, keyof T>]: never;
};

type Discriminated<T, U> =
    | T & ComplementaryFields<T, U>
    | U & ComplementaryFields<U, T>;

type DiscriminatedMap<Map> = {
    [Tag in keyof Map]: Map[Tag] & StrictComplementaryFields<Map[Tag], ValueOf<Map>>;
};

type ExplicitPartial<T> = {
    [K in keyof Required<T>]: T[K];
};
