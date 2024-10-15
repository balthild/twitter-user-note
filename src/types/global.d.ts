interface WindowEventMap {
    'cache-twitter-user': CustomEvent<{ id: string; key: string; }>;
}

type Optional<T> = T | undefined;

type ExcludeComplementaryFields<T, U> = {
    [K in Exclude<keyof U, keyof T>]?: never;
};

type Discriminated<T, U> =
    | (T & ExcludeComplementaryFields<T, U>)
    | (U & ExcludeComplementaryFields<U, T>);
