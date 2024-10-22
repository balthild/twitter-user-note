interface HKT<T = any> {
}

type Apply<T, F extends keyof HKT> = HKT<T>[F];

type ApplyMap<Map, F extends keyof HKT> = {
    [K in keyof Map]: Apply<Map[K], F>;
};
