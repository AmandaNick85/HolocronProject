const PRIVADA =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

export function urlApiPermitida(url: string, desenvolvimento: boolean): boolean {
  if (url.startsWith('https://')) {
    return true;
  }
  return desenvolvimento && PRIVADA.test(url);
}
