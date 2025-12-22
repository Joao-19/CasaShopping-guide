import md5 from 'md5';

export function encriptPassword(password: string) {
    return md5(password);
}