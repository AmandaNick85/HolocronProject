import jwt from 'jsonwebtoken';

function segredo(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error('JWT_SECRET ausente ou curto demais. Use pelo menos 32 caracteres.');
  }
  return valor;
}

export function assinarToken(userId: string): string {
  return jwt.sign({ userId }, segredo(), { expiresIn: '7d', algorithm: 'HS256' });
}

export function lerToken(token: string): { userId: string } {
  const payload = jwt.verify(token, segredo(), { algorithms: ['HS256'] });
  if (typeof payload === 'string' || typeof payload.userId !== 'string') {
    throw new Error('Payload inválido.');
  }
  return { userId: payload.userId };
}
