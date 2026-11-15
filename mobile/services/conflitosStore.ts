import type { ConflitoEstudo } from './conflito';
import { CHAVES } from './chaves';
import { apagar, gravar, ler } from './storage';

function ehConflito(valor: unknown): valor is ConflitoEstudo {
  if (!valor || typeof valor !== 'object') {
    return false;
  }
  const item = valor as Partial<ConflitoEstudo>;
  return typeof item.itemId === 'string' && typeof item.nome === 'string' && Boolean(item.local) && Boolean(item.remoto);
}

export async function listarConflitos(): Promise<ConflitoEstudo[]> {
  const salvo = await ler<unknown>(CHAVES.conflitos);
  if (!Array.isArray(salvo)) {
    return [];
  }
  return salvo.filter(ehConflito);
}

export async function guardarConflitos(lista: ConflitoEstudo[]): Promise<void> {
  const porId = new Map<string, ConflitoEstudo>();
  for (const item of lista) {
    porId.set(item.itemId, item);
  }
  await gravar(CHAVES.conflitos, [...porId.values()]);
}

export async function acrescentarConflitos(novos: ConflitoEstudo[]): Promise<ConflitoEstudo[]> {
  const atual = await listarConflitos();
  const porId = new Map(atual.map((item) => [item.itemId, item]));
  for (const item of novos) {
    porId.set(item.itemId, item);
  }
  const lista = [...porId.values()];
  await guardarConflitos(lista);
  return lista;
}

export async function removerConflito(itemId: string): Promise<void> {
  const atual = await listarConflitos();
  await guardarConflitos(atual.filter((item) => item.itemId !== itemId));
}

export async function limparConflitos(): Promise<void> {
  await apagar(CHAVES.conflitos);
}
