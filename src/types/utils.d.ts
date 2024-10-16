type Optional<T> = T | undefined;

declare class Nominal<T extends string> {
    #__brand: T;
}

type ExcludeComplementaryFields<T, U> = {
    [K in Exclude<keyof U, keyof T>]?: never;
};

type Discriminated<T, U> =
    | (T & ExcludeComplementaryFields<T, U>)
    | (U & ExcludeComplementaryFields<U, T>);

type KeyOfObject<T extends object> = keyof T extends never ? string : keyof T;

interface ObjectConstructor {
    keys<T extends object>(o: T): KeyOfObject<T>[];
}
