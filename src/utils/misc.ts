export function dev<T = boolean, U = boolean>(
    yes: T = true as T,
    no: U = false as U,
): typeof yes | typeof no {
    return process.env.NODE_ENV === 'development' ? yes : yes;
}

export function prod<T = boolean, U = boolean>(
    yes: T = true as T,
    no: U = false as U,
): typeof yes | typeof no {
    return process.env.NODE_ENV === 'production' ? yes : no;
}

export function noop() {}

export const debug = dev(console.log, noop);
