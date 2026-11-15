import type { ArquivoHolocron, DeckUsuario } from '../types/starwars';
import { deckDe, ehCategoria, ehDeck, ehStatus } from '../types/starwars';
import { backendApi, statusHttp } from './backendApi';
import { gravar, ler } from './storage';

export type OperacaoFila = 'criar' | 'atualizar' | 'remover';

interface ItemFila {
  id: number;
  operacao: OperacaoFila;
  item_id: string;
  payload_json: string;
  timestamp: number;
}

interface Espelho {
  arquivos: ArquivoHolocron[];
  decks: DeckUsuario[];
  fila: ItemFila[];
  seq: number;
}

const CHAVE = 'holocron_web_db';

let arquivos: ArquivoHolocron[] = [];
let decks: DeckUsuario[] = [];
let fila: ItemFila[] = [];
let seq = 1;
let pronto = false;
let filaEmCurso: Promise<void> | null = null;

function normalizar(item: ArquivoHolocron): ArquivoHolocron {
  return {
    ...item,
    deck: deckDe(item.deck),
    deck_id: typeof item.deck_id === 'string' && item.deck_id ? item.deck_id : null,
  };
}

function paraDeck(valor: unknown): DeckUsuario | null {
  if (!valor || typeof valor !== 'object') {
    return null;
  }
  const item = valor as Partial<DeckUsuario>;
  if (typeof item.id !== 'string' || typeof item.nome !== 'string' || typeof item.faccao !== 'string' || !ehDeck(item.faccao)) {
    return null;
  }
  return { id: item.id, nome: item.nome, faccao: item.faccao };
}
function ehArquivo(valor: unknown): valor is ArquivoHolocron {
  if (!valor || typeof valor !== 'object') {
    return false;
  }
  const item = valor as Partial<ArquivoHolocron>;
  return (
    typeof item.item_id === 'string' &&
    typeof item.categoria === 'string' &&
    ehCategoria(item.categoria) &&
    typeof item.nome === 'string' &&
    typeof item.imagem_url === 'string' &&
    typeof item.descricao === 'string' &&
    typeof item.status === 'string' &&
    ehStatus(item.status) &&
    typeof item.progresso === 'number' &&
    typeof item.nota === 'number' &&
    typeof item.anotacao === 'string' &&
    typeof item.updated_at === 'string'
  );
}

async function hidratar(): Promise<void> {
  if (pronto) {
    return;
  }
  const salvo = await ler<Espelho>(CHAVE);
  if (salvo && Array.isArray(salvo.arquivos) && Array.isArray(salvo.fila)) {
    arquivos = salvo.arquivos.filter(ehArquivo).map(normalizar);
    decks = Array.isArray(salvo.decks) ? salvo.decks.map(paraDeck).filter((item): item is DeckUsuario => item !== null) : [];
    fila = salvo.fila.filter(
      (item) =>
        item &&
        typeof item.id === 'number' &&
        (item.operacao === 'criar' || item.operacao === 'atualizar' || item.operacao === 'remover'),
    );
    seq = typeof salvo.seq === 'number' ? salvo.seq : 1;
  }
  pronto = true;
}

async function persistir(): Promise<void> {
  await gravar<Espelho>(CHAVE, { arquivos, decks, fila, seq });
}

export async function iniciarBanco(): Promise<void> {
  await hidratar();
}

export async function listarLocais(): Promise<ArquivoHolocron[]> {
  await hidratar();
  return [...arquivos].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function salvarLocal(arquivo: ArquivoHolocron): Promise<void> {
  await hidratar();
  arquivos = [arquivo, ...arquivos.filter((item) => item.item_id !== arquivo.item_id)];
  await persistir();
}

export async function removerLocal(itemId: string): Promise<void> {
  await hidratar();
  arquivos = arquivos.filter((item) => item.item_id !== itemId);
  await persistir();
}

export async function substituirLocais(lista: ArquivoHolocron[]): Promise<void> {
  await hidratar();
  arquivos = lista.filter(ehArquivo).map(normalizar);
  await persistir();
}

export async function enfileirar(operacao: OperacaoFila, itemId: string, payload: unknown): Promise<void> {
  await hidratar();
  fila.push({
    id: seq,
    operacao,
    item_id: itemId,
    payload_json: JSON.stringify(payload),
    timestamp: Date.now(),
  });
  seq += 1;
  await persistir();
}

export async function contarFila(): Promise<number> {
  await hidratar();
  return fila.length;
}

function lerPayload(bruto: string): ArquivoHolocron | null {
  try {
    const valor: unknown = JSON.parse(bruto);
    return ehArquivo(valor) ? normalizar(valor) : null;
  } catch {
    return null;
  }
}

async function despachar(linha: ItemFila): Promise<void> {
  if (linha.operacao === 'remover') {
    await backendApi.delete(`/arquivos/${encodeURIComponent(linha.item_id)}`);
    return;
  }
  const payload = lerPayload(linha.payload_json);
  if (!payload) {
    return;
  }
  if (linha.operacao === 'criar') {
    await backendApi.post('/arquivos', payload);
    return;
  }
  await backendApi.put(`/arquivos/${encodeURIComponent(linha.item_id)}`, {
    status: payload.status,
    progresso: payload.progresso,
    nota: payload.nota,
    anotacao: payload.anotacao,
    deck: payload.deck,
    deck_id: payload.deck_id,
  });
}

async function executarFila(): Promise<void> {
  await hidratar();
  const pendentes = [...fila].sort((a, b) => a.id - b.id);
  for (const linha of pendentes) {
    try {
      await despachar(linha);
      fila = fila.filter((item) => item.id !== linha.id);
      await persistir();
    } catch (erro) {
      const status = statusHttp(erro);
      if (
        (status === 409 && linha.operacao === 'criar') ||
        (status === 404 && linha.operacao === 'remover') ||
        status === 400
      ) {
        fila = fila.filter((item) => item.id !== linha.id);
        await persistir();
        continue;
      }
      break;
    }
  }
}

export function sincronizarFila(): Promise<void> {
  if (filaEmCurso) {
    return filaEmCurso;
  }
  filaEmCurso = executarFila().finally(() => {
    filaEmCurso = null;
  });
  return filaEmCurso;
}

export async function limparBanco(): Promise<void> {
  arquivos = [];
  decks = [];
  fila = [];
  seq = 1;
  pronto = true;
  await persistir();
}

export async function listarDecks(): Promise<DeckUsuario[]> {
  await hidratar();
  return [...decks];
}

export async function substituirDecks(lista: DeckUsuario[]): Promise<void> {
  await hidratar();
  decks = lista.map((item) => paraDeck(item)).filter((item): item is DeckUsuario => item !== null);
  await persistir();
}

export async function salvarDeck(deck: DeckUsuario): Promise<void> {
  await hidratar();
  decks = [deck, ...decks.filter((item) => item.id !== deck.id)];
  await persistir();
}

export async function removerDeckLocal(id: string): Promise<void> {
  await hidratar();
  decks = decks.filter((item) => item.id !== id);
  await persistir();
}

export async function puxarDecks(): Promise<DeckUsuario[] | null> {
  try {
    const resposta = await backendApi.get<unknown>('/decks');
    if (!Array.isArray(resposta.data)) {
      return null;
    }
    return resposta.data.map(paraDeck).filter((item): item is DeckUsuario => item !== null);
  } catch {
    return null;
  }
}

export async function puxarServidor(): Promise<ArquivoHolocron[] | null> {
  try {
    const resposta = await backendApi.get<unknown>('/arquivos');
    if (!Array.isArray(resposta.data)) {
      return null;
    }
    const lista = resposta.data.filter(ehArquivo).map(normalizar);
    return lista;
  } catch {
    return null;
  }
}
