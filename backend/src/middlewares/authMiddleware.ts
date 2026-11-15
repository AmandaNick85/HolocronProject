import type { NextFunction, Request, Response } from 'express';
import { lerToken } from '../utils/jwt';

export interface RequisicaoAutenticada extends Request {
  userId?: string;
}

export function authMiddleware(req: RequisicaoAutenticada, res: Response, next: NextFunction): void {
  const cabecalho = req.header('authorization') ?? '';
  const [esquema, token] = cabecalho.split(' ');

  if (esquema !== 'Bearer' || !token) {
    res.status(401).json({ erro: 'Token ausente.' });
    return;
  }

  try {
    const payload = lerToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}
