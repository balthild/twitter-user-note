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

export function module(meta: ImportMeta) {
    const prefix = 'file:///src/';

    if (!meta.url.startsWith(prefix)) {
        throw new Error('The module must be in the src folder');
    }

    const path = meta.url.substring(prefix.length);

    return path.replace(/(\.[jt]sx?)?(\?.*)?$/, '');
}

export function download(name: string, data: string) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.style.display = 'none';
    link.href = url;
    link.download = name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function keyset<T extends object[]>(...objects: T) {
    const keys = new Set<KeyOfUnion<T[number]>>();

    for (const object of objects) {
        Object.keys(object).forEach((x) => keys.add(x as any));
    }

    return keys;
}
