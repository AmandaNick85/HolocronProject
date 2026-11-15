import * as SQLite from 'expo-sqlite';
import type { ArquivoHolocron, Categoria, DeckUsuario, StatusEstudo } from '../types/starwars';
import { deckDe, ehCategoria, ehDeck, ehStatus } from '../types/starwars';
import { backendApi, statusHttp } from './backendApi';

export type OperacaoFila = 'criar' | 'atualizar' | 'remover';

interface LinhaArquivo {
  item_id: string;
  categoria: string;
  nome: string;
  imagem_url: string;
  descricao: string;
  status: string;
  progresso: number;
  nota: number;
  anotacao: string;
  deck?: string;
  deck_id?: string | null;
  updated_at: string;
}

interface LinhaFila {
  id: number;
  operacao: string;
  item_id: string;
  payload_json: string;
  timestamp: number;
}

let banco: SQLite.SQLiteDatabase | null = null;
let abertura: Promise<SQLite.SQLiteDatabase> | null = null;
let filaEmCurso: Promise<void> | null = null;

function colunaDuplicada(erro: unknown): boolean {
  const texto = erro instanceof Error ? erro.message : String(erro);
  return texto.toLowerCase().includes('duplicate column name');
}

async function garantirColuna(db: SQLite.SQLiteDatabase, nome: string, sql: string): Promise<void> {
  const encontradas = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM pragma_table_info('arquivos') WHERE name = ?`,
    nome,
  );
  if (encontradas.some((coluna) => coluna.name === nome)) {
    return;
  }
  try {
    await db.execAsync(sql);
  } catch (erro) {
    if (!colunaDuplicada(erro)) {
      throw erro;
    }
  }
}

function paraArquivo(linha: LinhaArquivo): ArquivoHolocron | null {
  if (!ehCategoria(linha.categoria) || !ehStatus(linha.status)) {
    return null;
  }
  return {
    item_id: linha.item_id,
    categoria: linha.categoria,
    nome: linha.nome,
    imagem_url: linha.imagem_url,
    descricao: linha.descricao,
    status: linha.status,
    progresso: linha.progresso,
    nota: linha.nota,
    anotacao: linha.anotacao,
    deck: deckDe(linha.deck),
    deck_id: typeof linha.deck_id === 'string' && linha.deck_id ? linha.deck_id : null,
    updated_at: linha.updated_at,
  };
}

async function abrirBanco(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('holocron.db');
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  } catch {
    // O modo WAL não existe em todo runtime. As tabelas seguem sem ele.
  }
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS arquivos (
      item_id TEXT PRIMARY KEY NOT NULL,
      categoria TEXT NOT NULL,
      nome TEXT NOT NULL,
      imagem_url TEXT NOT NULL,
      descricao TEXT NOT NULL,
      status TEXT NOT NULL,
      progresso INTEGER NOT NULL,
      nota INTEGER NOT NULL,
      anotacao TEXT NOT NULL,
      deck TEXT NOT NULL DEFAULT 'avulso',
      deck_id TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      faccao TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operacao TEXT NOT NULL,
      item_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
  await garantirColuna(db, 'deck', `ALTER TABLE arquivos ADD COLUMN deck TEXT NOT NULL DEFAULT 'avulso'`);
  await garantirColuna(db, 'deck_id', `ALTER TABLE arquivos ADD COLUMN deck_id TEXT`);
  banco = db;
  return db;
}

export function iniciarBanco(): Promise<SQLite.SQLiteDatabase> {
  if (banco) {
    return Promise.resolve(banco);
  }
  if (!abertura) {
    abertura = abrirBanco().catch((erro: unknown) => {
      abertura = null;
      throw erro;
    });
  }
  return abertura;
}

async function db(): Promise<SQLite.SQLiteDatabase> {
  return iniciarBanco();
}

export async function listarLocais(): Promise<ArquivoHolocron[]> {
  const conexao = await db();
  const linhas = await conexao.getAllAsync<LinhaArquivo>(
    'SELECT item_id, categoria, nome, imagem_url, descricao, status, progresso, nota, anotacao, deck, deck_id, updated_at FROM arquivos ORDER BY updated_at DESC',
  );
  return linhas.map(paraArquivo).filter((item): item is ArquivoHolocron => item !== null);
}

export async function salvarLocal(arquivo: ArquivoHolocron): Promise<void> {
  const conexao = await db();
  await conexao.withTransactionAsync(async () => {
    await conexao.runAsync('DELETE FROM arquivos WHERE item_id = ?', arquivo.item_id);
    await conexao.runAsync(
      `INSERT INTO arquivos (
        item_id, categoria, nome, imagem_url, descricao, status, progresso, nota, anotacao, deck, deck_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      arquivo.item_id,
      arquivo.categoria,
      arquivo.nome,
      arquivo.imagem_url,
      arquivo.descricao,
      arquivo.status,
      arquivo.progresso,
      arquivo.nota,
      arquivo.anotacao,
      arquivo.deck,
      arquivo.deck_id,
      arquivo.updated_at,
    );
  });
}

export async function removerLocal(itemId: string): Promise<void> {
  const conexao = await db();
  await conexao.runAsync('DELETE FROM arquivos WHERE item_id = ?', itemId);
}

export async function substituirLocais(lista: ArquivoHolocron[]): Promise<void> {
  const conexao = await db();
  await conexao.withTransactionAsync(async () => {
    await conexao.runAsync('DELETE FROM arquivos');
    for (const arquivo of lista) {
      await conexao.runAsync(
        `INSERT INTO arquivos (
          item_id, categoria, nome, imagem_url, descricao, status, progresso, nota, anotacao, deck, deck_id, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        arquivo.item_id,
        arquivo.categoria,
        arquivo.nome,
        arquivo.imagem_url,
        arquivo.descricao,
        arquivo.status,
        arquivo.progresso,
        arquivo.nota,
        arquivo.anotacao,
        arquivo.deck,
        arquivo.deck_id,
        arquivo.updated_at,
      );
    }
  });
}

export async function enfileirar(operacao: OperacaoFila, itemId: string, payload: unknown): Promise<void> {
  const conexao = await db();
  await conexao.runAsync(
    'INSERT INTO sync_queue (operacao, item_id, payload_json, timestamp) VALUES (?, ?, ?, ?)',
    operacao,
    itemId,
    JSON.stringify(payload),
    Date.now(),
  );
}

export async function contarFila(): Promise<number> {
  const conexao = await db();
  const linha = await conexao.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM sync_queue');
  return linha?.total ?? 0;
}

function lerPayload(bruto: string): ArquivoHolocron | null {
  try {
    const valor: unknown = JSON.parse(bruto);
    if (!valor || typeof valor !== 'object') {
      return null;
    }
    const item = valor as Partial<ArquivoHolocron>;
    if (
      typeof item.item_id !== 'string' ||
      typeof item.categoria !== 'string' ||
      !ehCategoria(item.categoria) ||
      typeof item.nome !== 'string' ||
      typeof item.status !== 'string' ||
      !ehStatus(item.status)
    ) {
      return null;
    }
    return {
      item_id: item.item_id,
      categoria: item.categoria as Categoria,
      nome: item.nome,
      imagem_url: typeof item.imagem_url === 'string' ? item.imagem_url : '',
      descricao: typeof item.descricao === 'string' ? item.descricao : '',
      status: item.status as StatusEstudo,
      progresso: typeof item.progresso === 'number' ? item.progresso : 0,
      nota: typeof item.nota === 'number' ? item.nota : 0,
      anotacao: typeof item.anotacao === 'string' ? item.anotacao : '',
      deck: deckDe(item.deck),
      deck_id: typeof item.deck_id === 'string' && item.deck_id ? item.deck_id : null,
      updated_at: typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function despachar(linha: LinhaFila): Promise<void> {
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
  const conexao = await db();
  const linhas = await conexao.getAllAsync<LinhaFila>(
    'SELECT id, operacao, item_id, payload_json, timestamp FROM sync_queue ORDER BY id ASC',
  );

  for (const linha of linhas) {
    try {
      await despachar(linha);
      await conexao.runAsync('DELETE FROM sync_queue WHERE id = ?', linha.id);
    } catch (erro) {
      const status = statusHttp(erro);
      if (status === 409 && linha.operacao === 'criar') {
        await conexao.runAsync('DELETE FROM sync_queue WHERE id = ?', linha.id);
        continue;
      }
      if (status === 404 && linha.operacao === 'remover') {
        await conexao.runAsync('DELETE FROM sync_queue WHERE id = ?', linha.id);
        continue;
      }
      if (status === 400) {
        await conexao.runAsync('DELETE FROM sync_queue WHERE id = ?', linha.id);
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

function paraDeck(linha: { id: string; nome: string; faccao: string }): DeckUsuario | null {
  if (!ehDeck(linha.faccao) || !linha.id || !linha.nome) {
    return null;
  }
  return { id: linha.id, nome: linha.nome, faccao: linha.faccao };
}

export async function listarDecks(): Promise<DeckUsuario[]> {
  const conexao = await db();
  const linhas = await conexao.getAllAsync<{ id: string; nome: string; faccao: string }>(
    'SELECT id, nome, faccao FROM decks ORDER BY nome COLLATE NOCASE',
  );
  return linhas.map(paraDeck).filter((item): item is DeckUsuario => item !== null);
}

export async function substituirDecks(lista: DeckUsuario[]): Promise<void> {
  const conexao = await db();
  await conexao.withTransactionAsync(async () => {
    await conexao.runAsync('DELETE FROM decks');
    for (const deck of lista) {
      await conexao.runAsync('INSERT INTO decks (id, nome, faccao) VALUES (?, ?, ?)', deck.id, deck.nome, deck.faccao);
    }
  });
}

export async function salvarDeck(deck: DeckUsuario): Promise<void> {
  const conexao = await db();
  await conexao.withTransactionAsync(async () => {
    await conexao.runAsync('DELETE FROM decks WHERE id = ?', deck.id);
    await conexao.runAsync('INSERT INTO decks (id, nome, faccao) VALUES (?, ?, ?)', deck.id, deck.nome, deck.faccao);
  });
}

export async function removerDeckLocal(id: string): Promise<void> {
  const conexao = await db();
  await conexao.runAsync('DELETE FROM decks WHERE id = ?', id);
}

export async function puxarDecks(): Promise<DeckUsuario[] | null> {
  try {
    const resposta = await backendApi.get<unknown>('/decks');
    if (!Array.isArray(resposta.data)) {
      return null;
    }
    return resposta.data
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const linha = item as { id?: string; nome?: string; faccao?: string };
        if (typeof linha.id !== 'string' || typeof linha.nome !== 'string' || typeof linha.faccao !== 'string') {
          return null;
        }
        return paraDeck({ id: linha.id, nome: linha.nome, faccao: linha.faccao });
      })
      .filter((item): item is DeckUsuario => item !== null);
  } catch {
    return null;
  }
}

export async function limparBanco(): Promise<void> {
  const conexao = await db();
  await conexao.execAsync('DELETE FROM arquivos; DELETE FROM sync_queue; DELETE FROM decks;');
}

export async function puxarServidor(): Promise<ArquivoHolocron[] | null> {
  try {
    const resposta = await backendApi.get<unknown>('/arquivos');
    if (!Array.isArray(resposta.data)) {
      return null;
    }
    const lista = resposta.data
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        return paraArquivo(item as LinhaArquivo);
      })
      .filter((item): item is ArquivoHolocron => item !== null);
    return lista;
  } catch {
    return null;
  }
}
