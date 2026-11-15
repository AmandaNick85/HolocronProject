import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { obterBanco } from '../database/conexao';
import type { RequisicaoAutenticada } from '../middlewares/authMiddleware';
import { deckValido, falhou, texto } from '../utils/validar';

function exigirUsuario(req: RequisicaoAutenticada, res: Response): string | null {
  if (!req.userId) {
    res.status(401).json({ erro: 'Sessão ausente.' });
    return null;
  }
  return req.userId;
}

export function listarDecks(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;
  const linhas = obterBanco()
    .prepare('SELECT id, nome, faccao, criado_em FROM decks WHERE user_id = ? ORDER BY criado_em DESC')
    .all(userId);
  res.status(200).json(linhas);
}

export function criarDeck(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;
  const nome = texto(req.body?.nome, 'Nome do deck', 40);
  const faccao = deckValido(req.body?.faccao);
  if (falhou(nome)) {
    res.status(400).json({ erro: nome.erro });
    return;
  }
  if (falhou(faccao) || faccao === 'avulso') {
    res.status(400).json({ erro: 'Escolha o lado do deck.' });
    return;
  }
  const deck = {
    id: randomUUID(),
    user_id: userId,
    nome,
    faccao,
    criado_em: new Date().toISOString(),
  };
  obterBanco()
    .prepare('INSERT INTO decks (id, user_id, nome, faccao, criado_em) VALUES (?, ?, ?, ?, ?)')
    .run(deck.id, deck.user_id, deck.nome, deck.faccao, deck.criado_em);
  res.status(201).json({ id: deck.id, nome: deck.nome, faccao: deck.faccao, criado_em: deck.criado_em });
}

export function removerDeck(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;
  const id = typeof req.params.id === 'string' ? req.params.id : '';
  const banco = obterBanco();
  const emUso = banco
    .prepare('SELECT item_id FROM arquivos WHERE user_id = ? AND deck_id = ?')
    .get(userId, id) as { item_id: string } | undefined;
  if (emUso) {
    res.status(409).json({ erro: 'Esvazie o deck antes de apagar.' });
    return;
  }
  const resultado = banco.prepare('DELETE FROM decks WHERE user_id = ? AND id = ?').run(userId, id);
  if (resultado.changes === 0) {
    res.status(404).json({ erro: 'Deck não encontrado.' });
    return;
  }
  res.status(200).json({ ok: true });
}
