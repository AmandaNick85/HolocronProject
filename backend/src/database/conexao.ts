import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

let banco: DatabaseSync | null = null;

export function obterBanco(): DatabaseSync {
  if (banco) {
    return banco;
  }

  const caminho = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? './data/holocron.db');
  fs.mkdirSync(path.dirname(caminho), { recursive: true });

  banco = new DatabaseSync(caminho);
  banco.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS arquivos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      categoria TEXT NOT NULL,
      nome TEXT NOT NULL,
      imagem_url TEXT NOT NULL,
      descricao TEXT NOT NULL,
      status TEXT NOT NULL,
      progresso INTEGER NOT NULL,
      nota INTEGER NOT NULL,
      anotacao TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, item_id),
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_arquivos_usuario ON arquivos (user_id, updated_at DESC);
  `);

  return banco;
}

export interface UsuarioRegistro {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  criado_em: string;
}

export interface ArquivoRegistro {
  id: string;
  user_id: string;
  item_id: string;
  categoria: string;
  nome: string;
  imagem_url: string;
  descricao: string;
  status: string;
  progresso: number;
  nota: number;
  anotacao: string;
  updated_at: string;
}

export function usuarioPublico(usuario: UsuarioRegistro): { id: string; nome: string; email: string } {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

export function arquivoPublico(arquivo: ArquivoRegistro) {
  return {
    item_id: arquivo.item_id,
    categoria: arquivo.categoria,
    nome: arquivo.nome,
    imagem_url: arquivo.imagem_url,
    descricao: arquivo.descricao,
    status: arquivo.status,
    progresso: arquivo.progresso,
    nota: arquivo.nota,
    anotacao: arquivo.anotacao,
    updated_at: arquivo.updated_at,
  };
}
