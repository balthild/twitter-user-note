interface ObjectConstructor {
    keys<T extends object>(o: T): KeyOfObject<T>[];
}

type Optional<T> = T | undefined;

type ValueOf<T> = T[keyof T];

type KeyOfObject<T extends object> = keyof T extends never ? string : keyof T;

type AllKeyOf<T> = T extends Record<infer K, any> ? K : never;

type ComplementaryFields<T, U> = {
    [K in Exclude<AllKeyOf<U>, keyof T>]?: never;
};

type StrictComplementaryFields<T, U> = {
    [K in Exclude<AllKeyOf<U>, keyof T>]: never;
};

type Discriminated<T, U> =
    | T & ComplementaryFields<T, U>
    | U & ComplementaryFields<U, T>;

type DiscriminatedMap<Map> = {
    [Tag in keyof Map]: Map[Tag] & StrictComplementaryFields<Map[Tag], ValueOf<Map>>;
};
