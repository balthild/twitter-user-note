export function isDev() {
    return process.env.NODE_ENV === 'development';
}

export function isProd() {
    return process.env.NODE_ENV === 'production';
}

export function noop() {}

export const devLog = isDev() ? console.log : noop;
