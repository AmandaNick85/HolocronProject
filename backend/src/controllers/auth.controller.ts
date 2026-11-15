import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { obterBanco, usuarioPublico, type UsuarioRegistro } from '../database/conexao';
import { assinarToken } from '../utils/jwt';
import { emailValido, falhou, senhaValida, texto } from '../utils/validar';

export function registrar(req: Request, res: Response): void {
  const nome = texto(req.body?.nome, 'Nome', 80);
  const email = emailValido(req.body?.email);
  const senha = senhaValida(req.body?.senha);

  if (falhou(nome) || falhou(email) || falhou(senha)) {
    const erro = falhou(nome) ? nome.erro : falhou(email) ? email.erro : (senha as { erro: string }).erro;
    res.status(400).json({ erro });
    return;
  }

  const banco = obterBanco();
  const existente = banco.prepare('SELECT id FROM usuarios WHERE email = ?').get(email) as { id: string } | undefined;
  if (existente) {
    res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    return;
  }

  const usuario: UsuarioRegistro = {
    id: randomUUID(),
    nome,
    email,
    senha_hash: bcrypt.hashSync(senha, 10),
    criado_em: new Date().toISOString(),
  };

  banco
    .prepare('INSERT INTO usuarios (id, nome, email, senha_hash, criado_em) VALUES (?, ?, ?, ?, ?)')
    .run(usuario.id, usuario.nome, usuario.email, usuario.senha_hash, usuario.criado_em);

  const user = usuarioPublico(usuario);
  res.status(201).json({ user, token: assinarToken(user.id) });
}

export function entrar(req: Request, res: Response): void {
  const email = emailValido(req.body?.email);
  const senha = senhaValida(req.body?.senha);

  if (falhou(email) || falhou(senha)) {
    res.status(400).json({ erro: falhou(email) ? email.erro : (senha as { erro: string }).erro });
    return;
  }

  const banco = obterBanco();
  const usuario = banco.prepare('SELECT * FROM usuarios WHERE email = ?').get(email) as UsuarioRegistro | undefined;

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    return;
  }

  res.status(200).json({ user: usuarioPublico(usuario), token: assinarToken(usuario.id) });
}
