import { CHAVES } from './chaves';
import { ler, gravar } from './storage';

const TTL_PADRAO = 30 * 60 * 1000;

interface Envelope<T> {
  salvoEm: number;
  valor: T;
}

function chaveSegura(nome: string): string {
  return `${CHAVES.cache}${nome.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

export async function comCache<T>(nome: string, buscar: () => Promise<T>, ttlMs = TTL_PADRAO): Promise<T> {
  const chave = chaveSegura(nome);
  const cache = await ler<Envelope<T>>(chave);
  const agora = Date.now();

  if (cache && typeof cache.salvoEm === 'number' && agora - cache.salvoEm < ttlMs) {
    return cache.valor;
  }

  try {
    const valor = await buscar();
    await gravar<Envelope<T>>(chave, { salvoEm: agora, valor });
    return valor;
  } catch (erro) {
    if (cache) {
      return cache.valor;
    }
    throw erro;
  }
}
