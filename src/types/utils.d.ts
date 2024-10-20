type Optional<T> = T | undefined;

type ExcludeComplementaryFields<T, U> = {
    [K in Exclude<keyof U, keyof T>]?: never;
};

type Discriminated<T, U> =
    | (T & ExcludeComplementaryFields<T, U>)
    | (U & ExcludeComplementaryFields<U, T>);

type ValueOf<T> = T[keyof T];

type KeyOfObject<T extends object> = keyof T extends never ? string : keyof T;

interface ObjectConstructor {
    keys<T extends object>(o: T): KeyOfObject<T>[];
}
