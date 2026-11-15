export const CHAVES = {
  usuario: 'holocron:v2:usuario',
  categoria: 'holocron:v2:categoria',
  buscas: 'holocron:v2:buscas',
  ultima: 'holocron:v2:ultima',
  filtro: 'holocron:v2:filtro',
  alianca: 'holocron:v2:alianca',
  politica: 'holocron:v2:politica',
  conflitos: 'holocron:v2:conflitos',
  capas: 'holocron:v2:capas',
  cache: 'holocron:v2:cache_',
} as const;

export const CHAVES_LEGADAS: Record<string, string> = {
  [CHAVES.usuario]: 'holocron_usuario',
  [CHAVES.categoria]: 'holocron_categoria',
  [CHAVES.buscas]: 'holocron_buscas',
  [CHAVES.ultima]: 'holocron_ultima',
  [CHAVES.filtro]: 'holocron_filtro_status',
  [CHAVES.alianca]: 'holocron_alianca',
};

export function chaveRascunho(itemId: string): string {
  const seguro = itemId.replace(/[^A-Za-z0-9._-]/g, '_');
  return `holocron:v2:rascunho:${seguro}`;
}

export type PoliticaConflito = 'manual' | 'ultima' | 'mesclar';

export function ehPolitica(valor: unknown): valor is PoliticaConflito {
  return valor === 'manual' || valor === 'ultima' || valor === 'mesclar';
}
