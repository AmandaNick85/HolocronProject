const PRIVADA =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

const LOCAL = /^(https?):\/\/(localhost|127\.0\.0\.1)(?::(\d+))?\/?$/i;

export function urlParaAparelho(configurada: string, plataforma: string, hostDoMetro: string | null): string {
  if (plataforma === 'web') {
    return configurada;
  }
  const partes = configurada.match(LOCAL);
  if (!partes || !hostDoMetro) {
    return configurada;
  }
  const ip = hostDoMetro.split(':')[0];
  if (!ip || ip === 'localhost' || ip === '127.0.0.1') {
    return configurada;
  }
  const porta = partes[3] ?? '3000';
  return `${partes[1].toLowerCase()}://${ip}:${porta}`;
}

export function urlApiPermitida(url: string, desenvolvimento: boolean): boolean {
  if (url.startsWith('https://')) {
    return true;
  }
  return desenvolvimento && PRIVADA.test(url);
}
