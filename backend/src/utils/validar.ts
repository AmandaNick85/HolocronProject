export const STATUS_VALIDOS = ['Para Explorar', 'Estudando', 'Dominado', 'Favorito'] as const;
export type StatusEstudo = (typeof STATUS_VALIDOS)[number];

export const CATEGORIAS = [
  'characters',
  'locations',
  'vehicles',
  'droids',
  'species',
  'creatures',
  'organizations',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function texto(valor: unknown, campo: string, maximo: number): string | { erro: string } {
  if (typeof valor !== 'string') {
    return { erro: `${campo} é obrigatório.` };
  }
  const limpo = valor.trim();
  if (!limpo) {
    return { erro: `${campo} é obrigatório.` };
  }
  if (limpo.length > maximo) {
    return { erro: `${campo} passa de ${maximo} caracteres.` };
  }
  return limpo;
}

export function emailValido(valor: unknown): string | { erro: string } {
  const lido = texto(valor, 'E-mail', 254);
  if (typeof lido !== 'string') {
    return lido;
  }
  const normalizado = lido.toLowerCase();
  if (!EMAIL.test(normalizado)) {
    return { erro: 'E-mail inválido.' };
  }
  return normalizado;
}

export function senhaValida(valor: unknown): string | { erro: string } {
  if (typeof valor !== 'string' || valor.length < 8) {
    return { erro: 'A senha precisa de pelo menos 8 caracteres.' };
  }
  if (valor.length > 72) {
    return { erro: 'A senha passa de 72 caracteres.' };
  }
  return valor;
}

export function categoriaValida(valor: unknown): Categoria | { erro: string } {
  if (typeof valor !== 'string' || !CATEGORIAS.includes(valor as Categoria)) {
    return { erro: 'Categoria inválida.' };
  }
  return valor as Categoria;
}

export function statusValido(valor: unknown): StatusEstudo | { erro: string } {
  if (typeof valor !== 'string' || !STATUS_VALIDOS.includes(valor as StatusEstudo)) {
    return { erro: 'Status inválido.' };
  }
  return valor as StatusEstudo;
}

export function inteiroEntre(
  valor: unknown,
  campo: string,
  minimo: number,
  maximo: number,
): number | { erro: string } {
  if (typeof valor !== 'number' || !Number.isInteger(valor)) {
    return { erro: `${campo} precisa ser um inteiro.` };
  }
  if (valor < minimo || valor > maximo) {
    return { erro: `${campo} fica entre ${minimo} e ${maximo}.` };
  }
  return valor;
}

export function falhou(valor: unknown): valor is { erro: string } {
  return typeof valor === 'object' && valor !== null && 'erro' in valor;
}
