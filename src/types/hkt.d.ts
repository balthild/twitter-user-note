interface TypeMap<T = any> {
    Getter: () => T;
    Setter: (value: T) => void;
    Mapper: (value: T) => T;
}

type Combinator = keyof TypeMap;

type Apply<T, F extends Combinator> = TypeMap<T>[F];

type ApplyChain<T, F extends Combinator[]> = F extends [] ? T
    : F extends [infer F0 extends Combinator, ...infer F1 extends Combinator[]] ? ApplyChain<Apply<T, F0>, F1>
    : never;

type ApplyDist<T, F extends Combinator> = T extends any ? Apply<T, F> : never;

type ApplyIndex<T, F extends Combinator> = {
    [K in keyof T]: Apply<T[K], F>;
};
