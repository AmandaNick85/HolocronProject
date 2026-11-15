import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import {
  arquivoPublico,
  obterBanco,
  type ArquivoRegistro,
} from '../database/conexao';
import type { RequisicaoAutenticada } from '../middlewares/authMiddleware';
import {
  categoriaValida,
  falhou,
  inteiroEntre,
  statusValido,
  texto,
  type StatusEstudo,
} from '../utils/validar';

function exigirUsuario(req: RequisicaoAutenticada, res: Response): string | null {
  if (!req.userId) {
    res.status(401).json({ erro: 'Sessão ausente.' });
    return null;
  }
  return req.userId;
}

export function listar(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;

  const linhas = obterBanco()
    .prepare('SELECT * FROM arquivos WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as unknown as ArquivoRegistro[];

  res.status(200).json(linhas.map(arquivoPublico));
}

export function criar(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;

  const itemId = texto(req.body?.item_id, 'item_id', 80);
  const categoria = categoriaValida(req.body?.categoria);
  const nome = texto(req.body?.nome, 'Nome', 200);
  const imagem = texto(req.body?.imagem_url, 'Imagem', 2000);
  const descricao = texto(req.body?.descricao, 'Descrição', 8000);

  if (falhou(itemId) || falhou(categoria) || falhou(nome) || falhou(imagem) || falhou(descricao)) {
    const primeiro = [itemId, categoria, nome, imagem, descricao].find(falhou);
    res.status(400).json({ erro: primeiro?.erro ?? 'Dados inválidos.' });
    return;
  }

  const statusInformado = req.body?.status === undefined ? 'Para Explorar' : statusValido(req.body.status);
  const progressoInformado = req.body?.progresso === undefined ? 0 : inteiroEntre(req.body.progresso, 'Progresso', 0, 100);
  const notaInformada = req.body?.nota === undefined ? 0 : inteiroEntre(req.body.nota, 'Nota', 0, 10);
  const anotacaoInformada =
    req.body?.anotacao === undefined || req.body?.anotacao === ''
      ? ''
      : texto(req.body.anotacao, 'Anotação', 4000);

  if (falhou(statusInformado) || falhou(progressoInformado) || falhou(notaInformada) || falhou(anotacaoInformada)) {
    const primeiro = [statusInformado, progressoInformado, notaInformada, anotacaoInformada].find(falhou);
    res.status(400).json({ erro: primeiro?.erro ?? 'Dados inválidos.' });
    return;
  }

  const banco = obterBanco();
  const duplicado = banco
    .prepare('SELECT id FROM arquivos WHERE user_id = ? AND item_id = ?')
    .get(userId, itemId) as { id: string } | undefined;

  if (duplicado) {
    res.status(409).json({ erro: 'Essa entrada já está no Holocron.' });
    return;
  }

  const registro: ArquivoRegistro = {
    id: randomUUID(),
    user_id: userId,
    item_id: itemId,
    categoria,
    nome,
    imagem_url: imagem,
    descricao,
    status: statusInformado as StatusEstudo,
    progresso: progressoInformado,
    nota: notaInformada,
    anotacao: anotacaoInformada,
    updated_at: new Date().toISOString(),
  };

  banco
    .prepare(
      `INSERT INTO arquivos (
        id, user_id, item_id, categoria, nome, imagem_url, descricao, status, progresso, nota, anotacao, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      registro.id,
      registro.user_id,
      registro.item_id,
      registro.categoria,
      registro.nome,
      registro.imagem_url,
      registro.descricao,
      registro.status,
      registro.progresso,
      registro.nota,
      registro.anotacao,
      registro.updated_at,
    );

  res.status(201).json(arquivoPublico(registro));
}

export function atualizar(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;

  const itemId = typeof req.params.itemId === 'string' ? req.params.itemId : '';
  if (!itemId) {
    res.status(400).json({ erro: 'item_id ausente.' });
    return;
  }

  const banco = obterBanco();
  const atual = banco
    .prepare('SELECT * FROM arquivos WHERE user_id = ? AND item_id = ?')
    .get(userId, itemId) as ArquivoRegistro | undefined;

  if (!atual) {
    res.status(404).json({ erro: 'Arquivo não encontrado no seu Holocron.' });
    return;
  }

  const corpo = req.body ?? {};
  const status = corpo.status === undefined ? atual.status : statusValido(corpo.status);
  const progresso = corpo.progresso === undefined ? atual.progresso : inteiroEntre(corpo.progresso, 'Progresso', 0, 100);
  const nota = corpo.nota === undefined ? atual.nota : inteiroEntre(corpo.nota, 'Nota', 0, 10);
  const anotacao =
    corpo.anotacao === undefined ? atual.anotacao : corpo.anotacao === '' ? '' : texto(corpo.anotacao, 'Anotação', 4000);

  if (falhou(status) || falhou(progresso) || falhou(nota) || falhou(anotacao)) {
    const primeiro = [status, progresso, nota, anotacao].find(falhou);
    res.status(400).json({ erro: primeiro?.erro ?? 'Dados inválidos.' });
    return;
  }

  const updatedAt = new Date().toISOString();
  banco
    .prepare(
      `UPDATE arquivos
       SET status = ?, progresso = ?, nota = ?, anotacao = ?, updated_at = ?
       WHERE user_id = ? AND item_id = ?`,
    )
    .run(status, progresso, nota, anotacao, updatedAt, userId, itemId);

  res.status(200).json(
    arquivoPublico({
      ...atual,
      status: status as string,
      progresso: progresso as number,
      nota: nota as number,
      anotacao: anotacao as string,
      updated_at: updatedAt,
    }),
  );
}

export function remover(req: RequisicaoAutenticada, res: Response): void {
  const userId = exigirUsuario(req, res);
  if (!userId) return;

  const itemId = typeof req.params.itemId === 'string' ? req.params.itemId : '';
  const resultado = obterBanco()
    .prepare('DELETE FROM arquivos WHERE user_id = ? AND item_id = ?')
    .run(userId, itemId);

  if (resultado.changes === 0) {
    res.status(404).json({ erro: 'Arquivo não encontrado no seu Holocron.' });
    return;
  }

  res.status(200).json({ ok: true });
}
